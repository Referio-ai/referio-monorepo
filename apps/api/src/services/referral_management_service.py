import asyncio
from typing import Optional, Dict, List, Any
from uuid import UUID
from datetime import datetime, date
from supabase import AsyncClient
from fastapi import HTTPException

from src.crud.referrals import referrals_crud
from src.schemas.referrals import Referral, ReferralWithDetails, ReferralWithDetailsPagination
from src.schemas.patients import Patient
from src.utils.supabase.supabase_utils import generate_signed_url


class ReferralManagementService:
    """Service for managing referral operations and filtering"""

    @staticmethod
    async def _generate_document_signed_urls(
        db: AsyncClient,
        documents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generate fresh signed URLs for documents
        
        Args:
            db: Database client
            documents: List of document records from database
            
        Returns:
            List of documents with fresh signed URLs
        """
        try:
            updated_documents = []
            for doc in documents:
                # Create a copy of the document
                updated_doc = doc.copy()
                
                # Try to generate a fresh signed URL
                try:
                    # Extract file path from the stored source URL
                    source_url = doc.get('source', '')
                    if source_url and '/object/sign/' in source_url:
                        # Parse the path from Supabase signed URL format
                        url_parts = source_url.split("/object/sign/")
                        if len(url_parts) > 1:
                            path_part = url_parts[1].split("?")[0]  # Remove query parameters
                            bucket_name = "referral-documents"  # Default bucket
                            
                            # Remove bucket name from path if it's included
                            if path_part.startswith(f"{bucket_name}/"):
                                file_path = path_part[len(f"{bucket_name}/"):]
                            else:
                                file_path = path_part
                            
                            # Generate fresh signed URL
                            fresh_signed_url = await generate_signed_url(
                                file_object=file_path,
                                bucket_name=bucket_name
                            )
                            updated_doc['signed_url'] = fresh_signed_url
                        else:
                            # Fallback to original source if parsing fails
                            updated_doc['signed_url'] = source_url
                    else:
                        # If no source URL or invalid format, keep original
                        updated_doc['signed_url'] = source_url
                        
                except Exception as e:
                    print(f"Error generating signed URL for document {doc.get('document_id')}: {str(e)}")
                    # Fallback to original source URL
                    updated_doc['signed_url'] = doc.get('source', '')
                
                updated_documents.append(updated_doc)
            
            return updated_documents
            
        except Exception as e:
            print(f"Error in _generate_document_signed_urls: {str(e)}")
            # Return original documents if signed URL generation fails
            return documents

    @staticmethod
    async def get_scanned_referrals_paginated(
        db: AsyncClient,
        page: int = 1,
        page_size: int = 10,
        search: str = "",
        status: Optional[str] = None
    ) -> ReferralWithDetailsPagination:
        """
        Get paginated scanned referrals with patient and facility details
        
        Args:
            db: Database client
            page: Page number starting from 1
            page_size: Number of items per page
            search: Search term to filter referrals (searches referral_slug, referral_batch_prefix, 
                   patient name, patient DOB, and doctor name)
            status: Optional status filter for referrals
            
        Returns:
            ReferralWithDetailsPagination containing scanned referrals and pagination metadata
        """
        try:
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Build base query for scanned referrals with patient ID only
            base_query = (
                db.table("referrals")
                .select("*")
                .eq("deleted", False)
                .eq("referral_scanned", True)  # Only scanned referrals
                .not_.is_("patient_id", "null")  # Must have patient ID
            )
            
            # Add status filter if provided
            if status:
                base_query = base_query.eq("referral_status", status)
            
            # Handle search functionality - optimize for database-level search
            if search:
                # Get referral IDs that match the search criteria
                search_referral_ids = await ReferralManagementService._get_search_referral_ids(db, search, status)
                
                if not search_referral_ids:
                    # No results found for search
                    return ReferralWithDetailsPagination(
                        items=[],
                        pagination={
                            "total_count": 0,
                            "total_pages": 1,
                            "current_page": page,
                            "page_size": page_size,
                            "has_next": False,
                            "has_previous": False
                        }
                    )
                
                # Use the search results to filter the main query
                search_query = base_query.in_("referral_id", search_referral_ids)
                total_count = len(search_referral_ids)
            else:
                search_query = base_query
                # Get total count for non-search queries
                count_query = (
                    db.table("referrals")
                    .select("*", count='exact')
                    .eq("deleted", False)
                    .eq("referral_scanned", True)
                    .not_.is_("patient_id", "null")
                )
                
                # Add status filter to count query if provided
                if status:
                    count_query = count_query.eq("referral_status", status)
                
                count_result = await count_query.execute()
                total_count = count_result.count if count_result.count is not None else 0
            
            # Get paginated data with ordering (most recently scanned first)
            data_result = await (
                search_query
                .order("referral_scanned_date.desc.nullslast")
                .order("referral_submitted_date.desc.nullslast")
                .range(offset, offset + page_size - 1)
                .execute()
            )
            
            if not data_result.data:
                # Return empty result if no data
                return ReferralWithDetailsPagination(
                    items=[],
                    pagination={
                        "total_count": 0,
                        "total_pages": 1,
                        "current_page": page,
                        "page_size": page_size,
                        "has_next": False,
                        "has_previous": False
                    }
                )
            
            # Extract all unique IDs for batch queries
            referral_ids = [str(row['referral_id']) for row in data_result.data]
            patient_ids = [str(row['patient_id']) for row in data_result.data if row.get('patient_id')]
            outbound_facility_ids = [str(row['referral_outbound_facility_id']) for row in data_result.data if row.get('referral_outbound_facility_id')]
            inbound_facility_ids = [str(row['referral_inbound_facility_id']) for row in data_result.data if row.get('referral_inbound_facility_id')]
            
            # Batch fetch all related data
            batch_results = await asyncio.gather(
                # Fetch patients data
                db.table("patients").select("patient_id, patient_fname, patient_mname, patient_lname, patient_dob, patient_contact_phone, patient_contact_email, patient_gender, patient_insurance_member_id").in_("patient_id", patient_ids).execute() if patient_ids else asyncio.sleep(0),
                # Fetch outbound facilities data
                db.table("facility_entity").select("facility_id, facility_name").in_("facility_id", outbound_facility_ids).execute() if outbound_facility_ids else asyncio.sleep(0),
                # Fetch inbound facilities data
                db.table("facility_entity").select("facility_id, facility_name").in_("facility_id", inbound_facility_ids).execute() if inbound_facility_ids else asyncio.sleep(0),
                # Fetch documents data
                db.table("documents").select("document_id, created_at, source, document_category, referral_id").in_("referral_id", referral_ids).execute() if referral_ids else asyncio.sleep(0)
            )
            
            # Process batch results
            patients_data = batch_results[0].data if batch_results[0] and hasattr(batch_results[0], 'data') else []
            outbound_facilities_data = batch_results[1].data if batch_results[1] and hasattr(batch_results[1], 'data') else []
            inbound_facilities_data = batch_results[2].data if batch_results[2] and hasattr(batch_results[2], 'data') else []
            documents_data = batch_results[3].data if batch_results[3] and hasattr(batch_results[3], 'data') else []
            
            # Create lookup dictionaries for O(1) access
            patients_lookup = {str(p['patient_id']): p for p in patients_data}
            outbound_facilities_lookup = {str(f['facility_id']): f['facility_name'] for f in outbound_facilities_data}
            inbound_facilities_lookup = {str(f['facility_id']): f['facility_name'] for f in inbound_facilities_data}
            documents_lookup = {}
            for doc in documents_data:
                referral_id = str(doc['referral_id'])
                if referral_id not in documents_lookup:
                    documents_lookup[referral_id] = []
                documents_lookup[referral_id].append(doc)
            
            # Generate fresh signed URLs for all documents in batch
            all_documents = []
            for docs in documents_lookup.values():
                all_documents.extend(docs)
            
            if all_documents:
                fresh_documents = await ReferralManagementService._generate_document_signed_urls(db, all_documents)
                # Create lookup for fresh documents
                fresh_docs_lookup = {}
                for doc in fresh_documents:
                    referral_id = str(doc.get('referral_id', ''))
                    if referral_id not in fresh_docs_lookup:
                        fresh_docs_lookup[referral_id] = []
                    fresh_docs_lookup[referral_id].append(doc)
            else:
                fresh_docs_lookup = {}
            
            # Transform results to ReferralWithDetails objects
            items = []
            for row in data_result.data:
                # Get facility names from lookup
                outbound_facility_name = outbound_facilities_lookup.get(str(row.get('referral_outbound_facility_id')))
                inbound_facility_name = inbound_facilities_lookup.get(str(row.get('referral_inbound_facility_id')))
                
                # Get patient information from lookup
                patient = None
                if row.get('patient_id'):
                    patient_data = patients_lookup.get(str(row['patient_id']))
                    if patient_data:
                        patient = Patient(
                            patient_id=row['patient_id'],
                            patient_fname=patient_data['patient_fname'],
                            patient_mname=patient_data.get('patient_mname'),
                            patient_lname=patient_data['patient_lname'],
                            patient_dob=patient_data['patient_dob'],
                            patient_contact_phone=patient_data['patient_contact_phone'],
                            patient_contact_email=patient_data['patient_contact_email'],
                            patient_gender=patient_data['patient_gender'],
                            patient_insurance_member_id=patient_data.get('patient_insurance_member_id')
                        )
                
                # Get documents from lookup
                documents = fresh_docs_lookup.get(str(row['referral_id']), [])
                document_count = len(documents)
                
                # Create ReferralWithDetails object
                referral_item = ReferralWithDetails(
                    referral_id=row['referral_id'],
                    referral_outbound_facility_id=row['referral_outbound_facility_id'],
                    referral_inbound_facility_id=row['referral_inbound_facility_id'],
                    referral_outbound_date=row.get('referral_outbound_date'),
                    referral_batch_prefix=row['referral_batch_prefix'],
                    referral_slug=row['referral_slug'],
                    patient_id=row.get('patient_id'),
                    referral_scanned=row['referral_scanned'],
                    referral_scanned_date=row.get('referral_scanned_date'),
                    referral_submitted=row['referral_submitted'],
                    referral_submitted_date=row.get('referral_submitted_date'),
                    referral_status=row.get('referral_status'),
                    referral_remark=row.get('referral_remark'),
                    referral_doctor_name=row.get('referral_doctor_name'),
                    deleted=row.get('deleted', False),
                    outbound_facility_name=outbound_facility_name,
                    inbound_facility_name=inbound_facility_name,
                    patient_fname=patient.patient_fname if patient else None,
                    patient_mname=patient.patient_mname if patient else None,
                    patient_lname=patient.patient_lname if patient else None,
                    patient_dob=patient.patient_dob if patient else None,
                    patient_contact_phone=patient.patient_contact_phone if patient else None,
                    patient_contact_email=patient.patient_contact_email if patient else None,
                    patient_gender=patient.patient_gender if patient else None,
                    patient_insurance_member_id=patient.patient_insurance_member_id if patient else None,
                    documents=documents,
                    document_count=document_count,
                )
                
                # Add referral item to results (no post-query filtering needed with optimized search)
                items.append(referral_item)
            
            # Calculate pagination metadata
            total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1
            has_next = page < total_pages
            has_previous = page > 1
            
            return ReferralWithDetailsPagination(
                items=items,
                pagination={
                    "total_count": total_count,
                    "total_pages": total_pages,
                    "current_page": page,
                    "page_size": page_size,
                    "has_next": has_next,
                    "has_previous": has_previous
                }
            )
            
        except Exception as e:
            print(f"Error getting scanned referrals: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch scanned referrals: {str(e)}"
            )

    @staticmethod
    async def _get_search_referral_ids(
        db: AsyncClient,
        search: str,
        status: Optional[str] = None
    ) -> List[str]:
        """
        Get referral IDs that match the search criteria using database-level search
        
        Args:
            db: Database client
            search: Search term
            status: Optional status filter for referrals
            
        Returns:
            List of referral IDs that match the search
        """
        try:
            # Build base query conditions
            base_conditions = [
                ("deleted", False),
                ("referral_scanned", True)
            ]
            
            # Add status filter if provided
            if status:
                base_conditions.append(("referral_status", status))
            
            # Search in referrals table using individual queries
            referral_slug_query = db.table("referrals").select("referral_id").not_.is_("patient_id", "null").ilike("referral_slug", f"%{search}%")
            referral_batch_query = db.table("referrals").select("referral_id").not_.is_("patient_id", "null").ilike("referral_batch_prefix", f"%{search}%")
            referral_doctor_query = db.table("referrals").select("referral_id").not_.is_("patient_id", "null").ilike("referral_doctor_name", f"%{search}%")
            
            # Apply base conditions to all queries
            for condition in base_conditions:
                referral_slug_query = referral_slug_query.eq(condition[0], condition[1])
                referral_batch_query = referral_batch_query.eq(condition[0], condition[1])
                referral_doctor_query = referral_doctor_query.eq(condition[0], condition[1])
            
            referral_slug_results = await referral_slug_query.execute()
            referral_batch_results = await referral_batch_query.execute()
            referral_doctor_results = await referral_doctor_query.execute()
            
            # Combine referral results
            referral_ids = []
            referral_ids.extend([str(row['referral_id']) for row in referral_slug_results.data])
            referral_ids.extend([str(row['referral_id']) for row in referral_batch_results.data])
            referral_ids.extend([str(row['referral_id']) for row in referral_doctor_results.data])
            # Remove duplicates
            referral_ids = list(set(referral_ids))
            
                        # Search in patients table for patient-related searches
            # Use individual queries instead of complex OR to avoid syntax issues
            patient_fname_results = await (
                db.table("patients")
                .select("patient_id")
                .ilike("patient_fname", f"%{search}%")
                .execute()
            )
            
            patient_mname_results = await (
                db.table("patients")
                .select("patient_id")
                .ilike("patient_mname", f"%{search}%")
                .execute()
            )
            
            patient_lname_results = await (
                db.table("patients")
                .select("patient_id")
                .ilike("patient_lname", f"%{search}%")
                .execute()
            )
            
 
            
            # Combine all patient results
            patient_ids = []
            patient_ids.extend([str(row['patient_id']) for row in patient_fname_results.data])
            patient_ids.extend([str(row['patient_id']) for row in patient_mname_results.data])
            patient_ids.extend([str(row['patient_id']) for row in patient_lname_results.data])
            # Remove duplicates
            patient_ids = list(set(patient_ids))
            
            # Get referrals for matching patients
            if patient_ids:
                patient_referral_query = db.table("referrals").select("referral_id").in_("patient_id", patient_ids)
                
                # Apply base conditions to patient referral query
                for condition in base_conditions:
                    patient_referral_query = patient_referral_query.eq(condition[0], condition[1])
                
                patient_referral_results = await patient_referral_query.execute()
                
                patient_referral_ids = [str(row['referral_id']) for row in patient_referral_results.data]
                referral_ids.extend(patient_referral_ids)
            
            # Search in facilities table
            facility_results = await (
                db.table("facility_entity")
                .select("facility_id")
                .ilike("facility_name", f"%{search}%")
                .execute()
            )
            
            facility_ids = [str(row['facility_id']) for row in facility_results.data]
            
            # Get referrals for matching facilities
            if facility_ids:
                # Use separate queries for outbound and inbound facilities
                outbound_facility_query = db.table("referrals").select("referral_id").not_.is_("patient_id", "null").in_("referral_outbound_facility_id", facility_ids)
                inbound_facility_query = db.table("referrals").select("referral_id").not_.is_("patient_id", "null").in_("referral_inbound_facility_id", facility_ids)
                
                # Apply base conditions to facility queries
                for condition in base_conditions:
                    outbound_facility_query = outbound_facility_query.eq(condition[0], condition[1])
                    inbound_facility_query = inbound_facility_query.eq(condition[0], condition[1])
                
                outbound_facility_results = await outbound_facility_query.execute()
                inbound_facility_results = await inbound_facility_query.execute()
                
                # Combine facility results
                facility_referral_ids = []
                facility_referral_ids.extend([str(row['referral_id']) for row in outbound_facility_results.data])
                facility_referral_ids.extend([str(row['referral_id']) for row in inbound_facility_results.data])
                referral_ids.extend(facility_referral_ids)
            
            # Remove duplicates and return
            return list(set(referral_ids))
            
        except Exception as e:
            print(f"Error in _get_search_referral_ids: {str(e)}")
            return []

    @staticmethod
    async def get_scanned_referrals_count(db: AsyncClient) -> Dict[str, int]:
        """
        Get count of scanned referrals with patient ID
        
        Args:
            db: Database client
            
        Returns:
            Dict containing count of scanned referrals with patient ID
        """
        try:
            count_result = await (
                db.table("referrals")
                .select("*", count='exact')
                .eq("deleted", False)
                .eq("referral_scanned", True)
                .not_.is_("patient_id", "null")  # Must have patient ID
                .execute()
            )
            
            scanned_with_patient_count = count_result.count if count_result.count is not None else 0
            
            # Also get total scanned count for comparison
            total_scanned_count_result = await (
                db.table("referrals")
                .select("*", count='exact')
                .eq("deleted", False)
                .eq("referral_scanned", True)
                .execute()
            )
            
            total_scanned_count = total_scanned_count_result.count if total_scanned_count_result.count is not None else 0
            
            # Get total count for comparison
            total_count_result = await (
                db.table("referrals")
                .select("*", count='exact')
                .eq("deleted", False)
                .execute()
            )
            
            total_count = total_count_result.count if total_count_result.count is not None else 0
            
            return {
                "scanned_with_patient_count": scanned_with_patient_count,
                "total_scanned_count": total_scanned_count,
                "scanned_without_patient_count": total_scanned_count - scanned_with_patient_count,
                "total_count": total_count,
                "unscanned_count": total_count - total_scanned_count
            }
            
        except Exception as e:
            print(f"Error getting scanned referrals count: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get scanned referrals count: {str(e)}"
            )

    @staticmethod
    async def get_scanned_referrals_by_batch(
        db: AsyncClient,
        batch_id: UUID,
        page: int = 1,
        page_size: int = 10
    ) -> ReferralWithDetailsPagination:
        """
        Get scanned referrals with patient ID for a specific batch
        
        Args:
            db: Database client
            batch_id: Batch ID to filter by
            page: Page number starting from 1
            page_size: Number of items per page
            
        Returns:
            ReferralWithDetailsPagination containing scanned referrals with patient ID for the batch
        """
        try:
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Build query for scanned referrals with patient ID in specific batch
            base_query = (
                db.table("referrals")
                .select("*")
                .eq("deleted", False)
                .eq("referral_scanned", True)
                .not_.is_("patient_id", "null")  # Must have patient ID
                .eq("referral_batch_id", str(batch_id))
            )
            
            # Get total count for this batch
            count_result = await base_query.execute()
            total_count = len(count_result.data) if count_result.data else 0
            
            # Get paginated data
            data_result = await (
                base_query
                .order("referral_scanned_date.desc.nullslast")
                .range(offset, offset + page_size - 1)
                .execute()
            )
            
            # Transform results to ReferralWithDetails objects
            items = []
            if data_result.data:
                for row in data_result.data:
                    # Get outbound facility information
                    outbound_facility_result = await db.table("facility_entity").select("facility_name").eq("facility_id", row['referral_outbound_facility_id']).execute()
                    outbound_facility_name = outbound_facility_result.data[0]['facility_name'] if outbound_facility_result.data else None
                    
                    # Get inbound facility information
                    inbound_facility_result = await db.table("facility_entity").select("facility_name").eq("facility_id", row['referral_inbound_facility_id']).execute()
                    inbound_facility_name = inbound_facility_result.data[0]['facility_name'] if inbound_facility_result.data else None
                    
                    # Get patient information if patient_id exists
                    patient = None
                    if row.get('patient_id'):
                        patient_result = await db.table("patients").select("patient_fname, patient_mname, patient_lname, patient_dob, patient_contact_phone, patient_contact_email, patient_gender, patient_insurance_member_id").eq("patient_id", row['patient_id']).execute()
                        if patient_result.data:
                            patient_data = patient_result.data[0]
                            patient = Patient(
                                patient_id=row['patient_id'],
                                patient_fname=patient_data['patient_fname'],
                                patient_mname=patient_data.get('patient_mname'),
                                patient_lname=patient_data['patient_lname'],
                                patient_dob=patient_data['patient_dob'],
                                patient_contact_phone=patient_data['patient_contact_phone'],
                                patient_contact_email=patient_data['patient_contact_email'],
                                patient_gender=patient_data['patient_gender'],
                                patient_insurance_member_id=patient_data.get('patient_insurance_member_id')
                            )
                    
                    # Get document information for this referral
                    documents = []
                    document_count = 0
                    if row.get('referral_id'):
                        documents_result = await db.table("documents").select("document_id, created_at, source, document_category").eq("referral_id", str(row['referral_id'])).execute()
                        if documents_result.data:
                            # Generate fresh signed URLs for documents
                            documents = await ReferralManagementService._generate_document_signed_urls(db, documents_result.data)
                            document_count = len(documents)
                    
                    # Create ReferralWithDetails object
                    referral_item = ReferralWithDetails(
                        referral_id=row['referral_id'],
                        referral_outbound_facility_id=row['referral_outbound_facility_id'],
                        referral_inbound_facility_id=row['referral_inbound_facility_id'],
                        referral_outbound_date=row.get('referral_outbound_date'),
                        referral_batch_prefix=row['referral_batch_prefix'],
                        referral_slug=row['referral_slug'],
                        patient_id=row.get('patient_id'),
                        referral_scanned=row['referral_scanned'],
                        referral_scanned_date=row.get('referral_scanned_date'),
                        referral_submitted=row['referral_submitted'],
                        referral_submitted_date=row.get('referral_submitted_date'),
                        referral_status=row.get('referral_status'),
                        referral_remark=row.get('referral_remark'),
                        referral_doctor_name=row.get('referral_doctor_name'),
                        deleted=row.get('deleted', False),
                        outbound_facility_name=outbound_facility_name,
                        inbound_facility_name=inbound_facility_name,
                        patient_fname=patient.patient_fname if patient else None,
                        patient_mname=patient.patient_mname if patient else None,
                        patient_lname=patient.patient_lname if patient else None,
                        patient_dob=patient.patient_dob if patient else None,
                        patient_contact_phone=patient.patient_contact_phone if patient else None,
                        patient_contact_email=patient.patient_contact_email if patient else None,
                        patient_gender=patient.patient_gender if patient else None,
                        patient_insurance_member_id=patient.patient_insurance_member_id if patient else None,
                    )
                    
                    items.append(referral_item)
            
            # Calculate pagination metadata
            total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1
            has_next = page < total_pages
            has_previous = page > 1
            
            return ReferralWithDetailsPagination(
                items=items,
                pagination={
                    "total_count": total_count,
                    "total_pages": total_pages,
                    "current_page": page,
                    "page_size": page_size,
                    "has_next": has_next,
                    "has_previous": has_previous
                }
            )
            
        except Exception as e:
            print(f"Error getting scanned referrals by batch: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch scanned referrals by batch: {str(e)}"
            )

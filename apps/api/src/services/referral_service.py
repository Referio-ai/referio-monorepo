from typing import Optional, Dict, List, Any
from uuid import UUID
from datetime import datetime, date
from supabase import AsyncClient
from fastapi import HTTPException

from src.crud.referrals import referrals_crud
from src.crud.patients import patients_crud
from src.schemas.referrals import Referral, ReferralWithDetails, ReferralUpdate, ReferralWithDetailsPagination
from src.schemas.patients import PatientCreate, PatientUpdate
from src.schemas.documents import DocumentCreate
from src.utils.reducto.reducto_utils import reducto_referral_extraction, reducto_referral_extraction_async


class ReferralService:
    """Service for handling referral operations"""

    @staticmethod
    async def fetch_referral_by_id(
        db: AsyncClient, 
        referral_id: str
    ) -> Optional[Referral]:
        """
        Fetch a referral by its ID
        
        Args:
            db: Database client
            referral_id: ID of the referral to fetch
            
        Returns:
            Referral object if found, None otherwise
        """
        try:
            referral = await referrals_crud.get(db, id=referral_id)
            if not referral:
                raise HTTPException(
                    status_code=404,
                    detail=f"Referral with ID {referral_id} not found"
                )
            return referral
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            print(f"Error fetching referral by ID: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch referral: {str(e)}"
            )

    @staticmethod
    async def fetch_referral_by_slug(
        db: AsyncClient, 
        referral_slug: str,
        batch_prefix: str
    ) -> Optional[ReferralWithDetails]:
        """
        Fetch a referral by its slug with facility and patient details
        
        Args:
            db: Database client
            referral_slug: Slug of the referral to fetch
            
        Returns:
            ReferralWithDetails object if found, None otherwise
        """
        try:
            # First, get the referral
            referral_result = await db.table("referrals").select("*").eq("referral_slug", referral_slug).eq("referral_batch_prefix", batch_prefix).eq("deleted", False).execute()
            
            if not referral_result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Referral with slug {referral_slug} not found"
                )
            
            referral_data = referral_result.data[0]
            
            # Get outbound facility information
            outbound_facility_result = await db.table("facility_entity").select("facility_name").eq("facility_id", referral_data['referral_outbound_facility_id']).execute()
            outbound_facility_name = outbound_facility_result.data[0]['facility_name'] if outbound_facility_result.data else None
            
            # Get inbound facility information
            inbound_facility_result = await db.table("facility_entity").select("facility_name").eq("facility_id", referral_data['referral_inbound_facility_id']).execute()
            inbound_facility_name = inbound_facility_result.data[0]['facility_name'] if inbound_facility_result.data else None
            
            # Get patient information if patient_id exists
            patient_data = {}
            if referral_data.get('patient_id'):
                patient_result = await db.table("patients").select("patient_fname, patient_mname, patient_lname, patient_dob, patient_contact_phone, patient_contact_email, patient_gender, patient_insurance_member_id").eq("patient_id", referral_data['patient_id']).execute()
                if patient_result.data:
                    patient_data = patient_result.data[0]
            
            # Create ReferralWithDetails object
            return ReferralWithDetails(
                referral_id=referral_data['referral_id'],
                referral_outbound_facility_id=referral_data['referral_outbound_facility_id'],
                referral_inbound_facility_id=referral_data['referral_inbound_facility_id'],
                referral_outbound_date=referral_data.get('referral_outbound_date'),
                referral_batch_prefix=referral_data['referral_batch_prefix'],
                referral_slug=referral_data['referral_slug'],
                patient_id=referral_data.get('patient_id'),
                referral_scanned=referral_data['referral_scanned'],
                referral_scanned_date=referral_data.get('referral_scanned_date'),
                referral_submitted=referral_data['referral_submitted'],
                referral_submitted_date=referral_data.get('referral_submitted_date'),
                referral_status=referral_data.get('referral_status'),
                deleted=referral_data.get('deleted', False),
                outbound_facility_name=outbound_facility_name,
                inbound_facility_name=inbound_facility_name,
                patient_fname=patient_data.get('patient_fname'),
                patient_mname=patient_data.get('patient_mname'),
                patient_lname=patient_data.get('patient_lname'),
                patient_dob=patient_data.get('patient_dob'),
                patient_contact_phone=patient_data.get('patient_contact_phone'),
                patient_contact_email=patient_data.get('patient_contact_email'),
                patient_gender=patient_data.get('patient_gender'),
                patient_insurance_member_id=patient_data.get('patient_insurance_member_id'),
            )
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            print(f"Error fetching referral by slug: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch referral: {str(e)}"
            )

    @staticmethod
    async def get_referrals_with_details_paginated(
        db: AsyncClient,
        page: int = 1,
        page_size: int = 10,
        search: str = "",
        batch_prefix: Optional[str] = None
    ) -> ReferralWithDetailsPagination:
        """
        Get paginated referrals with patient and facility details using Supabase client functions
        
        Args:
            db: Database client
            page: Page number starting from 1
            page_size: Number of items per page
            search: Search term to filter referrals
            batch_prefix: Optional batch prefix to filter referrals by batch
            
        Returns:
            ReferralWithDetailsPagination containing items and pagination metadata
        """
        try:
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Build base query with proper joins
            base_query = (
                db.table("referrals")
                .select("*")
                .eq("deleted", False)
            )
            
            # Apply batch filter if provided
            if batch_prefix:
                base_query = base_query.eq("referral_batch_prefix", batch_prefix)
            
            # Handle search functionality
            if search:
                # Search in referral fields directly
                search_query = base_query.or_(
                    f"referral_slug.ilike.%{search}%,"
                    f"referral_batch_prefix.ilike.%{search}%"
                )
            else:
                search_query = base_query
            
            # Get total count first - create a separate count query
            count_query = (
                db.table("referrals")
                .select("*", count='exact')
                .eq("deleted", False)
            )
            
            # Apply same batch filter to count query
            if batch_prefix:
                count_query = count_query.eq("referral_batch_prefix", batch_prefix)
            
            # Apply same search conditions to count query
            if search:
                count_query = count_query.or_(
                    f"referral_slug.ilike.%{search}%,"
                    f"referral_batch_prefix.ilike.%{search}%"
                )
            
            count_result = await count_query.execute()
            total_count = count_result.count if count_result.count is not None else 0
            
            # Get paginated data with ordering
            data_result = await (
                search_query
                .order("referral_submitted_date.desc.nullslast")
                .order("referral_scanned_date.desc.nullslast")
                .range(offset, offset + page_size - 1)
                .execute()
            )
            
            # Transform results to ReferralWithDetails objects
            items = []
            if data_result.data:
                for row in data_result.data:
                    # Extract nested data safely
                    outbound_facility = row.get('outbound_facility', [])
                    inbound_facility = row.get('inbound_facility', [])
                    patient = row.get('patient', [])
                    
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
                        deleted=row.get('deleted', False),
                        outbound_facility_name=outbound_facility[0]['facility_name'] if outbound_facility and len(outbound_facility) > 0 else None,
                        inbound_facility_name=inbound_facility[0]['facility_name'] if inbound_facility and len(inbound_facility) > 0 else None,
                        patient_fname=patient[0]['patient_fname'] if patient and len(patient) > 0 else None,
                        patient_mname=patient[0]['patient_mname'] if patient and len(patient) > 0 else None,
                        patient_lname=patient[0]['patient_lname'] if patient and len(patient) > 0 else None,
                        patient_dob=patient[0]['patient_dob'] if patient and len(patient) > 0 else None,
                        patient_contact_phone=patient[0]['patient_contact_phone'] if patient and len(patient) > 0 else None,
                        patient_contact_email=patient[0]['patient_contact_email'] if patient and len(patient) > 0 else None,
                        patient_gender=patient[0]['patient_gender'] if patient and len(patient) > 0 else None,
                        patient_insurance_member_id=patient[0]['patient_insurance_member_id'] if patient and len(patient) > 0 else None,
                    )
                    
                    # Apply search filter on the result if needed (for cross-table search)
                    if search:
                        search_lower = search.lower()
                        # Check if any field matches the search term
                        matches = (
                            (referral_item.referral_slug and search_lower in referral_item.referral_slug.lower()) or
                            (referral_item.referral_batch_prefix and search_lower in referral_item.referral_batch_prefix.lower()) or
                            (referral_item.patient_fname and search_lower in referral_item.patient_fname.lower()) or
                            (referral_item.patient_lname and search_lower in referral_item.patient_lname.lower()) or
                            (referral_item.outbound_facility_name and search_lower in referral_item.outbound_facility_name.lower()) or
                            (referral_item.inbound_facility_name and search_lower in referral_item.inbound_facility_name.lower())
                        )
                        if matches:
                            items.append(referral_item)
                    else:
                        items.append(referral_item)
            
            # If we applied post-query filtering, we need to adjust pagination
            if search:
                # For simplicity, we'll return the filtered results
                # Note: This approach loads more data than needed for complex searches
                # In production, consider implementing server-side search or full-text search
                filtered_items = items
                total_count = len(filtered_items)
                
                # Apply pagination to filtered results
                start_idx = offset
                end_idx = offset + page_size
                items = filtered_items[start_idx:end_idx]
            
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
            print(f"Error getting referrals with details: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch referrals with details: {str(e)}"
            )

    @staticmethod
    async def get_referrals_for_qr_printing(
        db: AsyncClient,
        batch_prefix: str
    ) -> List[Dict[str, Any]]:
        """
        Get all referrals for a specific branch (batch prefix) for QR code printing
        
        This function retrieves all referrals within a batch and formats them
        with QR code URLs and essential information needed for printing.
        
        Args:
            db: Database client
            batch_prefix: Batch prefix to filter referrals by branch
            
        Returns:
            List of referrals with QR code information for printing
        """
        try:
            print(f"Getting referrals for QR printing with batch prefix: {batch_prefix}")
            
            # Get all referrals for the specified batch prefix
            referrals_result = await (
                db.table("referrals")
                .select("*")
                .eq("referral_batch_prefix", batch_prefix)
                .eq("deleted", False)
                .order("referral_slug.asc")
                .execute()
            )
            
            if not referrals_result.data:
                print(f"No referrals found for batch prefix: {batch_prefix}")
                return []
            
            print(f"Found {len(referrals_result.data)} referrals for batch prefix: {batch_prefix}")
            
            # Get batch information for additional context
            batch_result = await (
                db.table("referrals_batch")
                .select("*")
                .eq("referral_batch_prefix", batch_prefix)
                .eq("deleted", False)
                .execute()
            )
            
            batch_info = batch_result.data[0] if batch_result.data else None
            
            # Get facility information for the batch
            outbound_facility_name = None
            inbound_facility_name = None
            
            if batch_info:
                # Get outbound facility information
                outbound_facility_result = await (
                    db.table("facility_entity")
                    .select("facility_name")
                    .eq("facility_id", batch_info['referral_outbound_facility_id'])
                    .execute()
                )
                outbound_facility_name = (
                    outbound_facility_result.data[0]['facility_name'] 
                    if outbound_facility_result.data else None
                )
                
                # Get inbound facility information
                inbound_facility_result = await (
                    db.table("facility_entity")
                    .select("facility_name")
                    .eq("facility_id", batch_info['referral_inbound_facility_id'])
                    .execute()
                )
                inbound_facility_name = (
                    inbound_facility_result.data[0]['facility_name'] 
                    if inbound_facility_result.data else None
                )
            
            # Format referrals for QR printing
            qr_referrals = []
            base_url = "https://referio.app"  # This should be configurable
            
            for referral in referrals_result.data:
                # Generate QR code URL
                qr_url = f"{base_url}/r/{referral['referral_batch_prefix']}-{referral['referral_slug']}/"
                
                # Format referral for printing
                qr_referral = {
                    "referral_id": str(referral['referral_id']),
                    "referral_slug": referral['referral_slug'],
                    "referral_batch_prefix": referral['referral_batch_prefix'],
                    "qr_code_url": qr_url,
                    "qr_code_data": f"{referral['referral_batch_prefix']}-{referral['referral_slug']}",
                    "status": referral.get('referral_status', 'active'),
                    "scanned": referral['referral_scanned'],
                    "submitted": referral['referral_submitted'],
                    "scanned_date": referral.get('referral_scanned_date'),
                    "submitted_date": referral.get('referral_submitted_date'),
                    "outbound_facility_name": outbound_facility_name,
                    "inbound_facility_name": inbound_facility_name,
                    "batch_size": batch_info['referral_batch_size'] if batch_info else None,
                    "created_at": referral.get('created_at'),
                    "updated_at": referral.get('updated_at')
                }
                
                qr_referrals.append(qr_referral)
            
            print(f"Formatted {len(qr_referrals)} referrals for QR printing")
            
            return {
                "batch_prefix": batch_prefix,
                "total_referrals": len(qr_referrals),
                "outbound_facility_name": outbound_facility_name,
                "inbound_facility_name": inbound_facility_name,
                "batch_size": batch_info['referral_batch_size'] if batch_info else None,
                "referrals": qr_referrals
            }
            
        except Exception as e:
            print(f"Error getting referrals for QR printing: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get referrals for QR printing: {str(e)}"
            )


    @staticmethod
    async def upload_referral_form_async(
        db: AsyncClient, 
        referral_id: str,
        form_data: dict
    ) -> dict:
        """
        Upload a referral form and process it through Reducto for data extraction
        
        This method handles the complete flow of:
        1. Uploading referral form files to Supabase storage
        2. Getting signed URLs for the uploaded files
        3. Processing each file through Reducto AI for data extraction
        4. Extracting and saving patient information (including insurance)
        5. Updating referral record with extracted data 

        Args:
            db: Supabase client
            referral_id: ID of the referral to attach forms to
            form_data: List of files to upload and process
            
        Returns:
            Dict containing upload results, extraction results, patient data, and summary statistics
        """
        try:
            # Step 1: Upload the files to Supabase storage
            print(f"Uploading referral forms for referral ID: {referral_id}")
            upload_results = await referrals_crud.upload_files( 
                db=db, 
                id=referral_id, 
                files=form_data, 
                type="referral_form",
                bucket_name="referral-documents",
                base_path="referrals",
                document_category="referral_form"
            )

            # Step 2: Process uploaded files through Reducto for async extraction
            for file in upload_results:
                if hasattr(file, 'signed_url') and file.signed_url:
                    try:
                        print(f"Processing file {file.filename} through Reducto...")
                        await reducto_referral_extraction_async(file.signed_url, referral_id)
                    except Exception as reducto_error:
                        print(f"Error processing file {file.filename} through Reducto: {str(reducto_error)}")
                        continue
                    

            # Step 3: Return success message 
            return {
                "status": "success",
                "message": "Referral form uploaded and processed successfully"
            }
        
        except Exception as e:
            print(f"Error uploading referral form: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload referral form: {str(e)}"
            )

    @staticmethod
    async def upload_referral_form(
        db: AsyncClient, 
        referral_id: str,
        form_data: dict
    ) -> dict:
        """
        Upload a referral form and process it through Reducto for data extraction
        
        This method handles the complete flow of:
        1. Uploading referral form files to Supabase storage
        2. Getting signed URLs for the uploaded files
        3. Processing each file through Reducto AI for data extraction
        4. Extracting and saving patient information (including insurance)
        5. Updating referral record with extracted data
        6. Storing file records in documents table
        7. Returning comprehensive results
        
        Args:
            db: Supabase client
            referral_id: ID of the referral to attach forms to
            form_data: List of files to upload and process
            
        Returns:
            Dict containing upload results, extraction results, patient data, and summary statistics
        """
        try:
            # Step 1: Upload the files to Supabase storage
            print(f"Uploading referral forms for referral ID: {referral_id}")
            upload_results = await referrals_crud.upload_files(
                db=db, 
                id=referral_id, 
                files=form_data, 
                type="referral_form",
                bucket_name="referral-documents",
                base_path="referrals",
                document_category="referral_form"
            )
            
            # Step 2: Process uploaded files through Reducto for data extraction
            extraction_results = []
            patient_data_extracted = None
            referral_data_extracted = None
            insurance_data_extracted = None
            provider_data_extracted = None
            uploaded_documents = []
            
            # If upload_results contains file information with signed URLs
            if upload_results and isinstance(upload_results, list):
                for file_result in upload_results:
                    if hasattr(file_result, 'signed_url') and file_result.signed_url:
                        try:
                            print(f"Processing file {file_result.filename} through Reducto...")
                            
                            # Extract data using Reducto AI
                            extracted_data = await reducto_referral_extraction(file_result.signed_url, referral_id)
                            
                            # Parse the extraction results
                            extraction_result = {
                                "filename": file_result.filename,
                                "bucket_name": file_result.bucket_name,
                                "signed_url": file_result.signed_url,
                                "extraction_data": extracted_data,
                                "extraction_status": "success" if extracted_data else "failed",
                                "error": None,
                                "extracted_fields": None
                            }
                            
                            # If extraction was successful, process the nested result structure
                            if extracted_data and isinstance(extracted_data, dict):
                                # Handle the nested result structure from Reducto
                                result_data = None
                                if extracted_data.get("result") and isinstance(extracted_data["result"], list) and len(extracted_data["result"]) > 0:
                                    result_data = extracted_data["result"][0]  # Get first result item
                                    print(f"Found result data: {result_data}")
                                
                                extraction_result["extracted_fields"] = {
                                    "has_patient_info": bool(result_data.get("patient_information")) if result_data else False,
                                    "has_referral_info": bool(result_data.get("referral_information")) if result_data else False,
                                    "has_provider_info": bool(result_data.get("referring_provider")) if result_data else False,
                                    "has_insurance_info": bool(result_data.get("insurance_information")) if result_data else False,
                                    "has_clinical_findings": bool(result_data.get("clinical_findings")) if result_data else False,
                                    "has_attachments": bool(result_data.get("attachments")) if result_data else False
                                }
                                
                                # Extract patient information for processing (from nested result)
                                if result_data and result_data.get("patient_information") and not patient_data_extracted:
                                    patient_data_extracted = result_data["patient_information"]
                                    print(f"Extracted patient information: {patient_data_extracted}")
                                
                                # Extract referral information for processing (from nested result)
                                if result_data and result_data.get("referral_information") and not referral_data_extracted:
                                    referral_data_extracted = result_data["referral_information"]
                                    print(f"Extracted referral information: {referral_data_extracted}")
                                
                                # Extract insurance information for processing (from nested result)
                                if result_data and result_data.get("insurance_information") and not insurance_data_extracted:
                                    insurance_data_extracted = result_data["insurance_information"]
                                    print(f"Extracted insurance information: {insurance_data_extracted}")

                                # Extract provider information for processing (from nested result)
                                if result_data and result_data.get("referring_provider") and not provider_data_extracted:
                                    provider_data_extracted = result_data["referring_provider"]
                                    print(f"Extracted provider information: {provider_data_extracted}")
                                
                                # Log successful extraction
                                print(f"Successfully extracted data from {file_result.filename}")
                                print(f"Extracted fields: {extraction_result['extracted_fields']}")
                            
                            extraction_results.append(extraction_result)
                            
                        except Exception as reducto_error:
                            error_msg = f"Error processing file {file_result.filename} through Reducto: {str(reducto_error)}"
                            print(error_msg)
                            
                            extraction_result = {
                                "filename": file_result.filename,
                                "bucket_name": file_result.bucket_name,
                                "signed_url": file_result.signed_url,
                                "extraction_data": None,
                                "extraction_status": "failed",
                                "error": str(reducto_error),
                                "extracted_fields": None
                            }
                            extraction_results.append(extraction_result)
            
            # Step 3: Process and save patient information (including insurance)
            patient_result = None
            if patient_data_extracted:
                try:
                    patient_result = await ReferralService._process_patient_information(
                        db, patient_data_extracted, insurance_data_extracted
                    )
                    print(f"Patient information processed: {patient_result}")
                except Exception as patient_error:
                    print(f"Warning: Failed to process patient information: {str(patient_error)}")
            
            # Step 4: Update referral record with extracted information
            referral_updates = {}
            if referral_data_extracted:
                try:
                    referral_updates = await ReferralService._process_referral_information(
                        db, referral_id, referral_data_extracted, patient_result, provider_data_extracted
                    )
                    print(f"Referral information updated: {referral_updates}")
                except Exception as referral_error:
                    print(f"Warning: Failed to update referral information: {str(referral_error)}")
            
            # Step 5: Store document records in documents table
            document_records = []
            deletion_results = None
            if upload_results:
                try:
                    document_records, deletion_results = await ReferralService._store_document_records(
                        db, referral_id, upload_results, patient_result
                    )
                    print(f"Stored {len(document_records)} document records for referral {referral_id}")
                except Exception as doc_error:
                    print(f"Warning: Failed to store document records: {str(doc_error)}")
            
            # Step 6: Return comprehensive results
            successful_extractions = [r for r in extraction_results if r["extraction_status"] == "success"]
            failed_extractions = [r for r in extraction_results if r["extraction_status"] == "failed"]
            
            return {
                "upload_results": upload_results,
                "extraction_results": extraction_results,
                "patient_data": patient_result,
                "referral_updates": referral_updates,
                "document_records": document_records,
                "referral_id": referral_id,
                "processed_files": len(extraction_results),
                "successful_extractions": len(successful_extractions),
                "failed_extractions": len(failed_extractions),
                "summary": {
                    "total_files": len(upload_results) if upload_results else 0,
                    "extraction_success_rate": (len(successful_extractions) / len(extraction_results) * 100) if extraction_results else 0,
                    "extraction_errors": [{"file": r["filename"], "error": r["error"]} for r in failed_extractions],
                    "patient_processed": bool(patient_result),
                    "referral_updated": bool(referral_updates),
                    "documents_stored": len(document_records) if document_records else 0,
                    "existing_documents_deleted": deletion_results.get("deleted_count", 0) if deletion_results else 0,
                    "storage_files_deleted": deletion_results.get("storage_deletions", 0) if deletion_results else 0
                }
            }
            
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            print(f"Error uploading referral form: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload referral form: {str(e)}"
            )
    
    @staticmethod
    async def process_extracted_referral_data(
        db: AsyncClient,
        job_id: str,
        extracted_data: List[Dict[str, Any]]
    ) -> dict:
        """
        Process extracted referral data from Reducto and save patient, provider, and other information
        
        This function handles the extracted data from the async upload process and:
        1. Processes and saves patient information (including insurance)
        2. Updates referral record with extracted information
        3. Stores document records in documents table
        4. Returns comprehensive processing results
        
        Args:
            db: Database client
            job_id: Job ID to find the referral
            extracted_data: Extracted data from Reducto AI processing (list containing dict)
            
        Returns:
            Dict containing processing results, patient data, referral updates, and summary statistics
        """
        try:
            print(f"Processing extracted data for job ID: {job_id}")
            print(f"Extracted data structure: {extracted_data}")

            # get the referral by job_id
            referral = await db.table("referrals").select("*").eq("job_id", job_id).execute()
            if not referral.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Referral with job ID {job_id} not found"
                )   
            
            referral_id = referral.data[0]["referral_id"]

            print(f"Referral ID: {referral_id}")
            
            # Initialize variables for extracted data
            patient_data_extracted = None
            referral_data_extracted = None
            insurance_data_extracted = None
            provider_data_extracted = None
            
            # Parse the extracted data structure - now it's a list containing a single dict
            if extracted_data and isinstance(extracted_data, list) and len(extracted_data) > 0:
                # Get the first (and only) item from the list
                result_data = extracted_data[0]
                print(f"Found result data: {result_data}")
                
                # Extract patient information for processing
                if result_data.get("patient_information"):
                    patient_data_extracted = result_data["patient_information"]
                    print(f"Extracted patient information: {patient_data_extracted}")
                
                # Extract referral information for processing
                if result_data.get("referral_information"):
                    referral_data_extracted = result_data["referral_information"]
                    print(f"Extracted referral information: {referral_data_extracted}")
                
                # Extract insurance information for processing
                if result_data.get("insurance_information"):
                    insurance_data_extracted = result_data["insurance_information"]
                    print(f"Extracted insurance information: {insurance_data_extracted}")

                # Extract provider information for processing
                if result_data.get("referring_provider"):
                    provider_data_extracted = result_data["referring_provider"]
                    print(f"Extracted provider information: {provider_data_extracted}")
            
            # Step 1: Process and save patient information (including insurance)
            patient_result = None
            if patient_data_extracted:
                try:
                    patient_result = await ReferralService._process_patient_information(
                        db, patient_data_extracted, insurance_data_extracted
                    )
                    print(f"Patient information processed: {patient_result}")
                except Exception as patient_error:
                    print(f"Warning: Failed to process patient information: {str(patient_error)}")
            
            # Step 2: Update referral record with extracted information
            referral_updates = {}
            if referral_data_extracted:
                try:
                    referral_updates = await ReferralService._process_referral_information(
                        db, referral_id, referral_data_extracted, patient_result, provider_data_extracted
                    )
                    print(f"Referral information updated: {referral_updates}")
                except Exception as referral_error:
                    print(f"Warning: Failed to update referral information: {str(referral_error)}")
            
            # Step 3: Return comprehensive results
            return {
                "referral_id": referral_id,
                "patient_data": patient_result,
                "referral_updates": referral_updates,
                "extracted_data_summary": {
                    "has_patient_info": bool(patient_data_extracted),
                    "has_referral_info": bool(referral_data_extracted),
                    "has_provider_info": bool(provider_data_extracted),
                    "has_insurance_info": bool(insurance_data_extracted),
                    "patient_processed": bool(patient_result),
                    "referral_updated": bool(referral_updates)
                },
                "summary": {
                    "patient_processed": bool(patient_result),
                    "referral_updated": bool(referral_updates),
                    "extraction_success": bool(extracted_data),
                    "processing_status": "completed"
                }
            }
            
        except Exception as e:
            print(f"Error processing extracted referral data: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process extracted referral data: {str(e)}"
            )

    @staticmethod
    async def _process_patient_information(
        db: AsyncClient, 
        patient_data: Dict[str, Any],
        insurance_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process extracted patient information and create/update patient record
        
        Args:
            db: Database client
            patient_data: Extracted patient information from Reducto
            insurance_data: Extracted insurance information from Reducto
            
        Returns:
            Dict containing patient processing results
        """
        try:
            print(f"Processing patient information: {patient_data}")
            
            # Map Reducto fields to our patient schema
            patient_create_data = {}
            
            # Required fields
            if patient_data.get("first_name"):
                patient_create_data["patient_fname"] = patient_data["first_name"]
            
            if patient_data.get("last_name"):
                patient_create_data["patient_lname"] = patient_data["last_name"]
            
            # Optional middle name
            if patient_data.get("middle_name"):
                patient_create_data["patient_mname"] = patient_data["middle_name"]
            
            # Date of birth - ensure we always YYYY-MM-DD format
            if patient_data.get("date_of_birth"):
                try:
                    # Convert string date to date object
                    if isinstance(patient_data["date_of_birth"], str):
                        date_obj = datetime.strptime(patient_data["date_of_birth"], "%Y-%m-%d").date()
                        patient_create_data["patient_dob"] = date_obj.isoformat()
                        print(f"Converted date_of_birth '{patient_data['date_of_birth']}' to ISO string: {date_obj.isoformat()}")
                    else:
                        patient_create_data["patient_dob"] = patient_data["date_of_birth"]
                except ValueError as e:
                    print(f"Error parsing date_of_birth '{patient_data['date_of_birth']}': {e}")
                    # Use default date string if parsing fails
                    patient_create_data["patient_dob"] = "1900-01-01"
            
            # Contact information
            if patient_data.get("phone_number"):
                patient_create_data["patient_contact_phone"] = patient_data["phone_number"]
            
            if patient_data.get("email"):
                patient_create_data["patient_contact_email"] = patient_data["email"]
            
            # Gender
            if patient_data.get("gender"):
                patient_create_data["patient_gender"] = patient_data["gender"]
            
            # Handle insurance information if available
            if insurance_data:
                print(f"Processing insurance data: {insurance_data}")
                # Extract insurance member ID from various possible fields
                insurance_member_id = (
                    insurance_data.get("policy_number") or 
                    insurance_data.get("member_id") or 
                    insurance_data.get("subscriber_id")
                )
                if insurance_member_id:
                    patient_create_data["patient_insurance_member_id"] = str(insurance_member_id)
                    print(f"Set insurance member ID: {insurance_member_id}")
            
            print(f"Mapped patient data: {patient_create_data}")
            
            # Try to find existing patient by name and DOB (only if we have these fields)
            print(f"Searching for existing patient...")
            existing_patient = None
            
            # Only search for existing patient if we have enough identifying information
            if (patient_create_data.get("patient_fname") and 
                patient_create_data.get("patient_lname") and 
                patient_create_data.get("patient_dob")):
                existing_patient = await ReferralService._find_existing_patient(
                    db, patient_create_data
                )
            else:
                print(f"Insufficient data for patient matching, will create new patient")
            
            if existing_patient:
                print(f"Found existing patient with ID: {existing_patient.patient_id}")
                # Update existing patient with new information using direct database update
                update_data = {
                    k: v for k, v in patient_create_data.items() 
                    if k not in ["patient_fname", "patient_lname", "patient_dob"]  # Don't update core identifying fields
                }
                
                if update_data:
                    print(f"Updating patient with data: {update_data}")
                    # Use direct database update since PatientUpdate schema doesn't have id field
                    result = await db.table("patients").update(update_data).eq("patient_id", str(existing_patient.patient_id)).execute()
                    print(f"Patient update result: {result}")
                    
                    if result.data:
                        from src.schemas.patients import Patient
                        updated_patient = Patient(**result.data[0])
                        print(f"Successfully updated patient: {updated_patient.patient_id}")
                        
                        return {
                            "status": "updated",
                            "patient_id": str(existing_patient.patient_id),
                            "patient_data": dict(updated_patient),
                            "action": "update",
                            "extracted_data": patient_data,
                            "insurance_data": insurance_data
                        }
                    else:
                        print(f"Patient update failed - no data returned")
                        return {
                            "status": "update_failed",
                            "patient_id": str(existing_patient.patient_id),
                            "error": "Failed to update patient record",
                            "action": "error"
                        }
                else:
                    print(f"No updates needed for existing patient")
                    return {
                        "status": "found_existing",
                        "patient_id": str(existing_patient.patient_id),
                        "patient_data": dict(existing_patient),
                        "action": "found",
                        "extracted_data": patient_data,
                        "insurance_data": insurance_data
                    }
            else:
                print(f"No existing patient found, creating new patient...")
                # Create new patient with whatever data we have
                # Set intelligent defaults for missing required fields
                if not patient_create_data.get("patient_fname"):
                    patient_create_data["patient_fname"] = "Unknown"
                
                if not patient_create_data.get("patient_lname"):
                    patient_create_data["patient_lname"] = "Patient"
                    
                if not patient_create_data.get("patient_dob"):
                    # Use a default date string if DOB is missing
                    patient_create_data["patient_dob"] = "1900-01-01"
                
                if not patient_create_data.get("patient_contact_phone"):
                    patient_create_data["patient_contact_phone"] = "000-000-0000"  # Default placeholder
                
                if not patient_create_data.get("patient_contact_email"):
                    patient_create_data["patient_contact_email"] = f"patient_{datetime.now().strftime('%Y%m%d_%H%M%S')}@placeholder.com"
                
                if not patient_create_data.get("patient_gender"):
                    patient_create_data["patient_gender"] = "Not Specified"
                
                print(f"Creating patient with final data (including defaults): {patient_create_data}")
                patient_create = PatientCreate(**patient_create_data)
                new_patient = await patients_crud.create(db, obj_in=patient_create)
                print(f"Successfully created new patient: {new_patient.patient_id}")
                
                return {
                    "status": "created",
                    "patient_id": str(new_patient.patient_id),
                    "patient_data": dict(new_patient),
                    "action": "create",
                    "extracted_data": patient_data,
                    "insurance_data": insurance_data
                }
                
        except Exception as e:
            print(f"Error processing patient information: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            return {
                "status": "error",
                "error": str(e),
                "patient_id": None,
                "action": "error"
            }

    @staticmethod
    async def _find_existing_patient(
        db: AsyncClient,
        patient_data: Dict[str, Any]
    ) -> Optional[Any]:
        """
        Find existing patient by name and date of birth
        """
        try:
            # Search for patient by first name, last name, and DOB using correct field names
            result = await db.table("patients").select("*").match({
                "patient_fname": patient_data.get("patient_fname"),
                "patient_lname": patient_data.get("patient_lname"),
                "patient_dob": patient_data.get("patient_dob")
            }).execute()
            
            if result.data:
                # Convert to Patient object for type consistency
                from src.schemas.patients import Patient
                return Patient(**result.data[0])
            
            return None
            
        except Exception as e:
            print(f"Error finding existing patient: {str(e)}")
            return None

    @staticmethod
    async def _process_referral_information(
        db: AsyncClient,
        referral_id: str,
        referral_data: Dict[str, Any],
        patient_result: Optional[Dict[str, Any]] = None,
        provider_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Update referral record with extracted information
        """
        try:
            print(f"Processing referral information for ID: {referral_id}")
            print(f"Referral data: {referral_data}")
            print(f"Patient result: {patient_result}")
            
            referral_updates = {}
            
            # Update patient_id if we have a patient result
            if patient_result and patient_result.get("patient_id"):
                referral_updates["patient_id"] = patient_result["patient_id"]
                print(f"Setting patient_id: {patient_result['patient_id']}")
            
            # Update referral date if available
            if referral_data.get("referral_date"):
                referral_updates["referral_outbound_date"] = referral_data["referral_date"]
                print(f"Setting referral_outbound_date: {referral_data['referral_date']}")

            # Update if there is a remark
            if referral_data.get("clinical_description"):
                referral_updates["referral_remark"] = referral_data["clinical_description"]
                print(f"Setting referral_remark: {referral_data['clinical_description']}")

            if provider_data.get("provider_name"):
                referral_updates["referral_doctor_name"] = provider_data["provider_name"]
                print(f"Setting referral_doctor_name: {provider_data['provider_name']}")
        
            
            # Update referral status based on form submission
            referral_updates["referral_status"] = "new" # new | active | archive
            referral_updates["referral_submitted"] = True
            referral_updates["referral_submitted_date"] = datetime.now().isoformat()
            
            # Only update if we have changes to make
            if referral_updates:
                # Use direct database update using referral_id field
                result = await db.table("referrals").update(referral_updates).eq("referral_id", referral_id).execute()
                print(f"Referral update result: {result}")
                
                if result.data:
                    print(f"Successfully updated referral: {referral_id}")
                    return {
                        "status": "updated",
                        "updates_applied": referral_updates,
                        "extracted_referral_data": referral_data
                    }
                else:
                    print(f"Referral update failed - no data returned")
                    return {
                        "status": "update_failed",
                        "error": "Failed to update referral record"
                    }
            
            return {"status": "no_updates_needed"}
            
        except Exception as e:
            print(f"Error updating referral information: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            return {
                "status": "error",
                "error": str(e)
            }
    


    @staticmethod
    async def _store_document_records(
        db: AsyncClient,
        referral_id: str,
        upload_results: List[Any],
        patient_result: Optional[Dict[str, Any]] = None
    ) -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Store document records in the documents table following the correct database schema
        This method will first delete any existing documents for this referral before storing new ones
        
        Args:
            db: Database client
            referral_id: ID of the referral
            upload_results: List of uploaded file results
            patient_result: Patient processing result (for patient_id)
            
        Returns:
            Tuple containing (List of created document records, deletion results)
        """
        try:
            print(f"Storing document records for referral: {referral_id}")
            print(f"Upload results count: {len(upload_results)}")
            print(f"Patient result: {patient_result}")
            
            # Step 1: Delete existing documents for this referral
            deletion_results = await ReferralService._delete_existing_documents(db, referral_id)
            
            # Step 2: Store new document records
            document_records = []
            patient_id = patient_result.get("patient_id") if patient_result else None
            
            for i, file_result in enumerate(upload_results):
                print(f"Processing file {i+1}: {file_result.filename}")
                
                # Create document record using the documents table schema
                document_data = {
                    "source": file_result.signed_url,  # Store the signed URL as source
                    "referral_id": referral_id,
                    "patient_id": patient_id,  # Will be None if no patient was processed
                    "document_category": getattr(file_result, 'document_category', None)  # Add document_category
                }
                
                print(f"Document data to insert: {document_data}")
                
                # Insert into documents table
                result = await db.table("documents").insert(document_data).execute()
                print(f"Document insert result: {result}")
                
                if result.data:
                    document_record = {
                        "document_id": result.data[0]["document_id"],
                        "created_at": result.data[0]["created_at"],
                        "source": result.data[0]["source"],
                        "referral_id": result.data[0]["referral_id"],
                        "patient_id": result.data[0]["patient_id"],
                        "document_category": result.data[0].get("document_category"),  # Include in response
                        "filename": file_result.filename,
                        "bucket_name": file_result.bucket_name
                    }
                    document_records.append(document_record)
                    print(f"Created document record for file: {file_result.filename} with ID: {result.data[0]['document_id']}")
                else:
                    print(f"Failed to create document record for file: {file_result.filename}")
            
            print(f"Successfully stored {len(document_records)} document records")
            return document_records, deletion_results
            
        except Exception as e:
            print(f"Error storing document records: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            raise

    @staticmethod
    async def _delete_existing_documents(
        db: AsyncClient,
        referral_id: str
    ) -> Dict[str, Any]:
        """
        Delete existing documents for a referral from both database and storage
        
        Args:
            db: Database client
            referral_id: ID of the referral
            
        Returns:
            Dict containing deletion results
        """
        try:
            print(f"Deleting existing documents for referral: {referral_id}")
            
            # Step 1: Get existing documents for this referral
            existing_docs_result = await db.table("documents").select("*").eq("referral_id", referral_id).execute()
            existing_documents = existing_docs_result.data if existing_docs_result.data else []
            
            if not existing_documents:
                print(f"No existing documents found for referral: {referral_id}")
                return {
                    "status": "no_documents_found",
                    "deleted_count": 0,
                    "storage_deletions": 0,
                    "errors": []
                }
            
            print(f"Found {len(existing_documents)} existing documents to delete")
            
            deleted_from_storage = 0
            storage_errors = []
            
            # Step 2: Delete files from storage
            for doc in existing_documents:
                try:
                    # Extract file path from the signed URL
                    source_url = doc.get("source", "")
                    if source_url:
                        # Parse the file path from the signed URL
                        # Supabase signed URLs typically contain the file path
                        # Example: https://project.supabase.co/storage/v1/object/sign/bucket/path/to/file?token=...
                        # We need to extract the path part: "referrals/{referral_id}/referral_form/{filename}"
                        
                        # For now, we'll construct the expected path based on the upload pattern
                        # This matches the pattern used in upload_referral_form: f"{base_path}/{id}/{type}/{file_name_with_extension}"
                        # Since we know the structure, we can try to delete from the expected location
                        
                        # Try to delete from storage using the bucket and path pattern
                        try:
                            # Extract bucket name and path from the source URL or use default
                            bucket_name = "referral-documents"  # Default bucket used for referral documents
                            
                            # Attempt to parse the actual file path from the URL
                            if "/object/sign/" in source_url:
                                # Parse the path from Supabase signed URL format
                                url_parts = source_url.split("/object/sign/")
                                if len(url_parts) > 1:
                                    path_part = url_parts[1].split("?")[0]  # Remove query parameters
                                    # Remove bucket name from path if it's included
                                    if path_part.startswith(f"{bucket_name}/"):
                                        file_path = path_part[len(f"{bucket_name}/"):]
                                    else:
                                        file_path = path_part
                                    
                                    print(f"Attempting to delete file from storage: {file_path}")
                                    delete_result = await db.storage.from_(bucket_name).remove([file_path])
                                    print(f"Storage deletion result: {delete_result}")
                                    deleted_from_storage += 1
                                else:
                                    print(f"Could not parse file path from URL: {source_url}")
                                    storage_errors.append(f"Could not parse file path from URL: {source_url}")
                            else:
                                print(f"URL format not recognized for deletion: {source_url}")
                                storage_errors.append(f"URL format not recognized: {source_url}")
                                
                        except Exception as storage_error:
                            error_msg = f"Failed to delete file from storage: {str(storage_error)}"
                            print(error_msg)
                            storage_errors.append(error_msg)
                    
                except Exception as doc_error:
                    error_msg = f"Error processing document {doc.get('document_id')}: {str(doc_error)}"
                    print(error_msg)
                    storage_errors.append(error_msg)
            
            # Step 3: Delete document records from database
            delete_result = await db.table("documents").delete().eq("referral_id", referral_id).execute()
            deleted_count = len(delete_result.data) if delete_result.data else 0
            
            print(f"Deleted {deleted_count} document records from database")
            print(f"Deleted {deleted_from_storage} files from storage")
            
            if storage_errors:
                print(f"Storage deletion errors: {storage_errors}")
            
            return {
                "status": "completed",
                "deleted_count": deleted_count,
                "storage_deletions": deleted_from_storage,
                "storage_errors": storage_errors,
                "original_document_count": len(existing_documents)
            }
            
        except Exception as e:
            print(f"Error deleting existing documents: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            return {
                "status": "error",
                "error": str(e),
                "deleted_count": 0,
                "storage_deletions": 0
            }


#mark the referral as scanned
    async def mark_referral_as_scanned(db: AsyncClient, slug: str) -> Referral:
        """
        Mark the referral as scanned
        """
        try:
            referral_updates = {
                "referral_scanned": True,
                "referral_scanned_date": datetime.now().isoformat()
            }
            result = await db.table("referrals").update(referral_updates).eq("referral_slug", slug).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Referral with slug {slug} not found"
                )
            
            # Return the first (and only) item from the list as a single Referral object
            return result.data[0]
        except HTTPException:
            # Re-raise HTTPException 
            raise
        except Exception as e:
            print(f"Error marking referral as scanned: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to mark referral as scanned: {str(e)}"
            )


    @staticmethod
    async def upload_document(
        db: AsyncClient, 
        referral_id: str, 
        form_data: dict, 
        document_type: str, 
        document_category: str
    ) -> dict:
        """
        Upload a document with document type and reference via referral_id and document_category
        
        Args:
            db: Supabase client
            referral_id: ID of the referral to attach documents to
            form_data: List of files to upload
            document_type: Type of document (e.g., "medical_record", "insurance_card", etc.)
            document_category: Category of document for storage organization
            
        Returns:
            Dict containing upload results and document records
        """
        try:
            print(f"Uploading documents for referral ID: {referral_id}, type: {document_type}, category: {document_category}")
            
            # Step 1: Upload the files to Supabase storage
            upload_results = await referrals_crud.upload_files(
                db=db, 
                id=referral_id, 
                files=form_data, 
                type=document_type,
                bucket_name="referral-documents",
                base_path="referrals",
                document_category=document_category
            )
            
            if not upload_results:
                raise HTTPException(
                    status_code=400,
                    detail="No files were uploaded successfully"
                )
            
            # Step 2: Store document records in documents table
            document_records = []
            
            for file_result in upload_results:
                print(f"Storing document record for file: {file_result.filename}")
                
                # Create document record using the documents table schema
                document_data = {
                    "source": file_result.signed_url,  # Store the signed URL as source
                    "referral_id": referral_id,
                    "patient_id": None,  # No patient extraction for general documents
                    "document_category": getattr(file_result, 'document_category', document_category)
                }
                
                print(f"Document data to insert: {document_data}")
                
                # Insert into documents table
                result = await db.table("documents").insert(document_data).execute()
                print(f"Document insert result: {result}")
                
                if result.data:
                    document_record = {
                        "document_id": result.data[0]["document_id"],
                        "created_at": result.data[0]["created_at"],
                        "source": result.data[0]["source"],
                        "referral_id": result.data[0]["referral_id"],
                        "patient_id": result.data[0]["patient_id"],
                        "document_category": result.data[0].get("document_category"),
                        "filename": file_result.filename,
                        "bucket_name": file_result.bucket_name,
                        "document_type": document_type
                    }
                    document_records.append(document_record)
                    print(f"Created document record for file: {file_result.filename} with ID: {result.data[0]['document_id']}")
                else:
                    print(f"Failed to create document record for file: {file_result.filename}")
            
            # Step 3: Return comprehensive results
            return {
                "upload_results": upload_results,
                "document_records": document_records,
                "referral_id": referral_id,
                "document_type": document_type,
                "document_category": document_category,
                "processed_files": len(upload_results),
                "stored_documents": len(document_records),
                "summary": {
                    "total_files": len(upload_results),
                    "documents_stored": len(document_records),
                    "upload_success": len(upload_results) > 0,
                    "storage_success": len(document_records) == len(upload_results)
                }
            }
            
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            print(f"Error uploading document: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload document: {str(e)}"
            )



    
  

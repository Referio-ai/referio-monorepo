from typing import Optional, Dict, List, Any
from uuid import UUID
from datetime import datetime, date
from supabase import AsyncClient
from fastapi import HTTPException

from src.crud.referrals import referrals_crud
from src.crud.patients import patients_crud
from src.schemas.referrals import Referral, ReferralWithDetails, ReferralUpdate
from src.schemas.patients import PatientCreate, PatientUpdate
from src.schemas.documents import DocumentCreate
from src.utils.reducto.reducto_utils import reducto_referral_extraction


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
        referral_slug: str
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
            referral_result = await db.table("referrals").select("*").eq("referral_slug", referral_slug).eq("deleted", False).execute()
            
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
                patient_insurance_member_id=patient_data.get('patient_insurance_member_id')
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

# upload referral form 
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
                base_path="referrals"
            )
            
            # Step 2: Process uploaded files through Reducto for data extraction
            extraction_results = []
            patient_data_extracted = None
            referral_data_extracted = None
            insurance_data_extracted = None
            uploaded_documents = []
            
            # If upload_results contains file information with signed URLs
            if upload_results and isinstance(upload_results, list):
                for file_result in upload_results:
                    if hasattr(file_result, 'signed_url') and file_result.signed_url:
                        try:
                            print(f"Processing file {file_result.filename} through Reducto...")
                            
                            # Extract data using Reducto AI
                            extracted_data = await reducto_referral_extraction(file_result.signed_url)
                            
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
                        db, referral_id, referral_data_extracted, patient_result
                    )
                    print(f"Referral information updated: {referral_updates}")
                except Exception as referral_error:
                    print(f"Warning: Failed to update referral information: {str(referral_error)}")
            
            # Step 5: Store document records in documents table
            if upload_results:
                try:
                    uploaded_documents = await ReferralService._store_document_records(
                        db, referral_id, upload_results, patient_result
                    )
                    print(f"Stored {len(uploaded_documents)} document records for referral {referral_id}")
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
                "document_records": uploaded_documents,
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
                    "documents_stored": len(uploaded_documents)
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
        patient_result: Optional[Dict[str, Any]] = None
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
            
            # Update referral status based on form submission
            referral_updates["referral_status"] = "Form Submitted"
            referral_updates["referral_submitted"] = True
            referral_updates["referral_submitted_date"] = datetime.now().isoformat()
            
            print(f"Referral updates to apply: {referral_updates}")
            
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
    ) -> List[Dict[str, Any]]:
        """
        Store document records in the documents table following the correct database schema
        
        Args:
            db: Database client
            referral_id: ID of the referral
            upload_results: List of uploaded file results
            patient_result: Patient processing result (for patient_id)
            
        Returns:
            List of created document records
        """
        try:
            print(f"Storing document records for referral: {referral_id}")
            print(f"Upload results count: {len(upload_results)}")
            print(f"Patient result: {patient_result}")
            
            document_records = []
            patient_id = patient_result.get("patient_id") if patient_result else None
            
            for i, file_result in enumerate(upload_results):
                print(f"Processing file {i+1}: {file_result.filename}")
                
                # Create document record using the documents table schema
                document_data = {
                    "source": file_result.signed_url,  # Store the signed URL as source
                    "referral_id": referral_id,
                    "patient_id": patient_id  # Will be None if no patient was processed
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
                        "filename": file_result.filename,
                        "bucket_name": file_result.bucket_name
                    }
                    document_records.append(document_record)
                    print(f"Created document record for file: {file_result.filename} with ID: {result.data[0]['document_id']}")
                else:
                    print(f"Failed to create document record for file: {file_result.filename}")
            
            print(f"Successfully stored {len(document_records)} document records")
            return document_records
            
        except Exception as e:
            print(f"Error storing document records: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            raise
    
  

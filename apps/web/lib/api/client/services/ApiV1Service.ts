/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_API_v1_upload_referral_document } from '../models/Body_API_v1_upload_referral_document';
import type { Facility } from '../models/Facility';
import type { FacilityCreate } from '../models/FacilityCreate';
import type { FacilityUpdate } from '../models/FacilityUpdate';
import type { GenerateBatchRequest } from '../models/GenerateBatchRequest';
import type { GenerateBatchResponse } from '../models/GenerateBatchResponse';
import type { Organization } from '../models/Organization';
import type { Patient } from '../models/Patient';
import type { PatientCreate } from '../models/PatientCreate';
import type { PatientUpdate } from '../models/PatientUpdate';
import type { Referral } from '../models/Referral';
import type { ReferralBatch } from '../models/ReferralBatch';
import type { ReferralBatchCreate } from '../models/ReferralBatchCreate';
import type { ReferralBatchUpdate } from '../models/ReferralBatchUpdate';
import type { ReferralCreate } from '../models/ReferralCreate';
import type { ReferralMessagesCreate } from '../models/ReferralMessagesCreate';
import type { ReferralStatusUpdate } from '../models/ReferralStatusUpdate';
import type { ReferralUpdate } from '../models/ReferralUpdate';
import type { Reward } from '../models/Reward';
import type { RewardCreate } from '../models/RewardCreate';
import type { RewardUpdate } from '../models/RewardUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiV1Service {
    /**
     * Get Organizations
     * @returns Organization Successful Response
     * @throws ApiError
     */
    public static apiV1GetOrganizations(): CancelablePromise<Array<Organization>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations/',
            errors: {
                404: `Organization Endpoints`,
            },
        });
    }
    /**
     * Get Referrals
     * Get all referrals
     * @returns Referral Successful Response
     * @throws ApiError
     */
    public static apiV1GetReferrals(): CancelablePromise<Array<Referral>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/',
            errors: {
                404: `Referral Endpoints`,
            },
        });
    }
    /**
     * Create Referral
     * Create a new referral
     * @returns Referral Successful Response
     * @throws ApiError
     */
    public static apiV1CreateReferral({
        requestBody,
    }: {
        requestBody: ReferralCreate,
    }): CancelablePromise<Referral> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Referral Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Referral
     * Get a specific referral by ID
     * @returns Referral Successful Response
     * @throws ApiError
     */
    public static apiV1GetReferral({
        referralId,
    }: {
        referralId: string,
    }): CancelablePromise<Referral> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            errors: {
                404: `Referral Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Referral
     * Update a referral
     * @returns Referral Successful Response
     * @throws ApiError
     */
    public static apiV1UpdateReferral({
        referralId,
        requestBody,
    }: {
        referralId: string,
        requestBody: ReferralUpdate,
    }): CancelablePromise<Referral> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/referrals/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Referral Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Referral
     * Delete a referral
     * @returns Referral Successful Response
     * @throws ApiError
     */
    public static apiV1DeleteReferral({
        referralId,
    }: {
        referralId: string,
    }): CancelablePromise<Referral> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/referrals/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            errors: {
                404: `Referral Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Referral Status
     * Update a referral
     * @returns Referral Successful Response
     * @throws ApiError
     */
    public static apiV1UpdateReferralStatus({
        referralId,
        requestBody,
    }: {
        referralId: string,
        requestBody: ReferralStatusUpdate,
    }): CancelablePromise<Referral> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/referrals/status/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Referral Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Referrals By Batch
     * Get all referrals for a specific batch
     * @returns Referral Successful Response
     * @throws ApiError
     */
    public static apiV1GetReferralsByBatch({
        batchId,
    }: {
        batchId: string,
    }): CancelablePromise<Array<Referral>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/batch/{batch_id}',
            path: {
                'batch_id': batchId,
            },
            errors: {
                404: `Referral Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload Referral Document
     * Upload a document for a referral
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1UploadReferralDocument({
        referralId,
        type,
        formData,
    }: {
        referralId: string,
        type: string,
        formData?: Body_API_v1_upload_referral_document,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals/upload/{referral_id}/{type}',
            path: {
                'referral_id': referralId,
                'type': type,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                404: `Referral Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Referral Files
     * Get a file for a referral
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1GetReferralFiles({
        referralId,
        type,
    }: {
        referralId: string,
        type: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/file/{referral_id}/{type}',
            path: {
                'referral_id': referralId,
                'type': type,
            },
            errors: {
                404: `Referral Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Batches
     * Get all referral batches
     *
     * Returns:
     * List[ReferralBatch]: A list of all referral batches in the system
     * Each ReferralBatch contains:
     * - id: UUID - Unique identifier for the batch
     * - name: str - Name of the batch
     * - description: Optional[str] - Description of the batch
     * - created_at: datetime - Creation timestamp
     * - updated_at: datetime - Last update timestamp
     * @returns ReferralBatch Successful Response
     * @throws ApiError
     */
    public static apiV1GetBatches(): CancelablePromise<Array<ReferralBatch>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/batches/',
            errors: {
                404: `Batch Endpoints`,
            },
        });
    }
    /**
     * Create Batch
     * Create a new referral batch
     *
     * Parameters:
     * batch (ReferralBatchCreate): The batch data to create containing:
     * - referral_batch_size: int - Size of the batch
     * - referral_outbound_facility_id: UUID - Outbound facility ID
     * - referral_inbound_facility_id: UUID - Inbound facility ID
     *
     * Returns:
     * ReferralBatch: The created referral batch object with:
     * - referral_batch_id: UUID - Batch identifier
     * - referral_batch_prefix: str - Prefix of the batch
     * - referral_batch_size: int - Size of the batch
     * - referral_outbound_facility_id: UUID - Outbound facility ID
     * - referral_inbound_facility_id: UUID - Inbound facility ID
     * - created_at: datetime - Creation timestamp
     * - updated_at: datetime - Last update timestamp
     * @returns ReferralBatch Successful Response
     * @throws ApiError
     */
    public static apiV1CreateBatch({
        requestBody,
    }: {
        requestBody: ReferralBatchCreate,
    }): CancelablePromise<ReferralBatch> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/batches/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Batch Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Batch
     * Get a specific referral batch by ID
     *
     * Parameters:
     * batch_id (str): The unique identifier of the batch to retrieve
     *
     * Returns:
     * ReferralBatch: The requested referral batch object containing:
     * - id: UUID - Unique identifier for the batch
     * - name: str - Name of the batch
     * - description: Optional[str] - Description of the batch
     * - created_at: datetime - Creation timestamp
     * - updated_at: datetime - Last update timestamp
     *
     * Raises:
     * HTTPException: 404 if the batch is not found
     * @returns ReferralBatch Successful Response
     * @throws ApiError
     */
    public static apiV1GetBatch({
        batchId,
    }: {
        batchId: string,
    }): CancelablePromise<ReferralBatch> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/batches/{batch_id}',
            path: {
                'batch_id': batchId,
            },
            errors: {
                404: `Batch Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Batch
     * Update a referral batch
     *
     * Parameters:
     * batch_id (str): The unique identifier of the batch to update
     * batch (ReferralBatchUpdate): The updated batch data containing:
     * - name: Optional[str] - New name of the batch
     * - description: Optional[str] - New description of the batch
     *
     * Returns:
     * ReferralBatch: The updated referral batch object with:
     * - id: UUID - Batch identifier
     * - name: str - Updated name
     * - description: Optional[str] - Updated description
     * - created_at: datetime - Original creation timestamp
     * - updated_at: datetime - New update timestamp
     * @returns ReferralBatch Successful Response
     * @throws ApiError
     */
    public static apiV1UpdateBatch({
        batchId,
        requestBody,
    }: {
        batchId: string,
        requestBody: ReferralBatchUpdate,
    }): CancelablePromise<ReferralBatch> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/batches/{batch_id}',
            path: {
                'batch_id': batchId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Batch Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Batch
     * Delete a referral batch
     *
     * Parameters:
     * batch_id (str): The unique identifier of the batch to delete
     *
     * Returns:
     * ReferralBatch: The deleted referral batch object containing:
     * - id: UUID - Deleted batch identifier
     * - name: str - Name of the deleted batch
     * - description: Optional[str] - Description of the deleted batch
     * - created_at: datetime - Creation timestamp
     * - updated_at: datetime - Last update timestamp
     * @returns ReferralBatch Successful Response
     * @throws ApiError
     */
    public static apiV1DeleteBatch({
        batchId,
    }: {
        batchId: string,
    }): CancelablePromise<ReferralBatch> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/batches/{batch_id}',
            path: {
                'batch_id': batchId,
            },
            errors: {
                404: `Batch Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Batch
     * Generate a new batch of referrals
     *
     * This endpoint creates a new referral batch and generates the specified number
     * of referrals within that batch. Each referral will be associated with the
     * batch and can be tracked together.
     *
     * Parameters:
     * request (GenerateBatchRequest): The batch generation request containing:
     * - name: str - Name for the new batch
     * - description: Optional[str] - Description of the batch
     * - count: int - Number of referrals to generate
     * - template_id: Optional[UUID] - ID of the referral template to use
     *
     * Returns:
     * GenerateBatchResponse: The generation result containing:
     * - batch: ReferralBatch - The created batch object
     * - referrals: List[Referral] - List of generated referrals
     * - total_generated: int - Total number of referrals generated
     * @returns GenerateBatchResponse Successful Response
     * @throws ApiError
     */
    public static apiV1GenerateBatch({
        requestBody,
    }: {
        requestBody: GenerateBatchRequest,
    }): CancelablePromise<GenerateBatchResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/batches/generate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Batch Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Batch Referrals
     * Get all referrals for a specific batch
     *
     * Parameters:
     * batch_id (UUID): The unique identifier of the batch
     *
     * Returns:
     * List: A list of referrals associated with the batch, each containing:
     * - id: UUID - Referral identifier
     * - code: str - Unique referral code
     * - status: str - Current status of the referral
     * - created_at: datetime - Creation timestamp
     * - batch_id: UUID - Associated batch identifier
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1GetBatchReferrals({
        batchId,
    }: {
        batchId: string,
    }): CancelablePromise<Array<any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/batches/{batch_id}/referrals',
            path: {
                'batch_id': batchId,
            },
            errors: {
                404: `Batch Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Batch Summary
     * Get a summary of a batch including statistics
     *
     * Parameters:
     * batch_id (UUID): The unique identifier of the batch
     *
     * Returns:
     * dict: A summary dictionary containing:
     * - total_referrals: int - Total number of referrals in the batch
     * - active_referrals: int - Number of active referrals
     * - used_referrals: int - Number of used referrals
     * - conversion_rate: float - Percentage of referrals converted
     * - created_at: datetime - Batch creation timestamp
     * - last_activity: datetime - Timestamp of last referral activity
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1GetBatchSummary({
        batchId,
    }: {
        batchId: string,
    }): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/batches/{batch_id}/summary',
            path: {
                'batch_id': batchId,
            },
            errors: {
                404: `Batch Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Patients
     * Get all patients
     *
     * Returns:
     * List[Patient]: A list of all patients in the system
     * Each Patient contains:
     * - patient_id: UUID - Unique identifier for the patient
     * - patient_fname: str - First name of the patient
     * - patient_mname: Optional[str] - Middle name of the patient
     * - patient_lname: str - Last name of the patient
     * - patient_dob: date - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_dob: str - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
     * @returns Patient Successful Response
     * @throws ApiError
     */
    public static apiV1GetPatients(): CancelablePromise<Array<Patient>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/patients/',
            errors: {
                404: `Patient Endpoints`,
            },
        });
    }
    /**
     * Create Patient
     * Create a new patient
     *
     * Parameters:
     * patient (PatientCreate): The patient data to create
     *
     * Returns:
     * Patient: The created patient object containing:
     * - patient_id: UUID - Unique identifier for the patient
     * - patient_fname: str - First name of the patient
     * - patient_mname: Optional[str] - Middle name of the patient
     * - patient_lname: str - Last name of the patient
     * - patient_dob: date - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
     *
     * Raises:
     * HTTPException: 400 if the creation fails
     * @returns Patient Successful Response
     * @throws ApiError
     */
    public static apiV1CreatePatient({
        requestBody,
    }: {
        requestBody: PatientCreate,
    }): CancelablePromise<Patient> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/patients/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Patient Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Patient
     * Get a specific patient by ID
     *
     * Parameters:
     * patient_id (str): The unique identifier of the patient to retrieve
     *
     * Returns:
     * Patient: The requested patient object containing:
     * - patient_id: UUID - Unique identifier for the patient
     * - patient_fname: str - First name of the patient
     * - patient_mname: Optional[str] - Middle name of the patient
     * - patient_lname: str - Last name of the patient
     * - patient_dob: date - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
     *
     * Raises:
     * HTTPException: 404 if the patient is not found
     * @returns Patient Successful Response
     * @throws ApiError
     */
    public static apiV1GetPatient({
        patientId,
    }: {
        patientId: string,
    }): CancelablePromise<Patient> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/patients/{patient_id}',
            path: {
                'patient_id': patientId,
            },
            errors: {
                404: `Patient Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Patient
     * Update a patient
     *
     * Parameters:
     * patient_id (str): The unique identifier of the patient to update
     * patient (PatientUpdate): The updated patient data
     *
     * Returns:
     * Patient: The updated patient object containing:
     * - patient_id: UUID - Unique identifier for the patient
     * - patient_fname: str - First name of the patient
     * - patient_mname: Optional[str] - Middle name of the patient
     * - patient_lname: str - Last name of the patient
     * - patient_dob: date - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
     *
     * Raises:
     * HTTPException: 400 if the update fails
     * @returns Patient Successful Response
     * @throws ApiError
     */
    public static apiV1UpdatePatient({
        patientId,
        requestBody,
    }: {
        patientId: string,
        requestBody: PatientUpdate,
    }): CancelablePromise<Patient> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/patients/{patient_id}',
            path: {
                'patient_id': patientId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Patient Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Patient
     * Delete a patient
     *
     * Parameters:
     * patient_id (str): The unique identifier of the patient to delete
     *
     * Returns:
     * Patient: The deleted patient object containing:
     * - patient_id: UUID - Unique identifier for the patient
     * - patient_fname: str - First name of the patient
     * - patient_mname: Optional[str] - Middle name of the patient
     * - patient_lname: str - Last name of the patient
     * - patient_dob: date - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
     *
     * Raises:
     * HTTPException: 400 if the deletion fails
     * @returns Patient Successful Response
     * @throws ApiError
     */
    public static apiV1DeletePatient({
        patientId,
    }: {
        patientId: string,
    }): CancelablePromise<Patient> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/patients/{patient_id}',
            path: {
                'patient_id': patientId,
            },
            errors: {
                404: `Patient Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Rewards
     * Get all rewards
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1GetRewards(): CancelablePromise<Array<Reward>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/rewards/',
            errors: {
                404: `Rewards Endpoints`,
            },
        });
    }
    /**
     * Create Reward
     * Create a new reward
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1CreateReward({
        requestBody,
    }: {
        requestBody: RewardCreate,
    }): CancelablePromise<Reward> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/rewards/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Rewards Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Reward
     * Get a specific reward by ID
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1GetReward({
        rewardId,
    }: {
        rewardId: string,
    }): CancelablePromise<Reward> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/rewards/{reward_id}',
            path: {
                'reward_id': rewardId,
            },
            errors: {
                404: `Rewards Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Reward
     * Update a reward
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1UpdateReward({
        rewardId,
        requestBody,
    }: {
        rewardId: string,
        requestBody: RewardUpdate,
    }): CancelablePromise<Reward> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/rewards/{reward_id}',
            path: {
                'reward_id': rewardId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Rewards Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Reward
     * Delete a reward
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1DeleteReward({
        rewardId,
    }: {
        rewardId: string,
    }): CancelablePromise<Reward> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/rewards/{reward_id}',
            path: {
                'reward_id': rewardId,
            },
            errors: {
                404: `Rewards Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Rewards By Batch
     * Get all rewards for a specific batch
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1GetRewardsByBatch({
        batchId,
    }: {
        batchId: string,
    }): CancelablePromise<Array<Reward>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/rewards/batch/{batch_id}',
            path: {
                'batch_id': batchId,
            },
            errors: {
                404: `Rewards Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Facilities
     * Get all facilities
     * @returns Facility Successful Response
     * @throws ApiError
     */
    public static apiV1GetFacilities(): CancelablePromise<Array<Facility>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilities/',
            errors: {
                404: `Facilities Endpoints`,
            },
        });
    }
    /**
     * Create Reward
     * Create a new reward
     * @returns Facility Successful Response
     * @throws ApiError
     */
    public static apiV1CreateReward1({
        requestBody,
    }: {
        requestBody: FacilityCreate,
    }): CancelablePromise<Facility> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/facilities/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Facilities Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Reward
     * Get a specific reward by ID
     * @returns Facility Successful Response
     * @throws ApiError
     */
    public static apiV1GetReward1({
        rewardId,
    }: {
        rewardId: string,
    }): CancelablePromise<Facility> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilities/{reward_id}',
            path: {
                'reward_id': rewardId,
            },
            errors: {
                404: `Facilities Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Reward
     * Update a reward
     * @returns Facility Successful Response
     * @throws ApiError
     */
    public static apiV1UpdateReward1({
        rewardId,
        requestBody,
    }: {
        rewardId: string,
        requestBody: FacilityUpdate,
    }): CancelablePromise<Facility> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/facilities/{reward_id}',
            path: {
                'reward_id': rewardId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Facilities Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Reward
     * Delete a reward
     * @returns Facility Successful Response
     * @throws ApiError
     */
    public static apiV1DeleteReward1({
        rewardId,
    }: {
        rewardId: string,
    }): CancelablePromise<Facility> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/facilities/{reward_id}',
            path: {
                'reward_id': rewardId,
            },
            errors: {
                404: `Facilities Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Facilities By Batch
     * Get all facilities for a specific batch
     * @returns Facility Successful Response
     * @throws ApiError
     */
    public static apiV1GetFacilitiesByBatch({
        batchId,
    }: {
        batchId: string,
    }): CancelablePromise<Array<Facility>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilities/batch/{batch_id}',
            path: {
                'batch_id': batchId,
            },
            errors: {
                404: `Facilities Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Messages By Referral Id
     * Get all messages by referral ID
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1GetMessagesByReferralId({
        referralId,
    }: {
        referralId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals-messages/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Message
     * Create a new message for a referral
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1CreateMessage({
        requestBody,
    }: {
        requestBody: ReferralMessagesCreate,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals-messages/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload Referral Document
     * Upload a document for a referral messages
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1UploadReferralDocument1({
        messageId,
        type,
        formData,
    }: {
        messageId: string,
        type: string,
        formData?: Body_API_v1_upload_referral_document,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals-messages/upload/{message_id}/{type}',
            path: {
                'message_id': messageId,
                'type': type,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Referral Files
     * Get a file for a referral messages
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1GetReferralFiles1({
        messageId,
        type,
    }: {
        messageId: string,
        type: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals-messages/file/{message_id}/{type}',
            path: {
                'message_id': messageId,
                'type': type,
            },
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }
}

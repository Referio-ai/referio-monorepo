/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GenerateBatchRequest } from '../models/GenerateBatchRequest';
import type { GenerateBatchResponse } from '../models/GenerateBatchResponse';
import type { ReferralBatch } from '../models/ReferralBatch';
import type { ReferralBatchCreate } from '../models/ReferralBatchCreate';
import type { ReferralBatchUpdate } from '../models/ReferralBatchUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BatchesService {
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
}

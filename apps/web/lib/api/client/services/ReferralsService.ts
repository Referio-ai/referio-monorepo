/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Referral } from '../models/Referral';
import type { ReferralCreate } from '../models/ReferralCreate';
import type { ReferralUpdate } from '../models/ReferralUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReferralsService {
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
}

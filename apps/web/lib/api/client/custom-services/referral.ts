import type { Referral } from '../models/Referral';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ReferralService {
    /**
     * Get Referral by Slug
     * Get a referral by its slug identifier
     * @returns Referral Successful Response
     * @throws ApiError
     */
    public static apiV1GetReferralBySlug({
        slug,
    }: {
        slug: string,
    }): CancelablePromise<Referral> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/slug/{referral_id}',
            path: {
                'referral_id': slug,
            },
            errors: {
                404: `Referral not found`,
                422: `Validation Error`,
            },
        });
    }

    public static apiV1UploadReferralFormWithExtraction({
        referralId,
        files,
    }: {
        referralId: string,
        files: File[],
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals/upload-form/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            formData: {
                files: files,
            },
            mediaType: 'multipart/form-data',
        });
    }
} 

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

    public static getReferralsWithDetails({
        page,
        page_size,
        search,
    }: {
        page: number,
        page_size: number,
        search: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/with-details/',
            query: {
                page,
                page_size,
                search,
            },
            errors: {
                404: `Referral Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    public static markReferralAsScanned({
        slug,
    }: {
        slug: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals/mark-as-scanned/{referral_id}',
            path: {
                'referral_id': slug,
            },
        });
    }

    public static uploadDocument({
        referralId,
        formData,
        documentType,
        documentCategory,
    }: {
        referralId: string,
        formData: File[],
        documentType: string,
        documentCategory: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals/upload-document/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            formData: {
                formData: formData,
                document_type: documentType,
                document_category: documentCategory,
            },
            mediaType: 'multipart/form-data',
        });
    }

    public static getScannedReferralsCount(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/scanned/count',
        });
    }

    //scanned referrals
    public static getScannedReferrals({
        page,
        page_size,
        search,
        status,
    }: {
        page: number,   
        page_size: number,
        search: string,
        status: string,
    }): CancelablePromise<any> {

        console.log("page", page);
        console.log("page_size", page_size);
        console.log("search", search);

        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/scanned/',
            query: {
                page,
                page_size,
                search,
                status,
            },
        });
    }


 
} 




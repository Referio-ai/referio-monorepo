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
        batchPrefix,
    }: {
        slug: string,
        batchPrefix: string,
    }): CancelablePromise<Referral> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/slug/{batch_prefix}/{referral_id}',
            path: {
                'batch_prefix': batchPrefix,
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
        is_urgent,
    }: {
        referralId: string,
        files: File[],
        is_urgent?: boolean,
    }): CancelablePromise<any> {
        const formData: any = {
            files: files,
        };
        
        // Only include is_urgent if it's provided
        if (is_urgent !== undefined) {
            formData.is_urgent = is_urgent;
        }
        
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals/upload-form/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    public static getReferralsWithDetails({
        page,
        page_size,
        search,
        batch_prefix,
    }: {
        page: number,
        page_size: number,
        search: string,
        batch_prefix: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/with-details/',
            query: {
                page,
                page_size,
                search,
                batch_prefix,
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

    public static getReferralsForQrPrinting({
        batchPrefix,
    }: {
        batchPrefix: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/qr-print/{batch_prefix}',
            path: {
                'batch_prefix': batchPrefix,
            },
        });
    }

    public static uploadReferralFormAsync({
        referralId,
        files,
        is_urgent,
    }: {
        referralId: string,
        files: File[],
        is_urgent?: boolean,
    }): CancelablePromise<any> {
        const formData: any = {
            files: files,
        };
        
        // Only include is_urgent if it's provided
        if (is_urgent !== undefined) {
            formData.is_urgent = is_urgent;
        }
        
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals/upload-form-async/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    public static updateReferralStatus({
        referralId,
        status,
        notes,
        appointmentDate,
        appointmentType,
    }: {
        referralId: string,
        status: string,
        notes: string,
        appointmentDate?: string,
        appointmentType?: string,
    }): CancelablePromise<any> {
        const requestBody: any = {
            referral: {
                status_type: status,
                notes,
            }
        };

        // Only include appointment fields if they are provided
        if (appointmentDate) {
            requestBody.referral.appointment_date = appointmentDate;
        }
        if (appointmentType) {
            requestBody.referral.appointment_type = appointmentType;
        }

        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/referrals/status/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            body: requestBody,
        });
    }

    public static getFacilitatorInboundReferrals({
        page,
        facilitator_facility_id,
        page_size,
        search,
        status,
        sort_by,
    }: {
        page: number,
        facilitator_facility_id: string,
        page_size: number,
        search: string,
        status: string,
        sort_by?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/facilitator-inbound-referrals',
            query: {
                page,
                facilitator_facility_id,
                page_size,
                search,
                status,
                sort_by,
            },
        });
    }

    public static getFacilitatorOutboundReferrals({
        page,
        facilitator_facility_id,
        page_size,
        search,
        status,
        sort_by,
    }: {
        page: number,
        facilitator_facility_id: string,
        page_size: number,
        search: string,
        status: string,
        sort_by?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/facilitator-outbound-referrals',
            query: {
                page,
                facilitator_facility_id,
                page_size,
                search,
                status,
                sort_by,
            },
        });
    }

    public static getReferralStatusHistory({
        referralId,
    }: {
        referralId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals/status-history/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            errors: {
                404: `Referral not found`,
                422: `Validation Error`,
            },
        });
    }
} 




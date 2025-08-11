import { Facilitator } from "../models/Facilitator";
import { FacilitatorCreate } from "../models/FacilitatorCreate";
import { FacilitatorUpdate } from "../models/FacilitatorUpdate";
import { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    pagination: {
        total_count: number;
        total_pages: number;
        current_page: number;
        page_size: number;
        total: number;
    };
}

export interface PasswordChangeRequest {
    new_password: string;
}

export class FacilitatorService {
    public static apiV1GetFacilitators({
        page,
        pageSize,
        search,
        facilityId,
        }: {
        page: number,
        pageSize: number,
        search: string,
        facilityId: string,
    }): CancelablePromise<PaginatedResponse<Facilitator>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilitators',
            query: {
                page,
                pageSize,
                search,
                facilityId,
            },
        });
    }

    public static apiV1GetFacilitatorById({
        facilitatorId,
    }: {
        facilitatorId: string,
    }): CancelablePromise<Facilitator> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilitators/{facilitator_id}',
            path: {
                'facilitator_id': facilitatorId,
            },
        });
    }

    public static apiV1CreateFacilitator({
        requestBody,
    }: {
        requestBody: FacilitatorCreate,
    }): CancelablePromise<Facilitator> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/facilitators',
            body: requestBody,
        });
    }

    public static apiV1CreateFacilitatorWithMultipleFacilities({
        requestBody,
    }: {
        requestBody: {
            facilitator_first_name: string;
            facilitator_last_name: string;
            facilitator_full_name: string;
            facilitator_email: string;
            facilitator_status: string;
            deleted: boolean;
            password: string;
            facilitator_phone_number: string;
            propelauth_user_id?: string;
            facility_ids: string[];
        },
    }): CancelablePromise<{
        facilitator: Facilitator;
        user_facilities: any[];
        propelauth_user: any;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/facilitators/multiple-facilities',
            body: requestBody,
        });
    }

    public static apiV1UpdateFacilitator({
        facilitatorId,
        requestBody,
    }: {
        facilitatorId: string,
        requestBody: FacilitatorUpdate,
    }): CancelablePromise<Facilitator> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/facilitators/{facilitator_id}',
            path: {
                'facilitator_id': facilitatorId,
            },
            body: requestBody,
        });
    }

    public static apiV1ChangeFacilitatorPassword({
        facilitatorId,
        requestBody,
    }: {
        facilitatorId: string,
        requestBody: PasswordChangeRequest,
    }): CancelablePromise<{ success: boolean; message: string }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/facilitators/{facilitator_id}/change-password',
            path: {
                'facilitator_id': facilitatorId,
            },
            body: requestBody,
        });
    }

    public static apiV1UpdateFacilitatorWithMultipleFacilities({
        facilitatorId,
        requestBody,
    }: {
        facilitatorId: string,
        requestBody: {
            facilitator_first_name?: string;
            facilitator_last_name?: string;
            facilitator_full_name?: string;
            facilitator_email?: string;
            facilitator_status?: string;
            facilitator_phone_number?: string;
            deleted?: boolean;
            facility_ids?: string[];
        },
    }): CancelablePromise<{
        facilitator: Facilitator;
        user_facilities: any[];
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/facilitators/{facilitator_id}/multiple-facilities',
            path: {
                'facilitator_id': facilitatorId,
            },
            body: requestBody,
        });
    }

    public static apiV1GetUserFacilitiesByFacilitatorId({
        facilitatorId,
    }: {
        facilitatorId: string,
    }): CancelablePromise<any[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilitators/{facilitator_id}/user-facilities',
            path: {
                'facilitator_id': facilitatorId,
            },
        });
    }
    
}
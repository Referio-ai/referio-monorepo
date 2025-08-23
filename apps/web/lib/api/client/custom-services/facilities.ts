import { Facility } from "../models/Facility";
import { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        total_count: number;
        total_pages: number;
        current_page: number;
        page_size: number;
        total: number;
    };
}

export class FacilitiesService {
    public static apiV1GetFacilities({
        page,
        pageSize,
        search,
        organizationId,
        }: {
        page: number,
        pageSize: number,
        search: string,
        organizationId?: string,
    }): CancelablePromise<PaginatedResponse<Facility>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilities',
            query: {
                page,
                pageSize,
                search,
                organization_id:organizationId,
            },
        });
    }

    public static apiV1GetFacilityById({
        facilityId,
    }: {
        facilityId: string,
    }): CancelablePromise<Facility> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilities/{facility_id}',
            path: {
                'facility_id': facilityId,
            },
        });
    }

    public static apiV1GetFacilitiesByUserId({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<Facility[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilities/by-user/{user_id}',
            path: {
                'user_id': userId,
            },
        });
    }
} 
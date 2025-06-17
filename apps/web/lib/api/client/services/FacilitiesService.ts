/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Facility } from '../models/Facility';
import type { FacilityCreate } from '../models/FacilityCreate';
import type { FacilityPagination } from '../models/FacilityPagination';
import type { FacilityUpdate } from '../models/FacilityUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FacilitiesService {
    /**
     * Get Facilities
     * Get all facilities
     * @returns FacilityPagination Successful Response
     * @throws ApiError
     */
    public static apiV1GetFacilities({
        page = 1,
        pageSize = 10,
        search = '',
    }: {
        page?: number,
        pageSize?: number,
        search?: string,
    }): CancelablePromise<FacilityPagination> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilities/',
            query: {
                'page': page,
                'page_size': pageSize,
                'search': search,
            },
            errors: {
                404: `Facilities Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Facility
     * Create a new facility
     * @returns Facility Successful Response
     * @throws ApiError
     */
    public static apiV1CreateFacility({
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
     * Get Facility
     * Get a specific facility by ID
     * @returns Facility Successful Response
     * @throws ApiError
     */
    public static apiV1GetFacility({
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
            errors: {
                404: `Facilities Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Facility
     * Update a facility
     * @returns Facility Successful Response
     * @throws ApiError
     */
    public static apiV1UpdateFacility({
        facilityId,
        requestBody,
    }: {
        facilityId: string,
        requestBody: FacilityUpdate,
    }): CancelablePromise<Facility> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/facilities/{facility_id}',
            path: {
                'facility_id': facilityId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Facilities Endpoints`,
                422: `Validation Error`,
            },
        });
    }
}

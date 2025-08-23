/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Facilitator } from '../models/Facilitator';
import type { FacilitatorCreate } from '../models/FacilitatorCreate';
import type { FacilitatorPagination } from '../models/FacilitatorPagination';
import type { FacilitatorWithFacilitiesPagination } from '../models/FacilitatorWithFacilitiesPagination';
import type { FacilitatorUpdate } from '../models/FacilitatorUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FacilitatorsService {
    /**
     * Get All Facilitators
     * Get all facilitators with facilities
     * @returns FacilitatorWithFacilitiesPagination Successful Response
     * @throws ApiError
     */
    public static apiV1GetFacilitators({
        page = 1,
        pageSize = 10,
        search = '',
    }: {
        page?: number,
        pageSize?: number,
        search?: string,
    }): CancelablePromise<FacilitatorWithFacilitiesPagination> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilitators/',
            query: {
                'page': page,
                'page_size': pageSize,
                'search': search,
            },
            errors: {
                404: `Facilitator Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Facilitator
     * Get a specific facilitator by ID
     * @returns Facilitator Successful Response
     * @throws ApiError
     */
    public static apiV1GetFacilitator({
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
            errors: {
                404: `Facilitator Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Facilitators By Facility
     * Get all facilitators for a specific facility
     * @returns Array<Facilitator> Successful Response
     * @throws ApiError
     */
    public static apiV1GetFacilitatorsByFacility({
        facilityId,
    }: {
        facilityId: string,
    }): CancelablePromise<Array<Facilitator>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilitators/facility/{facility_id}',
            path: {
                'facility_id': facilityId,
            },
            errors: {
                404: `Facilitator Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Facilitator By PropelAuth User Id
     * Get a facilitator by PropelAuth user ID
     * @returns Facilitator Successful Response
     * @throws ApiError
     */
    public static apiV1GetFacilitatorByPropelauthUserId({
        propelauthUserId,
    }: {
        propelauthUserId: string,
    }): CancelablePromise<Facilitator> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facilitators/propelauth/{propelauth_user_id}',
            path: {
                'propelauth_user_id': propelauthUserId,
            },
            errors: {
                404: `Facilitator Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Facilitator
     * Create a new facilitator
     * @returns Facilitator Successful Response
     * @throws ApiError
     */
    public static apiV1CreateFacilitator({
        requestBody,
    }: {
        requestBody: FacilitatorCreate,
    }): CancelablePromise<Facilitator> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/facilitators/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Facilitator Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Facilitator
     * Update a facilitator
     * @returns Facilitator Successful Response
     * @throws ApiError
     */
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
            mediaType: 'application/json',
            errors: {
                404: `Facilitator Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Facilitator
     * Delete a facilitator
     * @returns Facilitator Successful Response
     * @throws ApiError
     */
    public static apiV1DeleteFacilitator({
        facilitatorId,
    }: {
        facilitatorId: string,
    }): CancelablePromise<Facilitator> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/facilitators/{facilitator_id}',
            path: {
                'facilitator_id': facilitatorId,
            },
            errors: {
                404: `Facilitator Endpoints`,
                422: `Validation Error`,
            },
        });
    }
} 
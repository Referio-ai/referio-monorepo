/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Facility } from '../models/Facility';
import type { FacilityCreate } from '../models/FacilityCreate';
import type { FacilityUpdate } from '../models/FacilityUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FacilitiesService {
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
    public static apiV1CreateReward({
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
    public static apiV1GetReward({
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
    public static apiV1UpdateReward({
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
    public static apiV1DeleteReward({
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
}

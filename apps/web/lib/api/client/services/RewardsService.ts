/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Reward } from '../models/Reward';
import type { RewardCreate } from '../models/RewardCreate';
import type { RewardUpdate } from '../models/RewardUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RewardsService {
    /**
     * Get Rewards
     * Get all rewards
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1GetRewards(): CancelablePromise<Array<Reward>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/rewards/',
            errors: {
                404: `Rewards Endpoints`,
            },
        });
    }
    /**
     * Create Reward
     * Create a new reward
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1CreateReward({
        requestBody,
    }: {
        requestBody: RewardCreate,
    }): CancelablePromise<Reward> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/rewards/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Rewards Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Reward
     * Get a specific reward by ID
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1GetReward({
        rewardId,
    }: {
        rewardId: string,
    }): CancelablePromise<Reward> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/rewards/{reward_id}',
            path: {
                'reward_id': rewardId,
            },
            errors: {
                404: `Rewards Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Reward
     * Update a reward
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1UpdateReward({
        rewardId,
        requestBody,
    }: {
        rewardId: string,
        requestBody: RewardUpdate,
    }): CancelablePromise<Reward> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/rewards/{reward_id}',
            path: {
                'reward_id': rewardId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Rewards Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Reward
     * Delete a reward
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1DeleteReward({
        rewardId,
    }: {
        rewardId: string,
    }): CancelablePromise<Reward> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/rewards/{reward_id}',
            path: {
                'reward_id': rewardId,
            },
            errors: {
                404: `Rewards Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Rewards By Batch
     * Get all rewards for a specific batch
     * @returns Reward Successful Response
     * @throws ApiError
     */
    public static apiV1GetRewardsByBatch({
        batchId,
    }: {
        batchId: string,
    }): CancelablePromise<Array<Reward>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/rewards/batch/{batch_id}',
            path: {
                'batch_id': batchId,
            },
            errors: {
                404: `Rewards Endpoints`,
                422: `Validation Error`,
            },
        });
    }
}

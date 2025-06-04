/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiV1Service {
    /**
     * Get User
     * @returns User Successful Response
     * @throws ApiError
     */
    public static apiV1GetUser(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/',
            errors: {
                404: `User Endpoints`,
            },
        });
    }
}

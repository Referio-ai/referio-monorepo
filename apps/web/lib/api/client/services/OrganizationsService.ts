/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Organization } from '../models/Organization';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrganizationsService {
    /**
     * Get Organizations
     * @returns Organization Successful Response
     * @throws ApiError
     */
    public static apiV1GetOrganizations(): CancelablePromise<Array<Organization>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations/',
            errors: {
                404: `Organization Endpoints`,
            },
        });
    }
}

import type { Organization } from '../models/Organization';
import type { OrganizationCreate } from '../models/OrganizationCreate';
import type { OrganizationUpdate } from '../models/OrganizationUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class OrganizationsService {
    /**
     * Get Organizations with pagination
     * @returns Organization Successful Response
     * @throws ApiError
     */
    public static apiV1GetOrganizations({ page, pageSize, search }: { page: number; pageSize: number; search: string }): CancelablePromise<any> {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page.toString());
        if (pageSize) queryParams.append('page_size', pageSize.toString());
        if (search) queryParams.append('search', search);

        return __request(OpenAPI, {
            method: 'GET',
            url: `/api/v1/organizations/?${queryParams.toString()}`,
            errors: {
                404: `Organization Endpoints`,
            },
        });
    }

    /**
     * Get all organizations without pagination
     * @returns Organization Successful Response
     * @throws ApiError
     */
    public static apiV1GetAllOrganizations(): CancelablePromise<Array<Organization>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/organizations/all/list',
            errors: {
                404: `Organization Endpoints`,
            },
        });
    }

    /**
     * Create a new organization
     * @returns Organization Successful Response
     * @throws ApiError
     */
    public static apiV1CreateOrganization({ requestBody }: { requestBody: OrganizationCreate }): CancelablePromise<Organization> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/organizations/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                404: `Organization Endpoints`,
            },
        });
    }

    /**
     * Update an organization
     * @returns Organization Successful Response
     * @throws ApiError
     */
    public static apiV1UpdateOrganization({ organizationId, requestBody }: { organizationId: string; requestBody: OrganizationUpdate }): CancelablePromise<Organization> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: `/api/v1/organizations/${organizationId}`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                404: `Organization Endpoints`,
            },
        });
    }

    /**
     * Delete an organization
     * @returns Organization Successful Response
     * @throws ApiError
     */
    public static apiV1DeleteOrganization({ organizationId }: { organizationId: string }): CancelablePromise<Organization> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: `/api/v1/organizations/${organizationId}`,
            errors: {
                404: `Organization Endpoints`,
            },
        });
    }
}

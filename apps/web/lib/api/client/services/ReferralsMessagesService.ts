/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_API_v1_upload_referral_document } from '../models/Body_API_v1_upload_referral_document';
import type { ReferralMessagesCreate } from '../models/ReferralMessagesCreate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReferralsMessagesService {
    /**
     * Get Messages By Referral Id
     * Get all messages by referral ID
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1GetMessagesByReferralId({
        referralId,
    }: {
        referralId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals-messages/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Message
     * Create a new message for a referral
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1CreateMessage({
        requestBody,
    }: {
        requestBody: ReferralMessagesCreate,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals-messages/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload Referral Document
     * Upload a document for a referral messages
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1UploadReferralDocument({
        messageId,
        type,
        formData,
    }: {
        messageId: string,
        type: string,
        formData?: Body_API_v1_upload_referral_document,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals-messages/upload/{message_id}/{type}',
            path: {
                'message_id': messageId,
                'type': type,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Referral Files
     * Get a file for a referral messages
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1GetReferralFiles({
        messageId,
        type,
    }: {
        messageId: string,
        type: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals-messages/file/{message_id}/{type}',
            path: {
                'message_id': messageId,
                'type': type,
            },
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }
}

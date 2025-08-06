import type { ReferralMessagesCreate } from '../models/ReferralMessagesCreate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

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

export interface AddMessageRequest {
    message: string;
    sender: string;
    sender_id: string;
    user_info?: any;
}

export interface AddMessageWithContextRequest {
    message: string;
    sender_id: string;
    user_name: string;
    user_role: string;
    additional_context?: any;
}

export interface AddSystemMessageRequest {
    message: string;
    system_action: string;
}

export interface UpdateMessageRequest {
    updated_message: string;
    sender_id: string;
}

export interface MessageHistoryResponse {
    messages: any[];
    total_count: number;
    has_more: boolean;
}

export class ReferralMessagesService {
    /**
     * Get Messages By Referral Id
     * Get messages by referral ID with pagination, returning latest messages first
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1GetMessagesByReferralId({
        referralId,
        limit,
        offset,
    }: {
        referralId: string,
        limit?: number,
        offset?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals-messages/{referral_id}',
            path: {
                'referral_id': referralId,
            },
            query: {
                limit,
                offset,
            },
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Message History
     * Get paginated message history for a referral
     * @returns MessageHistoryResponse Successful Response
     * @throws ApiError
     */
    public static apiV1GetMessageHistory({
        referralId,
        limit,
        offset,
    }: {
        referralId: string,
        limit?: number,
        offset?: number,
    }): CancelablePromise<MessageHistoryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals-messages/{referral_id}/history',
            path: {
                'referral_id': referralId,
            },
            query: {
                limit,
                offset,
            },
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Message
     * Create a new message for a referral using basic CRUD
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
     * Add Message to Referral
     * Add a message to a specific referral with validation
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1AddMessageToReferral({
        referralId,
        requestBody,
    }: {
        referralId: string,
        requestBody: AddMessageRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals-messages/{referral_id}/add',
            path: {
                'referral_id': referralId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Message with User Context
     * Add a message to a referral with comprehensive user context
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1AddMessageWithContext({
        referralId,
        requestBody,
    }: {
        referralId: string,
        requestBody: AddMessageWithContextRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals-messages/{referral_id}/add-with-context',
            path: {
                'referral_id': referralId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add System Message
     * Add a system-generated message to a referral
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1AddSystemMessage({
        referralId,
        requestBody,
    }: {
        referralId: string,
        requestBody: AddSystemMessageRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals-messages/{referral_id}/system-message',
            path: {
                'referral_id': referralId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Message
     * Update an existing message
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1UpdateMessage({
        messageId,
        requestBody,
    }: {
        messageId: string,
        requestBody: UpdateMessageRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/referrals-messages/{message_id}/update',
            path: {
                'message_id': messageId,
            },
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
        files,
        documentCategory,
    }: {
        messageId: string,
        type: string,
        files: File[],
        documentCategory?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals-messages/upload/{message_id}/{type}',
            path: {
                'message_id': messageId,
                'type': type,
            },
            formData: {
                files: files,
                document_category: documentCategory,
            },
            mediaType: 'multipart/form-data',
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Upload Message Attachments
     * Upload attachments for a specific message
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1UploadMessageAttachments({
        messageId,
        files,
        documentCategory,
    }: {
        messageId: string,
        files: File[],
        documentCategory?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/referrals-messages/attachments/{message_id}',
            path: {
                'message_id': messageId,
            },
            formData: {
                files: files,
                document_category: documentCategory,
            },
            mediaType: 'multipart/form-data',
            errors: {
                404: `Referral Messages Endpoints`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Message Attachments
     * Get attachments for a specific message
     * @returns any Successful Response
     * @throws ApiError
     */
    public static apiV1GetMessageAttachments({
        messageId,
    }: {
        messageId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/referrals-messages/attachments/{message_id}',
            path: {
                'message_id': messageId,
            },
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

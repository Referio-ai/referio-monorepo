import { Notification, NotificationCreate, NotificationUpdate, NotificationPagination, NotificationStats, NotificationMarkSeen } from "../models/Notification";
import { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class NotificationService {
    public static apiV1GetNotifications({
        page,
        pageSize,
        search,
    }: {
        page: number,
        pageSize: number,
        search: string,
    }): CancelablePromise<NotificationPagination> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications',
            query: {
                page,
                page_size: pageSize,
                search,
            },
        });
    }

    public static apiV1GetNotificationById({
        notificationId,
    }: {
        notificationId: string,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/{notification_id}',
            path: {
                'notification_id': notificationId,
            },
        });
    }

    public static apiV1GetNotificationsByFacility({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<Notification[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/facility/{user_id}',
            path: {
                'user_id': userId,
            },
        });
    }

    public static apiV1GetNotificationsByUser({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<Notification[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/user/{user_id}',
            path: {
                'user_id': userId,
            },
        });
    }

    public static apiV1GetUnreadNotificationsByUser({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<Notification[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/user/{user_id}/unread',
            path: {
                'user_id': userId,
            },
        });
    }

    public static apiV1GetUnreadNotificationsCount({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<{ unread_count: number }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/user/{user_id}/unread/count',
            path: {
                'user_id': userId,
            },
        });
    }

    public static apiV1GetNotificationStatsByUser({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<NotificationStats> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/user/{user_id}/stats',
            path: {
                'user_id': userId,
            },
        });
    }

    public static apiV1CreateNotification({
        requestBody,
    }: {
        requestBody: NotificationCreate,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications',
            body: requestBody,
        });
    }

    public static apiV1UpdateNotification({
        notificationId,
        requestBody,
    }: {
        notificationId: string,
        requestBody: NotificationUpdate,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/notifications/{notification_id}',
            path: {
                'notification_id': notificationId,
            },
            body: requestBody,
        });
    }

    public static apiV1MarkNotificationAsSeen({
        notificationId,
        requestBody,
    }: {
        notificationId: string,
        requestBody: NotificationMarkSeen,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/{notification_id}/mark-seen',
            path: {
                'notification_id': notificationId,
            },
            body: requestBody,
        });
    }

    public static apiV1MarkAllNotificationsAsSeen({
        userId,
        facilityId,
    }: {
        userId: string,
        facilityId?: string,
    }): CancelablePromise<{ message: string }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/user/{user_id}/mark-all-seen',
            path: {
                'user_id': userId,
            },
            query: {
                facility_id: facilityId,
            },
        });
    }

    public static apiV1DeleteNotification({
        notificationId,
    }: {
        notificationId: string,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/notifications/{notification_id}',
            path: {
                'notification_id': notificationId,
            },
        });
    }

    // Convenience methods for creating specific types of notifications

    public static apiV1CreateReferralNotification({
        referralId,
        facilityId,
        notificationType,
        title,
        message,
        createdById,
        createdByName,
        haveLink,
    }: {
        referralId: string,
        facilityId: string,
        notificationType: string,
        title: string,
        message: string,
        createdById?: string,
        createdByName?: string,
        haveLink?: string,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/referral',
            query: {
                referral_id: referralId,
                facility_id: facilityId,
                notification_type: notificationType,
                title,
                message,
                created_by_id: createdById,
                created_by_name: createdByName,
                have_link: haveLink,
            },
        });
    }

    public static apiV1CreateBatchNotification({
        batchId,
        facilityId,
        notificationType,
        title,
        message,
        createdById,
        createdByName,
        haveLink,
    }: {
        batchId: string,
        facilityId: string,
        notificationType: string,
        title: string,
        message: string,
        createdById?: string,
        createdByName?: string,
        haveLink?: string,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/batch',
            query: {
                batch_id: batchId,
                facility_id: facilityId,
                notification_type: notificationType,
                title,
                message,
                created_by_id: createdById,
                created_by_name: createdByName,
                have_link: haveLink,
            },
        });
    }

    public static apiV1CreateFacilitatorNotification({
        facilitatorId,
        facilityId,
        notificationType,
        title,
        message,
        createdById,
        createdByName,
        haveLink,
    }: {
        facilitatorId: string,
        facilityId: string,
        notificationType: string,
        title: string,
        message: string,
        createdById?: string,
        createdByName?: string,
        haveLink?: string,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/facilitator',
            query: {
                facilitator_id: facilitatorId,
                facility_id: facilityId,
                notification_type: notificationType,
                title,
                message,
                created_by_id: createdById,
                created_by_name: createdByName,
                have_link: haveLink,
            },
        });
    }

    public static apiV1CreateSystemNotification({
        notificationType,
        title,
        message,
        value,
        createdById,
        createdByName,
        haveLink,
    }: {
        notificationType: string,
        title: string,
        message: string,
        value: string,
        createdById?: string,
        createdByName?: string,
        haveLink?: string,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/system',
            query: {
                notification_type: notificationType,
                title,
                message,
                value,
                created_by_id: createdById,
                created_by_name: createdByName,
                have_link: haveLink,
            },
        });
    }
} 
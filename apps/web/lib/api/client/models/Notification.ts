export interface Notification {
    notification_id: string;
    type: string;
    value: string;
    message: string;
    title: string;
    have_link?: string;
    created_at: string;
    users_seen: string[];
    facility_id?: string;
    created_by_id?: string;
    created_by_name?: string;
    is_active: boolean;
}

export interface NotificationCreate {
    type: string;
    value: string;
    message: string;
    title: string;
    have_link?: string;
    facility_id?: string;
    created_by_id?: string;
    created_by_name?: string;
    is_active?: boolean;
}

export interface NotificationUpdate {
    notification_id: string;
    message?: string;
    title?: string;
    have_link?: string;
    is_active?: boolean;
    users_seen?: string[];
}

export interface NotificationMarkSeen {
    notification_id: string;
    user_id: string;
}

export interface NotificationPagination {
    items: Notification[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface NotificationStats {
    total_notifications: number;
    unread_notifications: number;
    notifications_by_type: Record<string, number>;
} 
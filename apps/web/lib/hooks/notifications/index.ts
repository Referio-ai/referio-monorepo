import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../../api/client/custom-services';
import { Notification, NotificationCreate, NotificationUpdate, NotificationStats } from '../../api/client/models/Notification';

// Hook to get notifications with pagination
export const useNotifications = (page: number = 1, pageSize: number = 10, search: string = '') => {
  return useQuery({
    queryKey: ['notifications', page, pageSize, search],
    queryFn: () => NotificationService.apiV1GetNotifications({ page, pageSize, search }),
  });
};

// Hook to get a specific notification by ID
export const useNotification = (notificationId: string) => {
  return useQuery({
    queryKey: ['notification', notificationId],
    queryFn: () => NotificationService.apiV1GetNotificationById({ notificationId }),
    enabled: !!notificationId,
  });
};

// Hook to get notifications by facility
export const useNotificationsByFacility = (userId: string) => {
  return useQuery({
    queryKey: ['notifications', 'facility', userId],
    queryFn: () => NotificationService.apiV1GetNotificationsByFacility({ userId }),
    enabled: !!userId,
  });
};

// Hook to get notifications by user
export const useNotificationsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['notifications', 'user', userId],
    queryFn: () => NotificationService.apiV1GetNotificationsByUser({ userId }),
    enabled: !!userId,
  });
};

// Hook to get unread notifications by user
export const useUnreadNotificationsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: () => NotificationService.apiV1GetUnreadNotificationsByUser({ userId }),
    enabled: !!userId,
  });
};

// Hook to get unread notifications count by user
export const useUnreadNotificationsCount = (userId: string) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: () => NotificationService.apiV1GetUnreadNotificationsCount({ userId }),
    enabled: !!userId,
  });
};

// Hook to get notification stats by user
export const useNotificationStatsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['notifications', 'stats', userId],
    queryFn: () => NotificationService.apiV1GetNotificationStatsByUser({ userId }),
    enabled: !!userId,
  });
};

// Hook to create a notification
export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notification: NotificationCreate) => 
      NotificationService.apiV1CreateNotification({ requestBody: notification }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Hook to update a notification
export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ notificationId, notification }: { notificationId: string; notification: NotificationUpdate }) =>
      NotificationService.apiV1UpdateNotification({ notificationId, requestBody: notification }),
    onSuccess: (_, { notificationId }) => {
      queryClient.invalidateQueries({ queryKey: ['notification', notificationId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Hook to mark a notification as seen
export const useMarkNotificationAsSeen = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ notificationId, userId }: { notificationId: string; userId: string }) =>
      NotificationService.apiV1MarkNotificationAsSeen({ 
        notificationId, 
        requestBody: { notification_id: notificationId, user_id: userId } 
      }),
    onSuccess: (_, { notificationId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['notification', notificationId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', userId] });
    },
  });
};

// Hook to mark all notifications as seen
export const useMarkAllNotificationsAsSeen = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, facilityId }: { userId: string; facilityId?: string }) =>
      NotificationService.apiV1MarkAllNotificationsAsSeen({ userId, facilityId }),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', userId] });
    },
  });
};

// Hook to delete a notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.apiV1DeleteNotification({ notificationId }),
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ['notification', notificationId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Convenience hooks for creating specific types of notifications

// Hook to create a referral notification
export const useCreateReferralNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      referralId,
      facilityId,
      notificationType,
      title,
      message,
      createdById,
      createdByName,
      haveLink,
    }: {
      referralId: string;
      facilityId: string;
      notificationType: string;
      title: string;
      message: string;
      createdById?: string;
      createdByName?: string;
      haveLink?: string;
    }) =>
      NotificationService.apiV1CreateReferralNotification({
        referralId,
        facilityId,
        notificationType,
        title,
        message,
        createdById,
        createdByName,
        haveLink,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Hook to create a batch notification
export const useCreateBatchNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      batchId,
      facilityId,
      notificationType,
      title,
      message,
      createdById,
      createdByName,
      haveLink,
    }: {
      batchId: string;
      facilityId: string;
      notificationType: string;
      title: string;
      message: string;
      createdById?: string;
      createdByName?: string;
      haveLink?: string;
    }) =>
      NotificationService.apiV1CreateBatchNotification({
        batchId,
        facilityId,
        notificationType,
        title,
        message,
        createdById,
        createdByName,
        haveLink,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Hook to create a facilitator notification
export const useCreateFacilitatorNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      facilitatorId,
      facilityId,
      notificationType,
      title,
      message,
      createdById,
      createdByName,
      haveLink,
    }: {
      facilitatorId: string;
      facilityId: string;
      notificationType: string;
      title: string;
      message: string;
      createdById?: string;
      createdByName?: string;
      haveLink?: string;
    }) =>
      NotificationService.apiV1CreateFacilitatorNotification({
        facilitatorId,
        facilityId,
        notificationType,
        title,
        message,
        createdById,
        createdByName,
        haveLink,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Hook to create a system notification
export const useCreateSystemNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      notificationType,
      title,
      message,
      value,
      createdById,
      createdByName,
      haveLink,
    }: {
      notificationType: string;
      title: string;
      message: string;
      value: string;
      createdById?: string;
      createdByName?: string;
      haveLink?: string;
    }) =>
      NotificationService.apiV1CreateSystemNotification({
        notificationType,
        title,
        message,
        value,
        createdById,
        createdByName,
        haveLink,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}; 
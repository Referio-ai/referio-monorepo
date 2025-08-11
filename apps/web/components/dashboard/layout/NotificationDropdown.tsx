'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUnreadNotificationsByUser, useMarkNotificationAsSeen, useMarkAllNotificationsAsSeen, useNotificationsByFacility, useUnreadNotificationsCount } from '@/lib/hooks/notifications';
import { Notification } from '@/lib/api/client/models/Notification';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

interface NotificationDropdownProps {
  userId: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [optimisticUnreadCount, setOptimisticUnreadCount] = useState<number | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: notifications, isLoading, refetch } = useNotificationsByFacility(userId);
  const { data: unreadCountData, refetch: refetchUnreadCount } = useUnreadNotificationsCount(userId);

  const markAsSeen = useMarkNotificationAsSeen();
  const markAllAsSeen = useMarkAllNotificationsAsSeen();

  // Use optimistic count if available, otherwise use server count
  const unreadCount = optimisticUnreadCount !== null ? optimisticUnreadCount : (unreadCountData?.unread_count || 0);

  // Helper function to check if a notification is unread for the current user
  const isNotificationUnread = (notification: Notification) => {
    return !notification.users_seen?.includes(userId);
  };

  // Update optimistic count when server data changes
  useEffect(() => {
    if (unreadCountData?.unread_count !== undefined) {
      setOptimisticUnreadCount(unreadCountData.unread_count);
    }
  }, [unreadCountData?.unread_count]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Optimistically update the count if this notification was unread
      if (isNotificationUnread(notification)) {
        setOptimisticUnreadCount(prev => Math.max(0, (prev || unreadCount) - 1));
        
        // Optimistically update the notification in the cache
        queryClient.setQueryData(['notifications', 'facility', userId], (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(n => {
            if (n.notification_id === notification.notification_id) {
              return {
                ...n,
                users_seen: [...(n.users_seen || []), userId]
              };
            }
            return n;
          });
        });
      }

      // Mark as seen
      await markAsSeen.mutateAsync({
        notificationId: notification.notification_id,
        userId: userId
      });

      // Navigate to the link if provided
      if (notification.have_link) {
        router.push(notification.have_link);
      }

      // Close dropdown
      setIsOpen(false);

      // Refetch to ensure data consistency
      refetch();
      refetchUnreadCount();
    } catch (error) {
      // Revert optimistic update on error
      if (isNotificationUnread(notification)) {
        setOptimisticUnreadCount(prev => (prev || unreadCount) + 1);
        
        // Revert the optimistic update in the cache
        queryClient.setQueryData(['notifications', 'facility', userId], (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(n => {
            if (n.notification_id === notification.notification_id) {
              return {
                ...n,
                users_seen: (n.users_seen || []).filter(id => id !== userId)
              };
            }
            return n;
          });
        });
      }
      console.error('Error marking notification as seen:', error);
    }
  };

  const handleMarkAllAsSeen = async () => {
    try {
      // Optimistically set count to 0
      setOptimisticUnreadCount(0);
      
      // Optimistically update all notifications in the cache
      queryClient.setQueryData(['notifications', 'facility', userId], (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(n => ({
          ...n,
          users_seen: [...(n.users_seen || []), userId]
        }));
      });

      await markAllAsSeen.mutateAsync({ userId });
      refetch();
      refetchUnreadCount();
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticUnreadCount(unreadCountData?.unread_count || 0);
      console.error('Error marking all notifications as seen:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'referral_created':
      case 'referral_updated':
      case 'referral_status_changed':
        return '📋';
      case 'batch_created':
      case 'batch_updated':
        return '📦';
      case 'facilitator_added':
      case 'facilitator_removed':
        return '👤';
      case 'patient_added':
      case 'patient_updated':
        return '🏥';
      case 'facility':
      case 'facility_updated':
        return '🏢';
      case 'system_alert':
        return '⚠️';
      case 'appointment_scheduled':
      case 'appointment_cancelled':
        return '📅';
      case 'report_sent':
        return '📄';
      case 'reward_earned':
        return '🎁';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsSeen}
              className="h-6 px-2 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-64">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => {
              const isUnread = isNotificationUnread(notification);
              return (
                <DropdownMenuItem
                  key={notification.notification_id}
                  className={`flex flex-col items-start p-3 cursor-pointer hover:bg-accent ${
                    isUnread ? 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start w-full gap-3">
                    <span className="text-lg mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium leading-tight ${
                          isUnread ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-xs mt-1 line-clamp-2 ${
                        isUnread ? 'text-gray-700 dark:text-gray-300' : 'text-muted-foreground'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.have_link && (
                        <div className="flex items-center gap-1 mt-1">
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Click to view</span>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
        </ScrollArea>
        {notifications && notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center cursor-pointer"
              onClick={() => router.push('/notifications')}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
'use client';

import React, { useState } from 'react';
import { useUser } from "@propelauth/nextjs/client";
import { useNotificationsByUser, useMarkNotificationAsSeen, useMarkAllNotificationsAsSeen, useDeleteNotification } from '@/lib/hooks/notifications';
import { Notification } from '@/lib/api/client/models/Notification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Check, 
  Trash2, 
  ExternalLink, 
  Filter,
  Search,
  Calendar,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: notifications, isLoading, refetch } = useNotificationsByUser(user?.userId || '');
  const markAsSeen = useMarkNotificationAsSeen();
  const markAllAsSeen = useMarkAllNotificationsAsSeen();
  const deleteNotification = useDeleteNotification();

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'referral_created', label: 'Referral Created' },
    { value: 'referral_updated', label: 'Referral Updated' },
    { value: 'referral_status_changed', label: 'Status Changed' },
    { value: 'batch_created', label: 'Batch Created' },
    { value: 'batch_updated', label: 'Batch Updated' },
    { value: 'facilitator_added', label: 'User Added' },
    { value: 'facilitator_removed', label: 'User Removed' },
    { value: 'patient_added', label: 'Patient Added' },
    { value: 'patient_updated', label: 'Patient Updated' },
    { value: 'facility', label: 'Facility' },
    { value: 'facility_updated', label: 'Facility Updated' },
    { value: 'system_alert', label: 'System Alert' },
    { value: 'appointment_scheduled', label: 'Appointment Scheduled' },
    { value: 'appointment_cancelled', label: 'Appointment Cancelled' },
    { value: 'report_sent', label: 'Report Sent' },
    { value: 'reward_earned', label: 'Reward Earned' },
  ];

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

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'referral_created':
      case 'referral_updated':
      case 'referral_status_changed':
        return 'bg-blue-100 text-blue-800';
      case 'batch_created':
      case 'batch_updated':
        return 'bg-green-100 text-green-800';
      case 'facilitator_added':
      case 'facilitator_removed':
        return 'bg-purple-100 text-purple-800';
      case 'patient_added':
      case 'patient_updated':
        return 'bg-orange-100 text-orange-800';
      case 'facility':
      case 'facility_updated':
        return 'bg-teal-100 text-teal-800';
      case 'system_alert':
        return 'bg-red-100 text-red-800';
      case 'appointment_scheduled':
      case 'appointment_cancelled':
        return 'bg-indigo-100 text-indigo-800';
      case 'report_sent':
        return 'bg-gray-100 text-gray-800';
      case 'reward_earned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications?.filter((notification) => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'unread' && !notification.users_seen.includes(user?.userId || '')) ||
      (filter === 'read' && notification.users_seen.includes(user?.userId || ''));
    
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    
    return matchesFilter && matchesSearch && matchesType;
  }) || [];

  const handleMarkAsSeen = async (notification: Notification) => {
    try {
      await markAsSeen.mutateAsync({
        notificationId: notification.notification_id,
        userId: user?.userId || ''
      });
      refetch();
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  };

  const handleMarkAllAsSeen = async () => {
    try {
      await markAllAsSeen.mutateAsync({ userId: user?.userId || '' });
      refetch();
    } catch (error) {
      console.error('Error marking all notifications as seen:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification.mutateAsync(notificationId);
      refetch();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.have_link) {
      router.push(notification.have_link);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Please log in to view notifications</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              Stay updated with all your facility activities
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleMarkAllAsSeen}
              disabled={isLoading}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isLoading ? 'Loading...' : `${filteredNotifications.length} notification${filteredNotifications.length !== 1 ? 's' : ''}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-600">
                    {filter === 'unread' 
                      ? 'You have no unread notifications'
                      : 'No notifications match your current filters'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => {
                    const isUnread = !notification.users_seen.includes(user?.userId || '');
                    
                    return (
                      <div
                        key={notification.notification_id}
                        className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                          isUnread ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <span className="text-2xl">
                              {getNotificationIcon(notification.type)}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {notification.title}
                                  </h3>
                                  <Badge className={getNotificationColor(notification.type)}>
                                    {notification.type.replace('_', ' ')}
                                  </Badge>
                                  {isUnread && (
                                    <Badge variant="destructive">Unread</Badge>
                                  )}
                                </div>
                                
                                <p className="text-gray-600 mb-3">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatTimeAgo(notification.created_at)}
                                  </div>
                                  
                                  {notification.created_by_name && (
                                    <div className="flex items-center gap-1">
                                      <span>by {notification.created_by_name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {notification.have_link && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNotificationClick(notification)}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                {isUnread && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsSeen(notification)}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotification(notification.notification_id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
'use client';
import React from 'react';
import Link from 'next/link';
import { Inbox, Send, ArrowRight, Users, FileText, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FacilitatorDashboardPage() {
  // Mock data for dashboard stats
  const stats = {
    pendingReviews: 12,
    approvedToday: 8,
    totalSent: 156,
    activeReferrals: 23
  };

  const quickActions = [
    {
      title: 'Inbox',
      description: 'Review and approve incoming referrals',
      icon: Inbox,
      href: '/dashboard-facilitator/inbox',
      color: 'bg-blue-500',
      count: stats.pendingReviews
    },
    {
      title: 'Outbox',
      description: 'Manage outgoing referrals and drafts',
      icon: Send,
      href: '/dashboard-facilitator/outbox',
      color: 'bg-green-500',
      count: stats.totalSent
    },
    {
      title: 'Active Referrals',
      description: 'View all active referral cases',
      icon: Users,
      href: '/dashboard-facilitator/active',
      color: 'bg-purple-500',
      count: stats.activeReferrals
    },
    {
      title: 'Reports',
      description: 'Generate and view referral reports',
      icon: FileText,
      href: '/dashboard-facilitator/reports',
      color: 'bg-orange-500',
      count: null
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Approved referral',
      patient: 'John Smith',
      time: '2 minutes ago',
      status: 'approved'
    },
    {
      id: 2,
      action: 'Sent referral',
      patient: 'Sarah Johnson',
      time: '15 minutes ago',
      status: 'sent'
    },
    {
      id: 3,
      action: 'Rejected referral',
      patient: 'Mike Davis',
      time: '1 hour ago',
      status: 'rejected'
    },
    {
      id: 4,
      action: 'Created draft',
      patient: 'Emily Wilson',
      time: '2 hours ago',
      status: 'draft'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-700',
      sent: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700',
      draft: 'bg-gray-100 text-gray-700'
    };
    
    const labels = {
      approved: 'Approved',
      sent: 'Sent',
      rejected: 'Rejected',
      draft: 'Draft'
    };

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facilitator Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and process referral requests</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle className="w-4 h-4 mr-1" />
            Online
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedToday}</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReferrals}</div>
            <p className="text-xs text-muted-foreground">
              +3 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  {action.count !== null && (
                    <Badge variant="secondary" className="bg-gray-100">
                      {action.count}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-2">{action.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600 mb-4">
                  {action.description}
                </CardDescription>
                <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span className="text-sm font-medium">View</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStatusBadge(activity.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.patient}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Inbox className="h-4 w-4 mr-2" />
                Review Pending Referrals
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send New Referral
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                View All Referrals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

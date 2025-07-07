'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BatchStats } from '../referral-management/components/BatchStats';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { twColourConfig } from "@/lib/twConfig";
import { SAMPLE_REFERRALS } from '@/constants/referral';
import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_STYLES, STATUS_LABELS } from '@/constants/referral';
import { Package, QrCode, Building, Calendar, TrendingUp, Users, Activity } from 'lucide-react';

// Dummy data for charts
const referralTrendData = [
  { date: '2024-01', referrals: 65, completed: 45 },
  { date: '2024-02', referrals: 75, completed: 55 },
  { date: '2024-03', referrals: 85, completed: 65 },
  { date: '2024-04', referrals: 95, completed: 75 },
  { date: '2024-05', referrals: 105, completed: 85 },
];

const facilityPerformanceData = [
  { name: 'Sunshine Dental', referrals: 45, completion: 85 },
  { name: 'City Center Dental', referrals: 35, completion: 75 },
  { name: 'Parkview Family', referrals: 25, completion: 65 },
  { name: 'Lakeview Dental', referrals: 30, completion: 70 },
];

const statusDistributionData = [
  { name: 'New', value: 30 },
  { name: 'In Progress', value: 25 },
  { name: 'Scheduled', value: 20 },
  { name: 'Completed', value: 25 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Dashboard = () => {
  // Calculate metrics from sample data
  const totalReferrals = SAMPLE_REFERRALS.length;
  const totalBatches = 12; // Dummy data
  const activeFacilities = 8; // Dummy data
  const todaysBatches = 3; // Dummy data

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics */}
      <BatchStats
        totalBatches={totalBatches}
        totalReferrals={totalReferrals}
        activeFacilities={activeFacilities}
        todaysBatches={todaysBatches}
      />

      {/* Charts Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Referral Trends - Full Width */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Referral Trends
            </CardTitle>
            <CardDescription>Monthly referral and completion trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={referralTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="referrals" 
                    stroke={twColourConfig.primary.DEFAULT}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke={twColourConfig.secondary.DEFAULT}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution - Half Width */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status Distribution
            </CardTitle>
            <CardDescription>Current referral status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Facility Performance - Half Width */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Facility Performance
            </CardTitle>
            <CardDescription>Referral volume and completion rates by facility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facilityPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="referrals" 
                    fill={twColourConfig.primary.DEFAULT}
                    name="Total Referrals"
                  />
                  <Bar 
                    dataKey="completion" 
                    fill={twColourConfig.secondary.DEFAULT}
                    name="Completion Rate (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Full Width */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest referrals and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Patient</th>
                    <th className="text-left py-3 px-4">Referred By</th>
                    <th className="text-left py-3 px-4">Practice</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_REFERRALS.slice(0, 5).map((referral) => (
                    <tr key={referral.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{referral.patientName}</td>
                      <td className="py-3 px-4">{referral.referredBy}</td>
                      <td className="py-3 px-4">{referral.practice}</td>
                      <td className="py-3 px-4">
                        <Badge className={STATUS_BADGE_STYLES[referral.status]}>
                          {STATUS_LABELS[referral.status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{referral.dateReceived}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

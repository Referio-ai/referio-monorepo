import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Clock, Calendar, Image } from 'lucide-react';
import { Referral, ReferralStatus } from '@/constants/referral';
import { ReferralListSkeleton } from '../skeletons/ReferralSkeletons';

interface ReferralListProps {
  referrals: Referral[];
  selectedReferralId?: number;
  activeTab: ReferralStatus | 'all';
  filterDoctor: string;
  referringDoctors: string[];
  onReferralSelect: (referral: Referral) => void;
  onTabChange: (tab: ReferralStatus | 'all') => void;
  onDoctorFilterChange: (doctor: string) => void;
  onNewReferralClick: () => void;
  getStatusBadge: (status: ReferralStatus) => React.ReactNode;
  isLoading?: boolean;
}

export const ReferralList: React.FC<ReferralListProps> = ({
  referrals,
  selectedReferralId,
  activeTab,
  filterDoctor,
  referringDoctors,
  onReferralSelect,
  onTabChange,
  onDoctorFilterChange,
  onNewReferralClick,
  getStatusBadge,
  isLoading = false
}) => {
  if (isLoading) {
    return <ReferralListSkeleton />;
  }

  return (
    <div className="w-96 border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Referrals</h2>
          <Button 
            onClick={onNewReferralClick} 
            className="bg-blue-200 hover:bg-blue-300 text-blue-700"
          >
            New Referral
          </Button>
        </div>
        
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger 
              value="all" 
              onClick={() => onTabChange('all')} 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="new" 
              onClick={() => onTabChange('new')} 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              New
            </TabsTrigger>
            <TabsTrigger 
              value="in-progress" 
              onClick={() => onTabChange('in-progress')} 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              In Prog
            </TabsTrigger>
            <TabsTrigger 
              value="scheduled" 
              onClick={() => onTabChange('scheduled')} 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              Sched
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              onClick={() => onTabChange('completed')} 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              Done
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">{referrals.length} referrals</p>
          <div className="flex gap-2">
            <div className="relative">
              <select 
                className="pl-8 pr-4 py-1 border rounded-md text-sm appearance-none bg-white" 
                value={filterDoctor}
                onChange={(e) => onDoctorFilterChange(e.target.value)}
              >
                <option value="all">All Doctors</option>
                {referringDoctors.filter(doc => doc !== 'all').map(doctor => (
                  <option key={doctor} value={doctor}>{doctor}</option>
                ))}
              </select>
              <Filter className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {referrals.map(referral => (
          <button
            key={referral.id}
            className={`w-full text-left p-4 border-b hover:bg-blue-50 ${
              selectedReferralId === referral.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onReferralSelect(referral)}
          >
            <div className="flex justify-between">
              <h3 className="font-medium">{referral.patientName}</h3>
              {getStatusBadge(referral.status)}
            </div>
            <p className="text-sm text-gray-500 mt-1">{referral.reason}</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{referral.dateReceived}</span>
              {referral.status === 'scheduled' && (
                <>
                  <span className="mx-1">•</span>
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{referral.appointmentDate}</span>
                </>
              )}
            </div>
            <div className="flex mt-2">
              {referral.hasXrays && (
                <Badge variant="outline" className="flex items-center">
                  <Image className="h-3 w-3 mr-1" />
                  X-rays
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReferralList; 
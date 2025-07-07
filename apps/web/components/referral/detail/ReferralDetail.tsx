import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Edit
} from 'lucide-react';
import { Referral, STATUS_LABELS } from '@/constants/referral';
import { ReferralDetailSkeleton } from '../skeletons/ReferralSkeletons';
import { PatientInfoTab } from './PatientInfoTab';
import { CommunicationTab } from './CommunicationTab';
import { ReportsTab } from './ReportsTab';

interface ReferralDetailProps {
  referral: Referral;
  onScheduleAppointment?: () => void;
  onAcceptReferral?: () => void;
  onVerifyBenefits?: () => void;
  onSendMessage?: (message: string) => void;
  onUploadFiles?: (files: File[]) => void;
  onUpdateStatus?: () => void;
  isLoading?: boolean;
}

export const ReferralDetail: React.FC<ReferralDetailProps> = ({
  referral,
  onScheduleAppointment,
  onAcceptReferral,
  onVerifyBenefits,
  onSendMessage,
  onUploadFiles,
  onUpdateStatus,
  isLoading = false
}) => {
  const [activeDetailTab, setActiveDetailTab] = useState('info');

  if (isLoading) {
    return <ReferralDetailSkeleton />;
  }

  if (!referral) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{referral.patientName}</h1>
            <div className="flex items-center text-gray-600 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{referral.dateOfBirth}</span>
            </div>
            <p className="text-blue-600 mt-2">
              Referred by{' '}
              <span className="text-blue-700 font-medium">{referral.practice}</span>
              {' '}| {referral.referredBy} • {referral.dateReceived}
            </p>
          </div>
          <Button 
            onClick={onUpdateStatus}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Edit className="mr-2 h-4 w-4" />
            Update Status
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Current Status:</span>
            <Badge className="bg-gray-900 text-white">
              {STATUS_LABELS[referral.status]}
            </Badge>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium">Last Update:</span> Initial referral received from Dr. Chen • {formatDateTime(referral.dateReceived)}
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="flex-1 flex flex-col">
        <TabsList className="mb-6 bg-gray-50">
          <TabsTrigger 
            value="info" 
            onClick={() => setActiveDetailTab('info')} 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            Patient Info
          </TabsTrigger>
          <TabsTrigger 
            value="communication" 
            onClick={() => setActiveDetailTab('communication')} 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm relative"
          >
            Communication
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            onClick={() => setActiveDetailTab('reports')} 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="flex-1">
          <PatientInfoTab referral={referral} onUploadFiles={onUploadFiles} />
        </TabsContent>

        <TabsContent value="communication" className="flex-1">
          <CommunicationTab 
            referral={referral} 
            onSendMessage={onSendMessage} 
            onUploadFiles={onUploadFiles} 
          />
        </TabsContent>

        <TabsContent value="reports" className="flex-1">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralDetail; 
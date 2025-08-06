import React, { useState, useEffect } from 'react';
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
import { UpdateStatusModal } from './UpdateStatusModal';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

interface ReferralDetailProps {
  referral: Referral;
  onScheduleAppointment?: () => void;
  onAcceptReferral?: () => void;
  onVerifyBenefits?: () => void;
  onSendMessage?: (message: string) => void;
  onUploadFiles?: (files: File[]) => void;
  onUpdateStatus?: () => void;
  onStatusUpdate?: () => void; // Callback to refresh referral data after status update
  onReferralRefresh?: (referralId: string) => void; // Callback to refresh individual referral data
  onReferralDataUpdate?: (updatedReferral: Referral) => void; // Callback to update referral data directly
  isLoading?: boolean;
  // Add new props for refresh functionality
  activeTab?: string;
  searchQuery?: string;
  sortBy?: string;
}

export const ReferralDetail: React.FC<ReferralDetailProps> = ({
  referral,
  onScheduleAppointment,
  onAcceptReferral,
  onVerifyBenefits,
  onSendMessage,
  onUploadFiles,
  onUpdateStatus,
  onStatusUpdate,
  onReferralRefresh,
  onReferralDataUpdate,
  isLoading = false,
  activeTab,
  searchQuery,
  sortBy
}) => {
  const [activeDetailTab, setActiveDetailTab] = useState('info');
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [currentReferral, setCurrentReferral] = useState<Referral>(referral);

  // Update current referral when prop changes
  useEffect(() => {
    setCurrentReferral(referral);
  }, [referral]);

  // Reset active detail tab when referral changes
  useEffect(() => {
    setActiveDetailTab('info');
  }, [currentReferral?.referral_id]);

  // Handle referral data update from modal
  const handleReferralDataUpdate = (updatedReferral: Referral) => {
    setCurrentReferral(updatedReferral);
    if (onReferralDataUpdate) {
      onReferralDataUpdate(updatedReferral);
    }
  };

  console.log(currentReferral,'42323232----');

  if (isLoading) {
    return <ReferralDetailSkeleton />;
  }

  if (!currentReferral) return null;
  

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Show relative time for recent dates
      if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
      } else if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'h:mm a')}`;
      } else {
        // For older dates, show full date and time
        return format(date, 'MMM dd, yyyy \'at\' h:mm a');
      }
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  const formatTimeOnly = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'h:mm a');
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Details</h1>
          <p className="text-sm text-gray-600 mt-1">
            Referral ID: {currentReferral.referral_id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={currentReferral.status === 'active' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {STATUS_LABELS[currentReferral.status] || currentReferral.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUpdateStatusModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Update Status
          </Button>
        </div>
      </div>

      {/* Status and Action Buttons */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 justify-between flex-1">
            <div>
              <p className="text-sm font-medium text-gray-900">Status</p>
              <p className="text-sm text-gray-600">{STATUS_LABELS[currentReferral.status] || currentReferral.status}</p>
              {/* Show status type and notes for archived referrals */}
              {currentReferral.status === 'archive' && currentReferral.referral_status_type && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700">Reason for Archiving</p>
                  <p className="text-xs text-gray-600">{currentReferral.referral_status_type}</p>
                  {currentReferral.referral_status_notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">"{currentReferral.referral_status_notes}"</p>
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Received</p>
              <p className="text-sm text-gray-600">{formatDateTime(currentReferral.dateReceived)}</p>
            </div>
            {/* Show appointment information if referral has appointment details */}
            {(currentReferral.appointmentDate || currentReferral.appointmentType) && (
              <>
                {currentReferral.appointmentDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Appointment Date</p>
                    <p className="text-sm text-gray-600">{formatDate(currentReferral.appointmentDate)}</p>
                  </div>
                )}
                {currentReferral.appointmentType && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Appointment Type</p>
                    <p className="text-sm text-gray-600">{currentReferral.appointmentType}</p>
                  </div>
                )}
                {currentReferral.appointmentTime && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Appointment Time</p>
                    <p className="text-sm text-gray-600">{formatTimeOnly(currentReferral.appointmentTime)}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab} className="flex-1 flex flex-col">
        <TabsList className="mb-6 bg-gray-50">
          <TabsTrigger 
            value="info" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            Patient Info
          </TabsTrigger>
          <TabsTrigger 
            value="communication" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm relative"
          >
            Communication
            {/* <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div> */}
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="flex-1">
          <PatientInfoTab referral={currentReferral} onUploadFiles={onUploadFiles} />
        </TabsContent>

        <TabsContent value="communication" className="flex-1">
          <CommunicationTab 
            referral={currentReferral} 
            onSendMessage={onSendMessage} 
            onUploadFiles={onUploadFiles}
            isActive={activeDetailTab === 'communication'}
          />
        </TabsContent>

        <TabsContent value="reports" className="flex-1">
          <ReportsTab />
        </TabsContent>
      </Tabs>

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setIsUpdateStatusModalOpen(false)}
        referral={currentReferral}
        onStatusUpdate={onStatusUpdate}
        onReferralRefresh={onReferralRefresh}
        onReferralDataUpdate={handleReferralDataUpdate}
      />
    </div>
  );
};

export default ReferralDetail; 
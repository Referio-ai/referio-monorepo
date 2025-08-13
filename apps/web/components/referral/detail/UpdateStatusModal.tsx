import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, Clock, User, Calendar, Loader2 } from 'lucide-react';
import { Referral, STATUS_LABELS, ReferralStatus } from '@/constants/referral';
import { format } from 'date-fns';
import { useUpdateReferralStatus, useReferralStatusHistory } from '@/lib/hooks/referrals';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

interface StatusHistoryEntry {
  status_history_id: string;
  referral_id: string;
  status_type: string;
  database_status: string;
  notes?: string;
  updated_by_id?: string;
  updated_by_name?: string;
  appointment_date?: string;
  appointment_type?: string;
  created_at: string;
}

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  referral: Referral;
  onStatusUpdate?: () => void; // Callback to refresh parent component data
  onReferralRefresh?: (referralId: string) => void; // Callback to refresh individual referral data
  onReferralDataUpdate?: (updatedReferral: Referral) => void; // Callback to update referral data directly
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  referral,
  onStatusUpdate,
  onReferralRefresh,
  onReferralDataUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const { mutate: updateReferralStatus, isPending: isUpdatingStatus } = useUpdateReferralStatus();
  
  // Use the new hook for status history
  const { data: statusHistoryData, isLoading: isLoadingHistory, refetch: refetchStatusHistory, isRefetching: isRefreshingHistory } = useReferralStatusHistory(referral.referral_id);

  // Extract and sort status history from the hook data
  const statusHistory: StatusHistoryEntry[] = React.useMemo(() => {
    if (!statusHistoryData?.history) return [];
    
    return (statusHistoryData.history as StatusHistoryEntry[]).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [statusHistoryData]);

  const availableStatuses = [
    'Scheduled',
    'Declined Services',
    'Unable to Reach',
    'Report Sent',
    'Completed'
  ].filter(status => status !== statusHistory[0]?.status_type);

  const appointmentTypes = [
    'Consultation',
    'Treatment',
    'Follow-up',
    'Emergency',
    'Routine Check',
    'Specialist Review'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Declined Services':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Unable to Reach':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Report Sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleUpdateStatus = () => {
    if (selectedStatus) {
      const updateData: any = { 
        referralId: referral.referral_id, 
        status: selectedStatus, 
        notes: notes.trim() || '' 
      };

      // Only include appointment fields if status is "Scheduled"
      if (selectedStatus === 'Scheduled') {
        if (appointmentDate) {
          updateData.appointmentDate = appointmentDate;
        }
        if (appointmentType) {
          updateData.appointmentType = appointmentType;
        }
      }

      updateReferralStatus(updateData, {
        onSuccess: (response) => {
          // Refresh status history after successful update
          refetchStatusHistory();
          
          // Map the selected status to the correct ReferralStatus type
          let mappedStatus: ReferralStatus = 'new'; // default
          switch (selectedStatus) {
            case 'Scheduled':
              mappedStatus = 'active';
              break;
            case 'Declined Services':
            case 'Unable to Reach':
            case 'Report Sent':
            case 'Completed':
              mappedStatus = 'archive';
              break;
            default:
              mappedStatus = 'new';
          }
          
          // Create updated referral object with new status information
          const updatedReferral: Referral = {
            ...referral,
            status: mappedStatus,
            appointmentDate: selectedStatus === 'Scheduled' ? appointmentDate : undefined,
            appointmentType: selectedStatus === 'Scheduled' ? appointmentType : undefined,
          };
          
          // Call callback to update referral data directly
          if (onReferralDataUpdate) {
            onReferralDataUpdate(updatedReferral);
          }
          
          // Call parent callback to refresh referral data
          if (onStatusUpdate) {
            onStatusUpdate();
          }
          
          // Call callback to refresh individual referral data
          if (onReferralRefresh) {
            onReferralRefresh(referral.referral_id);
          }
          
          handleClose();
          toast.success('Referral status updated successfully');
        },
        onError: (error) => {
          console.error('Error updating referral status:', error);
          toast.error('Failed to update referral status');
        }
      });
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    setNotes('');
    setAppointmentDate('');
    setAppointmentType('');
    onClose();
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    // Clear appointment fields if status is not "Scheduled"
    if (status !== 'Scheduled') {
      setAppointmentDate('');
      setAppointmentType('');
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Update Referral Status</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Update the status for {referral.patientName}'s referral
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Status History Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                {isHistoryExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
                Status History Timeline ({statusHistory.length} updates)
              </button>
              
              {/* Refresh button with loading state */}
              <button
                onClick={() => refetchStatusHistory()}
                disabled={isRefreshingHistory}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefreshingHistory ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                {isRefreshingHistory ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {isHistoryExpanded && (
              <div className="space-y-3">
                {isLoadingHistory ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading status history...</p>
                  </div>
                ) : statusHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No status history available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {statusHistory.map((entry, index) => (
                      <div key={entry.status_history_id} className="relative">
                        {/* Timeline connector */}
                        {index < statusHistory.length - 1 && (
                          <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          {/* Timeline dot */}
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                            <Clock className="h-5 w-5 text-gray-600" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge className={`border ${getStatusColor(entry.status_type)}`}>
                                  {entry.status_type}
                                </Badge>
                                {entry.updated_by_name && (
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <User className="h-3 w-3" />
                                    <span>{entry.updated_by_name}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(entry.created_at), 'MMM dd, yyyy')}</span>
                                <span>•</span>
                                <span>{format(new Date(entry.created_at), 'h:mm a')}</span>
                              </div>
                            </div>
                            
                            {entry.notes && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                  {entry.notes}
                                </p>
                              </div>
                            )}
                            
                            {entry.appointment_date && entry.appointment_type && (
                              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">{entry.appointment_type}</span>
                                <span>on</span>
                                <span className="font-medium">{format(new Date(entry.appointment_date), 'MMM dd, yyyy')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Update Status Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Update Status</h3>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Fields - Only show when "Scheduled" is selected */}
          {selectedStatus === 'Scheduled' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">Appointment Details</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate" className="text-sm font-medium text-blue-700">
                    Appointment Date *
                  </Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="border-blue-300 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="appointmentType" className="text-sm font-medium text-blue-700">
                    Appointment Type *
                  </Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger className="border-blue-300 focus:border-blue-500">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this status update..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUpdatingStatus}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={!selectedStatus || (selectedStatus === 'Scheduled' && (!appointmentDate || !appointmentType)) || isUpdatingStatus}
            className="flex-1 sm:flex-none bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingStatus ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
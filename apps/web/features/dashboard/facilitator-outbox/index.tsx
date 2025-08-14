'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Send, Mail, Clock, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { 
  Referral, 
  ReferralStatus, 
  ReferralSortOption,
  ReferralSearchFilter,
  NewReferralFormData, 
  STATUS_BADGE_STYLES, 
  STATUS_LABELS 
} from '@/constants/referral';

// Import our components
import ReferralListComponent from '@/components/referral/list/ReferralList';
import ReferralDetail from '@/components/referral/detail/ReferralDetail';
import NewReferralForm from '@/components/referral/forms/NewReferralForm';

// Import the useFacilitatorOutboundReferrals hook
import { useFacilitatorOutboundReferrals } from '@/lib/hooks/referrals';
import { useFacilityStore } from '@/lib/stores/facilityStore';

// Define facilitator-specific status types for outbox
type FacilitatorOutboxStatus = 'new' | 'draft' | 'sent' | 'delivered' | 'failed' | 'all';

const FACILITATOR_OUTBOX_STATUS_BADGE_STYLES = {
  new: 'bg-blue-100 text-blue-700',
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
} as const;

const FACILITATOR_OUTBOX_STATUS_LABELS = {
  new: 'New',
  draft: 'Draft',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
} as const;

export const FacilitatorOutbox = () => {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [activeTab, setActiveTab] = useState<FacilitatorOutboxStatus>('new');
  const [searchFilter, setSearchFilter] = useState<ReferralSearchFilter>('patient');
  const [sortBy, setSortBy] = useState<ReferralSortOption>('date-newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewReferralOpen, setIsNewReferralOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Get the active facility ID from the facility store
  const { activeFacilityId } = useFacilityStore();
  
  // Helper function to map frontend sort options to backend sort options
  const mapFrontendSortToBackendSort = (frontendSort: ReferralSortOption): string | undefined => {
    switch (frontendSort) {
      case 'date-newest':
        return 'date_newest';
      case 'date-oldest':
        return 'date_oldest';
      default:
        return undefined;
    }
  };
  
  // Use the useFacilitatorOutboundReferrals hook to fetch real data
  const { 
    data: outboundReferralsData, 
    isLoading: isOutboundReferralsLoading, 
    error: outboundReferralsError,
    refetch: refetchOutboundReferrals 
  } = useFacilitatorOutboundReferrals({
    page,
    page_size: pageSize,
    search: searchQuery,
    status: activeTab === 'all' ? '' : activeTab,
    facilitator_facility_id: activeFacilityId || '',
    sort_by: mapFrontendSortToBackendSort(sortBy)
  });
  
  // Extract data from API response
  const outboundReferrals = outboundReferralsData?.items || [];
  const pagination = outboundReferralsData?.pagination || {
    total_count: 0,
    total_pages: 1,
    current_page: 1,
    page_size: 10,
    has_next: false,
    has_previous: false
  };
  
  // Transform API data to match the expected Referral interface
  const transformApiReferralToReferral = (apiReferral: any): Referral => {
    const patientName = apiReferral.patient_fname && apiReferral.patient_lname 
      ? `${apiReferral.patient_fname} ${apiReferral.patient_lname}`
      : apiReferral.patient_fname || apiReferral.patient_lname || 'Unknown Patient';
    
    const dateOfBirth = apiReferral.patient_dob 
      ? new Date(apiReferral.patient_dob).toLocaleDateString()
      : 'N/A';
    
    const phone = apiReferral.patient_contact_phone || 'N/A';
    
    // Map facilitator outbox status to referral status
    let status: ReferralStatus = apiReferral.referral_status; // Default to new
    
    // Determine priority (you may need to adjust this based on your business logic)
    const priority = 'normal'; // Default priority
    
    // Calculate age from date of birth
    const age = apiReferral.patient_dob 
      ? Math.floor((new Date().getTime() - new Date(apiReferral.patient_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;
    
    return {
      referral_id: apiReferral.referral_id,
      patientId: apiReferral.patient_id || undefined,
      patientName,
      age,
      dateOfBirth,
      phone,
      referredBy: apiReferral.referral_doctor_name || 'Unknown Doctor',
      practice: apiReferral.inbound_facility_name || 'Unknown Practice',
      dateReceived: apiReferral.referral_scanned_date || apiReferral.referral_outbound_date || new Date().toISOString(),
      status,
      priority,
      insurance: 'Unknown Insurance',
      memberId: apiReferral.patient_insurance_member_id || 'N/A',
      reason: apiReferral.referral_remark || 'No reason provided',
      hasXrays: false,
      hasInsurance: !!apiReferral.patient_insurance_member_id,
      documents: apiReferral.documents || [],
      appointmentDate: apiReferral.appointment_date || undefined,
      appointmentType: apiReferral.appointment_type || undefined,
      isUrgent: apiReferral.is_urgent || false,
      isOutbound: !!apiReferral.referral_outbound_date, // If referral_outbound_date exists, it's an outbound referral
      has_update: apiReferral.has_update || false,
      has_update_users: apiReferral.has_update_users || [],
      has_com_update: apiReferral.has_com_update || false,
      has_com_update_users: apiReferral.has_com_update_users || []
    };
  };
  
  // Transform all API referrals
  const referrals = outboundReferrals.map(transformApiReferralToReferral);
  
  // Update loading state based on API loading
  useEffect(() => {
    setIsLoading(isOutboundReferralsLoading);
  }, [isOutboundReferralsLoading]);
  
  // Handle search changes
  useEffect(() => {
    // Reset to first page when search changes
    setPage(1);
  }, [searchQuery]);
  
  // Clear selected referral when facility changes
  useEffect(() => {
    setSelectedReferral(null);
  }, [activeFacilityId]);

  console.log("referrals", referrals);
  
  // Filter, search, and sort referrals
  const processedReferrals = React.useMemo(() => {
    let result = referrals.filter(ref => {
      // Status filter
      const statusMatch = activeTab === 'all' || ref.status === activeTab;
      
      // Search filter
      let searchMatch = true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        switch (searchFilter) {
          case 'patient':
            searchMatch = ref.patientName.toLowerCase().includes(query);
            break;
          case 'dob':
            searchMatch = ref.dateOfBirth.toLowerCase().includes(query);
            break;
          case 'phone':
            searchMatch = ref.phone.toLowerCase().includes(query);
            break;
          case 'doctor':
            searchMatch = ref.referredBy.toLowerCase().includes(query);
            break;
          case 'practice':
            searchMatch = ref.practice.toLowerCase().includes(query);
            break;
          default:
            searchMatch = ref.patientName.toLowerCase().includes(query);
        }
      }
      
      return statusMatch && searchMatch;
    });

    // Sorting is now handled on the backend, so we don't need local sorting
    return result;
  }, [referrals, activeTab, searchFilter, searchQuery]);
  
  const getStatusBadge = (status: ReferralStatus) => {
    // Use facilitator-specific status badges for outbox
    const facilitatorStatus = status as FacilitatorOutboxStatus;
    if (facilitatorStatus in FACILITATOR_OUTBOX_STATUS_BADGE_STYLES) {
      return <Badge className={FACILITATOR_OUTBOX_STATUS_BADGE_STYLES[facilitatorStatus]}>
        {FACILITATOR_OUTBOX_STATUS_LABELS[facilitatorStatus]}
      </Badge>;
    }
    return <Badge className={STATUS_BADGE_STYLES[status]}>{STATUS_LABELS[status]}</Badge>;
  };
  
  // Function to handle new referral submission
  const handleNewReferralSubmit = (formData: NewReferralFormData) => {
    console.log("New referral data:", formData);
    setIsNewReferralOpen(false);
    // Refetch data after creating new referral
    refetchOutboundReferrals();
  };

  // Navigation handler
  const handleNavigate = (section: string) => {
    console.log('Navigating to:', section);
    // Implement navigation logic here
  };

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Search filter handler
  const handleSearchFilterChange = (filter: ReferralSearchFilter) => {
    setSearchFilter(filter);
  };

  // Sort handler
  const handleSortChange = (sort: ReferralSortOption) => {
    setSortBy(sort);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // User menu handler
  const handleUserMenuClick = () => {
    console.log('User menu clicked');
    // Implement user menu logic here
  };

  // Facilitator outbox-specific action handlers
  const handleSendReferral = () => {
    console.log('Send referral for:', selectedReferral?.patientName);
    // Implement send logic here
  };

  const handleResendReferral = () => {
    console.log('Resend referral for:', selectedReferral?.patientName);
    // Implement resend logic here
  };

  const handleEditDraft = () => {
    console.log('Edit draft for:', selectedReferral?.patientName);
    // Implement edit logic here
  };

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
    // Implement message sending logic here
  };

  const handleUploadFiles = (files: File[]) => {
    console.log('Uploading files:', files);
    // Implement file upload logic here
  };

  // Handle status update and refresh referral data
  const handleStatusUpdate = () => {
    // Refresh the facilitator outbound referrals data
    refetchOutboundReferrals();
  };

  // Handle individual referral refresh
  const handleReferralRefresh = (referralId: string) => {
    // Refresh the facilitator outbound referrals data
    refetchOutboundReferrals();
    
    // Update the selected referral with the latest data from the refreshed list
    const updatedReferral = referrals.find(r => r.referral_id === referralId);
    if (updatedReferral) {
      setSelectedReferral(updatedReferral);
    }
  };
  
  // Handle API errors
  if (outboundReferralsError) {
    console.error('Error fetching facilitator outbound referrals:', outboundReferralsError);
    // You might want to show an error message to the user here
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          {/* Referral list */}
          <ReferralListComponent 
            referrals={processedReferrals}
            selectedReferralId={selectedReferral?.referral_id}
            activeTab={activeTab as any}
            searchFilter={searchFilter}
            sortBy={sortBy}
            searchQuery={searchQuery}
            onReferralSelect={setSelectedReferral}
            onTabChange={(tab) => setActiveTab(tab as FacilitatorOutboxStatus)}
            onSearchFilterChange={handleSearchFilterChange}
            onSortChange={handleSortChange}
            onSearchChange={handleSearch}
            onNewReferralClick={() => setIsNewReferralOpen(true)}
            getStatusBadge={getStatusBadge}
            isLoading={isLoading}
            isOutbound={true}
          />
          
          {/* Referral detail view */}
          <div className="flex-1 p-6 bg-white overflow-y-auto">
            {selectedReferral ? (
              <ReferralDetail 
                key={`${selectedReferral.referral_id}-${activeTab}-${searchQuery}-${sortBy}`}
                referral={selectedReferral}
                onScheduleAppointment={handleEditDraft}
                onAcceptReferral={handleSendReferral}
                onVerifyBenefits={handleResendReferral}
                onSendMessage={handleSendMessage}
                onUploadFiles={handleUploadFiles}
                onStatusUpdate={handleStatusUpdate}
                onReferralRefresh={handleReferralRefresh}
                isLoading={isLoading}
                activeTab={activeTab}
                searchQuery={searchQuery}
                sortBy={sortBy}
                isOutbound={true}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <Send className="h-16 w-16 mb-4" />
                <h2 className="text-lg font-medium mb-2">No referral selected</h2>
                <p>Select a referral from the list to send or manage</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorOutbox; 
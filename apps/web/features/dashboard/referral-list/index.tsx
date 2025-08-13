'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Inbox } from 'lucide-react';
import { 
  Referral, 
  ReferralStatus, 
  ReferralSortOption,
  ReferralSearchFilter,
  NewReferralFormData, 
  SAMPLE_REFERRALS, 
  STATUS_BADGE_STYLES, 
  STATUS_LABELS 
} from '@/constants/referral';

// Import our new components
import ReferralListComponent from '@/components/referral/list/ReferralList';
import ReferralDetail from '@/components/referral/detail/ReferralDetail';
import NewReferralForm from '@/components/referral/forms/NewReferralForm';

// Import the useScannedReferrals hook
import { useScannedReferrals } from '@/lib/hooks/referrals';

export const ReferralList = () => {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [activeTab, setActiveTab] = useState<ReferralStatus | 'all'>('new');
  const [searchFilter, setSearchFilter] = useState<ReferralSearchFilter>('patient');
  const [sortBy, setSortBy] = useState<ReferralSortOption>('date-newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewReferralOpen, setIsNewReferralOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Use the useScannedReferrals hook to fetch real data
  const { 
    data: scannedReferralsData, 
    isLoading: isScannedReferralsLoading, 
    error: scannedReferralsError,
    refetch: refetchScannedReferrals 
  } = useScannedReferrals({
    page,
    page_size: pageSize,
    search: searchQuery,
    status: activeTab
  });
  
  // Extract data from API response
  const scannedReferrals = scannedReferralsData?.items || [];
  const pagination = scannedReferralsData?.pagination || {
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
    
    // Determine status based on API data - map to valid ReferralStatus values
    let status: ReferralStatus = apiReferral.referral_status as ReferralStatus;
    
    // Determine priority (you may need to adjust this based on your business logic)
    const priority = 'normal'; // Default priority
    
    // Calculate age from date of birth
    const age = apiReferral.patient_dob 
      ? Math.floor((new Date().getTime() - new Date(apiReferral.patient_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 0;
    

    return {
      referral_id: apiReferral.referral_id,
      patientId: apiReferral.patient_id || undefined, // Add patientId from API response
      patientName,
      age,
      dateOfBirth,
      phone,
      referredBy: apiReferral.referral_doctor_name || 'Unknown Doctor',
      practice: apiReferral.outbound_facility_name || 'Unknown Practice',
      dateReceived: apiReferral.referral_scanned_date || apiReferral.referral_outbound_date || new Date().toISOString(),
      status,
      priority,
      insurance: 'Unknown Insurance', // Default value since API doesn't provide this
      memberId: apiReferral.patient_insurance_member_id || 'N/A',
      reason: apiReferral.referral_remark || 'No reason provided',
      hasXrays: false, // Default value since API doesn't provide this
      hasInsurance: !!apiReferral.patient_insurance_member_id,
      appointmentDate: apiReferral.appointment_date || undefined,
      appointmentTime: apiReferral.appointment_time || undefined,
      appointmentType: apiReferral.appointment_type || undefined,
      documents: apiReferral.documents || [],
      isUrgent: apiReferral.is_urgent || false,
      isOutbound: !!apiReferral.referral_outbound_date // If referral_outbound_date exists, it's an outbound referral
    };
  };
  
  // Transform all API referrals
  const referrals = scannedReferrals.map(transformApiReferralToReferral);
  
  // Update loading state based on API loading
  useEffect(() => {
    setIsLoading(isScannedReferralsLoading);
  }, [isScannedReferralsLoading]);
  
  // Handle search changes
  useEffect(() => {
    // Reset to first page when search changes
    setPage(1);
  }, [searchQuery]);
  
  // Filter, search, and sort referrals
  const processedReferrals = React.useMemo(() => {
    let result = referrals.filter(ref => {
      const statusMatch = activeTab === 'all' || ref.status === activeTab;
      
      // Search based on selected filter
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
            searchMatch = true;
        }
      }
      
      return statusMatch && searchMatch;
    });

    // Sort the results
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-newest':
          return new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime();
        case 'date-oldest':
          return new Date(a.dateReceived).getTime() - new Date(b.dateReceived).getTime();
        case 'patient-name':
          return a.patientName.localeCompare(b.patientName);
        case 'priority':
          const priorityOrder = { 'overdue': 0, 'urgent': 1, 'normal': 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return 0;
      }
    });

    return result;
  }, [referrals, activeTab, searchFilter, searchQuery, sortBy]);
  
  const getStatusBadge = (status: ReferralStatus) => {
    return <Badge className={STATUS_BADGE_STYLES[status]}>{STATUS_LABELS[status]}</Badge>;
  };
  
  // Function to handle new referral submission
  const handleNewReferralSubmit = (formData: NewReferralFormData) => {
    console.log("New referral data:", formData);
    setIsNewReferralOpen(false);
    // Refetch data after creating new referral
    refetchScannedReferrals();
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

  // Referral action handlers
  const handleScheduleAppointment = () => {
    console.log('Schedule appointment for:', selectedReferral?.patientName);
    // Implement scheduling logic here
  };

  const handleAcceptReferral = () => {
    console.log('Accept referral for:', selectedReferral?.patientName);
    // Implement acceptance logic here
  };

  const handleVerifyBenefits = () => {
    console.log('Verify benefits for:', selectedReferral?.patientName);
    // Implement verification logic here
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
    // Refresh the scanned referrals data
    refetchScannedReferrals();
  };

  // Handle individual referral refresh
  const handleReferralRefresh = (referralId: string) => {
    // Refresh the scanned referrals data
    refetchScannedReferrals();
    
    // Update the selected referral with the latest data from the refreshed list
    const updatedReferral = referrals.find(r => r.referral_id === referralId);
    if (updatedReferral) {
      setSelectedReferral(updatedReferral);
    }
  };
  
  // Handle API errors
  if (scannedReferralsError) {
    console.error('Error fetching scanned referrals:', scannedReferralsError);
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
            activeTab={activeTab}
            searchFilter={searchFilter}
            sortBy={sortBy}
            searchQuery={searchQuery}
            onReferralSelect={setSelectedReferral}
            onTabChange={setActiveTab}
            onSearchFilterChange={handleSearchFilterChange}
            onSortChange={handleSortChange}
            onSearchChange={handleSearch}
            onNewReferralClick={() => setIsNewReferralOpen(true)}
            getStatusBadge={getStatusBadge}
            isLoading={isLoading}
          />
          
          {/* Referral detail view */}
          <div className="flex-1 p-6 bg-white overflow-y-auto">
            {selectedReferral ? (
              <ReferralDetail 
                key={`${selectedReferral.referral_id}-${activeTab}-${searchQuery}-${sortBy}`}
                referral={selectedReferral}
                onScheduleAppointment={handleScheduleAppointment}
                onAcceptReferral={handleAcceptReferral}
                onVerifyBenefits={handleVerifyBenefits}
                onSendMessage={handleSendMessage}
                onUploadFiles={handleUploadFiles}
                onStatusUpdate={handleStatusUpdate}
                onReferralRefresh={handleReferralRefresh}
                isLoading={isLoading}
                activeTab={activeTab}
                searchQuery={searchQuery}
                sortBy={sortBy}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <Inbox className="h-16 w-16 mb-4" />
                <h2 className="text-lg font-medium mb-2">No referral selected</h2>
                <p>Select a referral from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* New Referral Modal */}
      <Dialog open={isNewReferralOpen} onOpenChange={setIsNewReferralOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle>Create New Referral</DialogTitle>
          </DialogHeader>
          <NewReferralForm 
            onSubmit={handleNewReferralSubmit}
            onCancel={() => setIsNewReferralOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferralList;
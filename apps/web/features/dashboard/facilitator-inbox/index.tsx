'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inbox, Mail, Clock, CheckCircle, AlertCircle, Search, ChevronDown, Calendar, Image } from 'lucide-react';
import { useUser } from "@propelauth/nextjs/client";
import { 
  Referral, 
  ReferralStatus, 
  ReferralSortOption,
  ReferralSearchFilter,
  NewReferralFormData, 
  STATUS_BADGE_STYLES, 
  STATUS_LABELS,
  SORT_OPTIONS,
  PRIORITY_BADGE_STYLES,
  PRIORITY_LABELS
} from '@/constants/referral';

// Import our components
import ReferralListComponent from '@/components/referral/list/ReferralList';
import ReferralDetail from '@/components/referral/detail/ReferralDetail';
import NewReferralForm from '@/components/referral/forms/NewReferralForm';
import { PaginationWrapper } from '@/components/PaginationWrapper';
import { ReferralDetailSkeleton } from '@/components/referral/skeletons/ReferralSkeletons';

// Import the referral hooks
import { useFacilitatorInboundReferrals, useReferral } from '@/lib/hooks/referrals';

// Import the facility store
import { useFacilityStore } from '@/lib/stores/facilityStore';

// Define facilitator-specific status types
type FacilitatorInboxStatus = 'new' | 'active' | 'archive' | 'all';

const FACILITATOR_STATUS_BADGE_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
} as const;

const FACILITATOR_STATUS_LABELS = {
  pending: 'Pending Review',
  reviewed: 'Reviewed',
  approved: 'Approved',
  rejected: 'Rejected',
} as const;

export const FacilitatorInbox = () => {
  const { user } = useUser();
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [activeTab, setActiveTab] = useState<FacilitatorInboxStatus>('new');
  const [searchFilter, setSearchFilter] = useState<ReferralSearchFilter>('patient');
  const [sortBy, setSortBy] = useState<ReferralSortOption>('date-newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewReferralOpen, setIsNewReferralOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReferralDetailLoading, setIsReferralDetailLoading] = useState(false);
  
  // URL handling (query params)
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Refs to track initial values and prevent clearing URL on first load
  const isInitialLoad = useRef(true);
  const initialFacilityId = useRef<string | null>(null);
  const initialTab = useRef<FacilitatorInboxStatus>('new');
  
  // Add pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // Get the active facility ID from the facility store
  const { activeFacilityId } = useFacilityStore();
  
  // Helper function to map frontend sort options to backend sort options
  const mapFrontendSortToBackendSort = useCallback((frontendSort: ReferralSortOption): string | undefined => {
    switch (frontendSort) {
      case 'date-newest':
        return 'date_newest';
      case 'date-oldest':
        return 'date_oldest';
      default:
        return undefined;
    }
  }, []);
  
  // Use the useFacilitatorInboundReferrals hook to fetch real data
  const { 
    data: facilitatorReferralsData, 
    isLoading: isFacilitatorReferralsLoading, 
    error: facilitatorReferralsError,
    refetch: refetchFacilitatorReferrals 
  } = useFacilitatorInboundReferrals({
    page,
    page_size: pageSize,
    search: searchQuery,
    status: activeTab === 'all' ? '' : activeTab,
    facilitator_facility_id: activeFacilityId || '',
    sort_by: mapFrontendSortToBackendSort(sortBy)
  });
  
  // Extract data from API response
  const facilitatorReferrals = facilitatorReferralsData?.items || [];
  const pagination = facilitatorReferralsData?.pagination || {
    total_count: 0,
    total_pages: 1,
    current_page: 1,
    page_size: 10,
    has_next: false,
    has_previous: false
  };
  
  // Transform API data to match the expected Referral interface
  const transformApiReferralToReferral = useCallback((apiReferral: any): Referral => {
    const patientName = apiReferral.patient_fname && apiReferral.patient_lname 
      ? `${apiReferral.patient_fname} ${apiReferral.patient_lname}`
      : apiReferral.patient_fname || apiReferral.patient_lname || 'Unknown Patient';
    
    const dateOfBirth = apiReferral.patient_dob 
      ? new Date(apiReferral.patient_dob).toLocaleDateString()
      : 'N/A';
    
    const phone = apiReferral.patient_contact_phone || 'N/A';
    
    // Map facilitator status to referral status
    let status: ReferralStatus = 'new'; // Default to new
    if (apiReferral.referral_status) {
      switch (apiReferral.referral_status) {
        case 'active':
          status = 'active';
          break;
        case 'archive':
          status = 'archive';
          break;
        default:
          status = 'new';
      }
    }
    
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
      practice: apiReferral.outbound_facility_name || 'Unknown Practice',
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
  }, []);
  
  // Transform all API referrals
  const referrals = useMemo(() => 
    facilitatorReferrals.map(transformApiReferralToReferral), 
    [facilitatorReferrals, transformApiReferralToReferral]
  );
  
  // If URL contains ?id=<referral_id>, auto-select the matching referral or fetch it
  const selectedIdFromUrl = useMemo(() => searchParams.get('id') || '', [searchParams]);
  
  // Fetch referral by ID if it's not in the current list
  const { 
    data: referralByIdData, 
    isLoading: isReferralByIdLoading,
    error: referralByIdError 
  } = useReferral(selectedIdFromUrl);

  // Memoize the router.replace function to prevent unnecessary re-renders
  const updateUrl = useCallback((newParams: URLSearchParams) => {
    const qs = newParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [router, pathname]);
  
  // Clear URL params
  const clearUrlParams = useCallback(() => {
    router.replace(pathname);
  }, [router, pathname]);

  // Enhanced referral selection logic
  useEffect(() => {
    if (!selectedIdFromUrl) {
      setSelectedReferral(null);
      setIsReferralDetailLoading(false);
      return;
    }

    setIsReferralDetailLoading(true);
    
    // First, try to find the referral in the current list
    const fromList = referrals.find(r => r.referral_id === selectedIdFromUrl);
    if (fromList) {
      setSelectedReferral(fromList);
      setIsReferralDetailLoading(false);
      return;
    }
    
    // If not found in list, use the fetched referral by ID
    if (referralByIdData && !referralByIdError) {
      try {
        const transformedReferral = transformApiReferralToReferral(referralByIdData as any);
        setSelectedReferral(transformedReferral);
      } catch (error) {
        console.error('Error transforming referral data:', error);
        setSelectedReferral(null);
      }
      setIsReferralDetailLoading(false);
    } else if (referralByIdError) {
      console.error('Error fetching referral by ID:', referralByIdError);
      setSelectedReferral(null);
      setIsReferralDetailLoading(false);
    }
  }, [selectedIdFromUrl, referrals, referralByIdData, referralByIdError, transformApiReferralToReferral]);
  
  // Update loading state based on API loading
  useEffect(() => {
    setIsLoading(isFacilitatorReferralsLoading);
  }, [isFacilitatorReferralsLoading]);
  
  // Set initial values on first load
  useEffect(() => {
    if (isInitialLoad.current) {
      initialFacilityId.current = activeFacilityId;
      initialTab.current = activeTab;
      isInitialLoad.current = false;
    }
  }, [activeFacilityId, activeTab]);
  
  // Clear selected referral when facility changes (but not on first load)
  useEffect(() => {
    // Only clear if this is not the initial load and facility actually changed
    if (!isInitialLoad.current && initialFacilityId.current !== activeFacilityId) {
      setSelectedReferral(null);
      // Clear referral id from URL when context changes
      clearUrlParams();
      // Update the initial value
      initialFacilityId.current = activeFacilityId;
    }
  }, [activeFacilityId, clearUrlParams]);
  
  // Clear selected referral when tab changes (but not on first load)
  useEffect(() => {
    // Only clear if this is not the initial load and tab actually changed
    if (!isInitialLoad.current && initialTab.current !== activeTab) {
      setSelectedReferral(null);
      // Clear referral id from URL when context changes
      clearUrlParams();
      // Update the initial value
      initialTab.current = activeTab;
    }
  }, [activeTab, clearUrlParams]);
  
  // Handle search changes
  useEffect(() => {
    // Reset to first page when search changes
    setPage(1);
  }, [searchQuery]);
  
  // Filter, search, and sort referrals
  const processedReferrals = useMemo(() => {
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
  
  const getStatusBadge = useCallback((status: ReferralStatus) => {
    // Use facilitator-specific status badges
    const facilitatorStatus = status as FacilitatorInboxStatus;
    if (facilitatorStatus in FACILITATOR_STATUS_BADGE_STYLES) {
      return <Badge className={FACILITATOR_STATUS_BADGE_STYLES[facilitatorStatus]}>
        {FACILITATOR_STATUS_LABELS[facilitatorStatus]}
      </Badge>;
    }
    return <Badge className={STATUS_BADGE_STYLES[status]}>{STATUS_LABELS[status]}</Badge>;
  }, []);

  const getPriorityBadge = useCallback((priority: string) => {
    // Only show badge for urgent priority, hide for others
    if (priority !== 'urgent') {
      return null;
    }
    
    const badgeStyle = PRIORITY_BADGE_STYLES.urgent;
    const label = PRIORITY_LABELS.urgent;
    
    return (
      <Badge className={`${badgeStyle} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  }, []);
  
  // Function to handle new referral submission
  const handleNewReferralSubmit = useCallback((formData: NewReferralFormData) => {
    console.log("New referral data:", formData);
    setIsNewReferralOpen(false);
    // Refetch data after creating new referral
    refetchFacilitatorReferrals();
  }, [refetchFacilitatorReferrals]);

  // Navigation handler
  const handleNavigate = useCallback((section: string) => {
    console.log('Navigating to:', section);
    // Implement navigation logic here
  }, []);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Search filter handler
  const handleSearchFilterChange = useCallback((filter: ReferralSearchFilter) => {
    setSearchFilter(filter);
  }, []);

  // Sort handler
  const handleSortChange = useCallback((sort: ReferralSortOption) => {
    setSortBy(sort);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // User menu handler
  const handleUserMenuClick = useCallback(() => {
    console.log('User menu clicked');
    // Implement user menu logic here
  }, []);

  // Facilitator-specific action handlers
  const handleApproveReferral = useCallback(() => {
    console.log('Approve referral for:', selectedReferral?.patientName);
    // Implement approval logic here
  }, [selectedReferral?.patientName]);

  const handleRejectReferral = useCallback(() => {
    console.log('Reject referral for:', selectedReferral?.patientName);
    // Implement rejection logic here
  }, [selectedReferral?.patientName]);

  const handleReviewReferral = useCallback(() => {
    console.log('Review referral for:', selectedReferral?.patientName);
    // Implement review logic here
  }, [selectedReferral?.patientName]);

  const handleSendMessage = useCallback((message: string) => {
    console.log('Sending message:', message);
    // Implement message sending logic here
  }, []);

  const handleUploadFiles = useCallback((files: File[]) => {
    console.log('Uploading files:', files);
    // Implement file upload logic here
  }, []);

  // Handle status update and refresh referral data
  const handleStatusUpdate = useCallback(() => {
    // Refresh the facilitator inbound referrals data
    refetchFacilitatorReferrals();
  }, [refetchFacilitatorReferrals]);

  // Handle individual referral refresh
  const handleReferralRefresh = useCallback((referralId: string) => {
    // Refresh the facilitator inbound referrals data
    refetchFacilitatorReferrals();
    
    // Update the selected referral with the latest data from the refreshed list
    const updatedReferral = referrals.find(r => r.referral_id === referralId);
    if (updatedReferral) {
      setSelectedReferral(updatedReferral);
    }
  }, [refetchFacilitatorReferrals, referrals]);

  // Selecting a referral should sync it to the URL (?id=...)
  const handleSelectReferral = useCallback((referral: Referral) => {
    setSelectedReferral(referral);
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', referral.referral_id);
    updateUrl(params);
  }, [searchParams, updateUrl]);
  
  // Handle API errors
  if (facilitatorReferralsError) {
    console.error('Error fetching facilitator inbound referrals:', facilitatorReferralsError);
    // You might want to show an error message to the user here
  }
  
  // Show error state if referral by ID failed
  const showReferralError = selectedIdFromUrl && referralByIdError && !isReferralByIdLoading;
  
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
            onReferralSelect={handleSelectReferral}
            onTabChange={(tab) => setActiveTab(tab as FacilitatorInboxStatus)}
            onSearchFilterChange={handleSearchFilterChange}
            onSortChange={handleSortChange}
            onSearchChange={handleSearch}
            onNewReferralClick={() => setIsNewReferralOpen(true)}
            getStatusBadge={getStatusBadge}
            isLoading={isLoading}
            isOutbound={false}
          />
          
          {/* Referral detail view */}
          <div className="flex-1 p-6 bg-white overflow-y-auto">
            {showReferralError ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-red-500">
                <AlertCircle className="h-16 w-16 mb-4" />
                <h2 className="text-lg font-medium mb-2">Referral Not Found</h2>
                <p className="mb-4">The referral with ID "{selectedIdFromUrl}" could not be found.</p>
                <Button 
                  onClick={() => {
                    clearUrlParams();
                    setSelectedReferral(null);
                  }}
                  variant="outline"
                >
                  Clear Selection
                </Button>
              </div>
            ) : selectedReferral ? (
              <ReferralDetail 
                referral={selectedReferral}
                onScheduleAppointment={handleReviewReferral}
                onAcceptReferral={handleApproveReferral}
                onVerifyBenefits={handleRejectReferral}
                onSendMessage={handleSendMessage}
                onUploadFiles={handleUploadFiles}
                onStatusUpdate={handleStatusUpdate}
                onReferralRefresh={handleReferralRefresh}
                isLoading={isReferralDetailLoading}
                activeTab={activeTab}
                searchQuery={searchQuery}
                sortBy={sortBy}
                isOutbound={false}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <Inbox className="h-16 w-16 mb-4" />
                <h2 className="text-lg font-medium mb-2">No referral selected</h2>
                <p>Select a referral from the list to review and approve</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorInbox; 
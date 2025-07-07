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

export const ReferralList = () => {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [activeTab, setActiveTab] = useState<ReferralStatus | 'all'>('new');
  const [searchFilter, setSearchFilter] = useState<ReferralSearchFilter>('patient');
  const [sortBy, setSortBy] = useState<ReferralSortOption>('date-newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewReferralOpen, setIsNewReferralOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use sample data from constants
  const referrals = SAMPLE_REFERRALS;
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulate 1.5s loading time

    return () => clearTimeout(timer);
  }, []);
  
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
  
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          {/* Referral list */}
          <ReferralListComponent 
            referrals={processedReferrals}
            selectedReferralId={selectedReferral?.id}
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
                referral={selectedReferral}
                onScheduleAppointment={handleScheduleAppointment}
                onAcceptReferral={handleAcceptReferral}
                onVerifyBenefits={handleVerifyBenefits}
                onSendMessage={handleSendMessage}
                onUploadFiles={handleUploadFiles}
                isLoading={isLoading}
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
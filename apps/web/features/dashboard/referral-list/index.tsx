'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Inbox } from 'lucide-react';
import { 
  Referral, 
  ReferralStatus, 
  NewReferralFormData, 
  SAMPLE_REFERRALS, 
  STATUS_BADGE_STYLES, 
  STATUS_LABELS 
} from '@/constants/referral';

// Import our new components
import Sidebar from '@/components/referral/layout/Sidebar';
import Header from '@/components/referral/layout/Header';
import ReferralListComponent from '@/components/referral/list/ReferralList';
import ReferralDetail from '@/components/referral/detail/ReferralDetail';
import NewReferralForm from '@/components/referral/forms/NewReferralForm';

export const ReferralList = () => {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [activeTab, setActiveTab] = useState<ReferralStatus | 'all'>('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
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
  
  // Filter by status and referring doctor
  const filteredReferrals = referrals.filter(ref => {
    const statusMatch = activeTab === 'all' || ref.status === activeTab;
    const doctorMatch = filterDoctor === 'all' || ref.referredBy === filterDoctor;
    return statusMatch && doctorMatch;
  });
  
  // Get unique referring doctors for filter dropdown
  const referringDoctors = ['all', ...new Set(referrals.map(ref => ref.referredBy))];
  
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
    console.log('Searching for:', query);
    // Implement search logic here
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
            referrals={filteredReferrals}
            selectedReferralId={selectedReferral?.id}
            activeTab={activeTab}
            filterDoctor={filterDoctor}
            referringDoctors={referringDoctors}
            onReferralSelect={setSelectedReferral}
            onTabChange={setActiveTab}
            onDoctorFilterChange={setFilterDoctor}
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
'use client';
import React, { useEffect } from 'react';
import { useFacilityStore } from '@/lib/stores/facilityStore';
import { useUser } from '@propelauth/nextjs/client';
import FacilitySelectionModal from './FacilitySelectionModal';
import { Building, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FacilityRequirementWrapperProps {
  children: React.ReactNode;
  userType?: 'facilitator' | 'admin';
}

const FacilityRequirementWrapper: React.FC<FacilityRequirementWrapperProps> = ({
  children,
  userType
}) => {
  const { activeFacilityId, openFacilityModal, facilities } = useFacilityStore();
  const { user } = useUser();

  // Only apply facility requirement for facilitators
  const isFacilitator = userType === 'facilitator';
  
  // Auto-open facility modal if facilitator has no facility selected
  useEffect(() => {
    if (isFacilitator && !activeFacilityId && facilities.length > 0) {
      // Small delay to ensure the modal opens after the component mounts
      const timer = setTimeout(() => {
        openFacilityModal();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isFacilitator, activeFacilityId, facilities.length, openFacilityModal]);

  // If not a facilitator, render children normally
  if (!isFacilitator) {
    return <>{children}</>;
  }

  // If no facility is selected, show facility selection screen
  if (!activeFacilityId) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Select Your Facility
            </h1>
            
            <p className="text-gray-600 mb-6">
              To access your referrals and manage your workflow, please select the facility you'll be working with.
            </p>
            
            <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                Facility selection is required to continue
              </span>
            </div>
            
            <Button 
              onClick={openFacilityModal}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Building className="w-5 h-5 mr-2" />
              Select Facility
            </Button>
            
            {facilities.length === 0 && (
              <p className="text-sm text-gray-500 mt-4">
                No facilities assigned. Please contact your administrator.
              </p>
            )}
          </div>
        </div>
        
        {/* Always render the modal for facilitators */}
        <FacilitySelectionModal />
      </div>
    );
  }

  // If facility is selected, render children normally
  return (
    <>
      {children}
      <FacilitySelectionModal />
    </>
  );
};

export default FacilityRequirementWrapper; 
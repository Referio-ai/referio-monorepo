'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Building, Search, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFacilityStore } from '@/lib/stores/facilityStore';
import { useGetFacilitiesByUserId } from '@/lib/hooks/facilities';
import { Facility } from '@/lib/api/client/models/Facility';
import { useUser } from '@propelauth/nextjs/client';

const FacilitySelectionModal: React.FC = () => {
  const { 
    isFacilityModalOpen, 
    closeFacilityModal, 
    selectFacility, 
    activeFacilityId,
    setFacilities 
  } = useFacilityStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useUser();

  // Get user ID from PropelAuth user
  const userId = user?.userId;

  const { data: facilities, isLoading } = useGetFacilitiesByUserId(userId || '');

  // Use useMemo to filter facilities based on search term
  const filteredFacilities = useMemo(() => {
    if (!facilities) return [];
    return facilities.filter(facility =>
      facility.facility_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [facilities, searchTerm]);

  // Only update facilities in store when they change and are not empty
  useEffect(() => {
    if (facilities && facilities.length > 0) {
      setFacilities(facilities);
    }
  }, [facilities, setFacilities]);

  const handleFacilitySelect = (facilityId: string) => {
    selectFacility(facilityId);
  };

  const getActiveFacilityName = () => {
    const activeFacility = facilities?.find(f => f.facility_id === activeFacilityId);
    return activeFacility?.facility_name || 'Select Facility';
  };

  return (
    <Dialog open={isFacilityModalOpen} onOpenChange={closeFacilityModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Select Facility
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search facilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading facilities...</span>
            </div>
          )}

          {/* Facilities List */}
          {!isLoading && (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredFacilities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No facilities found</p>
                  {!userId && (
                    <p className="text-sm text-gray-400 mt-2">Please log in to view your assigned facilities</p>
                  )}
                </div>
              ) : (
                filteredFacilities.map((facility) => (
                  <div
                    key={facility.facility_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                      activeFacilityId === facility.facility_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleFacilitySelect(facility.facility_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {facility.facility_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {facility.facility_primary_contact_email}
                          </p>
                        </div>
                      </div>
                      {activeFacilityId === facility.facility_id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Current Selection */}
          {activeFacilityId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Current:</span> {getActiveFacilityName()}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacilitySelectionModal; 
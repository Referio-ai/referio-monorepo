'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Building, Search, Check, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFacilityStore } from '@/lib/stores/facilityStore';
import { useGetFacilitiesByUserId } from '@/lib/hooks/facilities';
import { Facility } from '@/lib/api/client/models/Facility';
import { useUser } from '@propelauth/nextjs/client';

interface GroupedFacilities {
  [organizationName: string]: Facility[];
}

const FacilitySelectionModal: React.FC = () => {
  const { 
    isFacilityModalOpen, 
    closeFacilityModal, 
    selectFacility, 
    activeFacilityId,
    setFacilities 
  } = useFacilityStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [expandedOrganizations, setExpandedOrganizations] = useState<Set<string>>(new Set());
  const { user } = useUser();

  // Get user ID from PropelAuth user
  const userId = user?.userId;

  const { data: facilities, isLoading } = useGetFacilitiesByUserId(userId || '');

  // Group facilities by organization
  const groupedFacilities = useMemo(() => {
    if (!facilities) return {};
    
    const grouped: GroupedFacilities = {};
    facilities.forEach(facility => {
      const orgName = facility.organization_name || 'Unknown Organization';
      if (!grouped[orgName]) {
        grouped[orgName] = [];
      }
      grouped[orgName].push(facility);
    });
    
    return grouped;
  }, [facilities]);

  // Get unique organization names
  const organizationNames = useMemo(() => {
    return Object.keys(groupedFacilities).sort();
  }, [groupedFacilities]);

  // Filter facilities based on search term and selected organization
  const filteredGroupedFacilities = useMemo(() => {
    if (!facilities) return {};
    
    const filtered: GroupedFacilities = {};
    
    Object.entries(groupedFacilities).forEach(([orgName, orgFacilities]) => {
      // If organization is selected, only show facilities from that org
      if (selectedOrganization && orgName !== selectedOrganization) {
        return;
      }
      
      // Filter facilities by search term
      const filteredFacilities = orgFacilities.filter(facility =>
        facility.facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredFacilities.length > 0) {
        filtered[orgName] = filteredFacilities;
      }
    });
    
    return filtered;
  }, [groupedFacilities, selectedOrganization, searchTerm]);

  // Only update facilities in store when they change and are not empty
  useEffect(() => {
    if (facilities && facilities.length > 0) {
      setFacilities(facilities);
    }
  }, [facilities, setFacilities]);

  // Auto-select first organization if none selected
  useEffect(() => {
    if (organizationNames.length > 0 && !selectedOrganization) {
      setSelectedOrganization(organizationNames[0]);
      setExpandedOrganizations(new Set([organizationNames[0]]));
    }
  }, [organizationNames, selectedOrganization]);

  const handleFacilitySelect = (facilityId: string) => {
    selectFacility(facilityId);
  };

  const handleOrganizationSelect = (orgName: string) => {
    setSelectedOrganization(orgName);
    setExpandedOrganizations(new Set([orgName]));
    setSearchTerm(''); // Clear search when changing organization
  };

  const toggleOrganizationExpansion = (orgName: string) => {
    const newExpanded = new Set(expandedOrganizations);
    if (newExpanded.has(orgName)) {
      newExpanded.delete(orgName);
    } else {
      newExpanded.add(orgName);
    }
    setExpandedOrganizations(newExpanded);
  };

  const getActiveFacilityName = () => {
    const activeFacility = facilities?.find(f => f.facility_id === activeFacilityId);
    return activeFacility?.facility_name || 'Select Facility';
  };

  const getActiveOrganizationName = () => {
    const activeFacility = facilities?.find(f => f.facility_id === activeFacilityId);
    return activeFacility?.organization_name || 'Unknown Organization';
  };

  return (
    <Dialog open={isFacilityModalOpen} onOpenChange={closeFacilityModal}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Select Facility
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Organization Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Organization</label>
            <div className="relative">
              <select
                value={selectedOrganization}
                onChange={(e) => handleOrganizationSelect(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {organizationNames.map(orgName => (
                  <option key={orgName} value={orgName}>
                    {orgName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search facilities or organizations..."
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

          {/* Facilities List Grouped by Organization */}
          {!isLoading && (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {Object.keys(filteredGroupedFacilities).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No facilities found</p>
                  {!userId && (
                    <p className="text-sm text-gray-400 mt-2">Please log in to view your assigned facilities</p>
                  )}
                </div>
              ) : (
                Object.entries(filteredGroupedFacilities).map(([orgName, orgFacilities]) => (
                  <div key={orgName} className="border border-gray-200 rounded-lg">
                    {/* Organization Header */}
                    <div 
                      className="p-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleOrganizationExpansion(orgName)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {expandedOrganizations.has(orgName) ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                          <h3 className="font-medium text-gray-900">{orgName}</h3>
                          <span className="text-sm text-gray-500">({orgFacilities.length} facilities)</span>
                        </div>
                      </div>
                    </div>

                    {/* Facilities in Organization */}
                    {expandedOrganizations.has(orgName) && (
                      <div className="p-2 space-y-2">
                        {orgFacilities.map((facility) => (
                          <div
                            key={facility.facility_id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                              activeFacilityId === facility.facility_id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200'
                            }`}
                            onClick={() => handleFacilitySelect(facility.facility_id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <Building className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {facility.facility_name}
                                  </h4>
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
                        ))}
                      </div>
                    )}
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
                <span className="text-blue-600 ml-2">({getActiveOrganizationName()})</span>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacilitySelectionModal; 
'use client';
import React, { useState, useEffect } from 'react';
import { Building, Search, Plus, MapPin, Phone, Mail, Users, Trash2, Loader2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { toast } from 'sonner';
import { useGetFacilities, createFacility, updateFacility, deleteFacility } from '@/lib/hooks/facilities';
import AddFacilityModal from './components/AddFacilityModal/index';
import EditFacilityModal from './components/EditFacilityModal/index';
import { PaginationWrapper } from '@/components/PaginationWrapper';

interface Facility {
  facility_id: string;
  organization_id: string;
  facility_name: string;
  facility_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  facility_primary_contact_fname: string;
  facility_primary_contact_mname: string;
  facility_primary_contact_lname: string;
  facility_primary_contact_phone_number: string;
  facility_primary_contact_email: string;
  propelauth_facility_id: string;
}

interface FacilityFilters {
  search: string;
  page: number;
  limit: number;
}

interface FacilityResponse {
  items: Facility[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
  };
}

const ITEMS_PER_PAGE = 5;

const FacilityManagement = () => {
  const [filters, setFilters] = useState<FacilityFilters>({
    search: '',
    page: 1,
    limit: ITEMS_PER_PAGE
  });

  const { data: facilitiesResponse, isLoading: isFacilitiesLoading, refetch: refetchFacilities } = useGetFacilities({
    page: filters.page,
    pageSize: filters.limit,
    search: filters.search
  });

  const facilities = facilitiesResponse?.items || [];
  const pagination = facilitiesResponse?.pagination || {
    total_count: 0,
    total_pages: 0,
    current_page: 1,
    page_size: 5,
  };

  useEffect(()=>{
    refetchFacilities();
  },[filters.page]);

  const { mutate: createFacilityMutation, isPending: isCreatingFacility } = createFacility();
  const { mutate: updateFacilityMutation, isPending: isUpdatingFacility } = updateFacility();
  const { mutate: deleteFacilityMutation, isPending: isDeletingFacility } = deleteFacility();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState<Facility | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);

  // Handle filter changes
  const handleFilterChange = (key: keyof FacilityFilters, value: string | number) => {

    if(key === 'page'){
      setFilters(prev => ({ 
        ...prev, 
        [key]: Number(value),
      }));
      return;
    }

    setFilters(prev => ({ 
      ...prev, 
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle add facility
  const handleAddFacility = (facility: Facility) => {
    createFacilityMutation(facility, {
      onSuccess: () => {
        toast.success("The facility has been successfully added.");
        setIsAddModalOpen(false);
        refetchFacilities();
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to add facility.");
      }
    });
  };

  // Handle edit facility
  const handleEditFacility = (facilityId: string, updatedFacility: Partial<Facility>) => {
    updateFacilityMutation({ facilityId, facility: updatedFacility }, {
      onSuccess: () => {
        toast.success("The facility has been successfully updated.");
        setIsEditModalOpen(false);
        setFacilityToEdit(null);
        refetchFacilities();
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to update facility.");
      }
    });
  };

  // Handle delete facility
  const handleDeleteFacility = (facility: Facility) => {
    setFacilityToDelete(facility);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (facilityToDelete) {
      deleteFacilityMutation(facilityToDelete.facility_id, {
        onSuccess: () => {
          toast.success("The facility has been successfully deleted.");
          setIsDeleteDialogOpen(false);
          setFacilityToDelete(null);
          refetchFacilities();
        },
        onError: (error) => {
          console.error(error);
          toast.error("Failed to delete facility.");
        }
      });
    }
  };

  // Handle edit button click
  const handleEditClick = (facility: Facility) => {
    setFacilityToEdit(facility);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-gray-500">Manage and monitor facilities</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          onClick={() => setIsAddModalOpen(true)}
          disabled={isCreatingFacility}
        >
          {isCreatingFacility ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {isCreatingFacility ? 'Adding...' : 'Add New Facility'}
        </Button>
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search facilities..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facilities Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isFacilitiesLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </td>
                  </tr>
                ) : (
                  facilities.map((facility) => (
                  <tr key={facility.facility_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{facility.facility_name}</div>
                        <div className="text-sm text-gray-500">ID: {facility.facility_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {`${facility.facility_primary_contact_fname} ${facility.facility_primary_contact_mname ? facility.facility_primary_contact_mname + ' ' : ''}${facility.facility_primary_contact_lname}`}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {facility.facility_primary_contact_phone_number}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {facility.facility_primary_contact_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {facility.facility_address.street}
                        </div>
                        <div className="text-sm text-gray-600 pl-6">
                          {`${facility.facility_address.city}, ${facility.facility_address.state} ${facility.facility_address.zip_code}`}
                        </div>
                        <div className="text-sm text-gray-600 pl-6">
                          {facility.facility_address.country}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEditClick(facility as Facility)}
                          disabled={isUpdatingFacility}
                        >
                          {isUpdatingFacility ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteFacility(facility as Facility)}
                          disabled={isDeletingFacility}
                        >
                          {isDeletingFacility ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <PaginationWrapper
            currentPage={pagination.current_page}
            totalItems={pagination.total_count}
            itemsPerPage={pagination.page_size}
            onPageChange={(page) => handleFilterChange('page', page)}
          />
     
          {/* Empty State */}
          {facilities.length === 0 && !isFacilitiesLoading && (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <Building className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6">No facilities found matching your filters.</p>
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  page: 1,
                  limit: ITEMS_PER_PAGE
                })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Facility Modal */}
      <AddFacilityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        organizations={[]}
        onSubmit={handleAddFacility}
      />

      {/* Edit Facility Modal */}
      <EditFacilityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFacilityToEdit(null);
        }}
        facility={facilityToEdit}
        onSubmit={handleEditFacility}
        isLoading={isUpdatingFacility}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the facility
              {facilityToDelete && ` "${facilityToDelete.facility_name}"`} and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletingFacility}
            >
              {isDeletingFacility ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FacilityManagement;

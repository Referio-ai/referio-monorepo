'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useGetFacilitators } from '@/lib/hooks/facilitators';
import { useGetFacilities } from '@/lib/hooks/facilities';
import { useDeleteFacilitator } from '@/lib/hooks/facilitators';
import { PaginationWrapper } from '@/components/PaginationWrapper';


// Import types
import type { Facilitator, Facility, FacilitatorFilters } from './types';

// Import components
import {
  AddFacilitatorModal,
  EditFacilitatorModal,
  FacilitatorCard,
  EmptyState,
  DeleteConfirmDialog,
} from './components';
import FacilitatorFiltersComponent from './components/FacilitatorFilters';

// Import utilities
import { filterFacilitators } from './utils/filterUtils';

const FacilitatorManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFacilitator, setSelectedFacilitator] = useState<Facilitator | null>(null);
  const [filters, setFilters] = useState<FacilitatorFilters>({
    search: '',
    facility_id: 'all',
    status: 'all',
    facilitator_first_name: '',
    facilitator_last_name: '',
  });

  const { data: facilitatorsResponse, isLoading: isFacilitatorsLoading, refetch: refetchFacilitators, isRefetching: isFacilitatorsRefetching } = useGetFacilitators({
    page,
    pageSize,
    search: filters.search,
    facilityId: filters.facility_id,
  });

  // Fetch facilities from API
  const { data: facilitiesResponse, isLoading: isFacilitiesLoading } = useGetFacilities({
    page: 1,
    pageSize: 100, // Get a large number to avoid pagination issues
    search: ''
  });

  const deleteFacilitatorMutation = useDeleteFacilitator();

  const facilities = facilitiesResponse?.items || [];
  const facilitators = facilitatorsResponse?.items || [];
  const total_count = facilitatorsResponse?.total || 0;

  // Effect to handle filter changes and trigger refetch
  useEffect(() => {
    setPage(1); // Reset to first page when filters change
    refetchFacilitators();
  }, [filters.search, filters.facility_id, refetchFacilitators]);

  // Effect to handle page changes
  useEffect(() => {
    refetchFacilitators();
  }, [page, pageSize, refetchFacilitators]);

  const handleAddFacilitator = (facilitator: Facilitator) => {
    // The actual API call is handled in the AddFacilitatorModal component
    // We just need to refresh the list after successful creation
    setIsAddModalOpen(false);
    refetchFacilitators();
    toast.success('Facilitator added successfully');
  };

  const handleEditFacilitator = (facilitator: Facilitator) => {
    // This is now handled directly in the EditFacilitatorModal component
    setIsEditModalOpen(false);
    setSelectedFacilitator(null);
    toast.success('Facilitator updated successfully');
    refetchFacilitators();
  };

  const handleDeleteFacilitator = () => {
    if (selectedFacilitator) {
      deleteFacilitatorMutation.mutate(selectedFacilitator.facilitator_id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedFacilitator(null);
          toast.success('Facilitator deleted successfully');
          refetchFacilitators();
        },
        onError: (error) => {
          toast.error('Failed to delete facilitator', {
            description: error.message,
          });
        },
      });
    }
  };

  const handleEditClick = (facilitator: Facilitator) => {
    setSelectedFacilitator(facilitator);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (facilitator: Facilitator) => {
    setSelectedFacilitator(facilitator);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const filteredFacilitators = filterFacilitators(facilitators, filters);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Facilitator Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage facilitators and their facility assignments
        </p>
      </div>

      {/* Filters */}
      <FacilitatorFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        facilities={facilities}
      />

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Facilitators ({total_count || facilitators.length})
          </h2>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Facilitator
        </Button>
      </div>

      {/* Facilitators List */}
      <div className="grid gap-4">
        {(isFacilitatorsLoading || isFacilitatorsRefetching) ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredFacilitators.map((facilitator) => {
          // Ensure both IDs are strings for comparison
          const facilitatorFacilityId = String(facilitator.facility_id);
          const facility = facilities.find(f => String(f.facility_id) === facilitatorFacilityId);
          
          // Transform Facilitator to FacilitatorWithFacilities
          const facilitatorWithFacilities = {
            ...facilitator,
            facilities: facility ? [facility] : []
          };
          
          return (
            <FacilitatorCard
              key={facilitator.facilitator_id}
              facilitator={facilitatorWithFacilities}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          );
        })}
      </div>

      {filteredFacilitators.length === 0 && !isFacilitatorsLoading && (
        <EmptyState
          hasFilters={!!(filters.search || filters.facility_id !== 'all' || filters.status !== 'all')}
          onAddFacilitator={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Pagination */}
      {!!total_count && total_count > 1 && (
        <div className="mt-8">
          <PaginationWrapper
            currentPage={page}
            totalItems={total_count}
            itemsPerPage={pageSize}
            onPageChange={handlePageChange}
            maxVisiblePages={5}
          />
        </div>
      )}

      {/* Add Facilitator Modal */}
      <AddFacilitatorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddFacilitator}
        facilities={facilities}
      />

      {/* Edit Facilitator Modal */}
      {selectedFacilitator && (
        <EditFacilitatorModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedFacilitator(null);
          }}
          onSubmit={handleEditFacilitator}
          facilitator={selectedFacilitator}
          facilities={facilities}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteFacilitator}
        facilitator={selectedFacilitator}
      />
    </div>
  );
};

export default FacilitatorManagement; 
'use client';
import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MapPin, Phone, Mail, Users, Trash2, Loader2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { toast } from 'sonner';
import { useGetOrganizations, createOrganization, updateOrganization, deleteOrganization } from '@/lib/hooks/organizations';
import AddOrganizationModal from './components/AddOrganizationModal';
import EditOrganizationModal from './components/EditOrganizationModal';
import { PaginationWrapper } from '@/components/PaginationWrapper';

interface Organization {
  organization_id: string;
  organization_name: string;
  organization_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  organization_primary_contact_fname: string;
  organization_primary_contact_mname: string;
  organization_primary_contact_lname: string;
  organization_primary_contact_phone_number: string;
  organization_primary_contact_email: string;
  organization_prefix: string;
}

interface OrganizationFormData {
  organization_name: string;
  organization_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  organization_primary_contact_fname: string;
  organization_primary_contact_mname: string;
  organization_primary_contact_lname: string;
  organization_primary_contact_phone_number: string;
  organization_primary_contact_email: string;
  organization_prefix: string;
}

interface OrganizationFilters {
  search: string;
  page: number;
  limit: number;
}

interface OrganizationResponse {
  items: Organization[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
  };
}

const ITEMS_PER_PAGE = 5;

const OrganizationManagement = () => {
  const [filters, setFilters] = useState<OrganizationFilters>({
    search: '',
    page: 1,
    limit: ITEMS_PER_PAGE
  });

  const { data: organizationsResponse, isLoading: isOrganizationsLoading, refetch: refetchOrganizations } = useGetOrganizations({
    page: filters.page,
    pageSize: filters.limit,
    search: filters.search
  });

  const organizations = organizationsResponse?.items || [];
  const pagination = organizationsResponse?.pagination || {
    total_count: 0,
    total_pages: 0,
    current_page: 1,
    page_size: 5,
  };

  useEffect(()=>{
    refetchOrganizations();
  },[filters.page]);

  const { mutate: createOrganizationMutation, isPending: isCreatingOrganization } = createOrganization();
  const { mutate: updateOrganizationMutation, isPending: isUpdatingOrganization } = updateOrganization();
  const { mutate: deleteOrganizationMutation, isPending: isDeletingOrganization } = deleteOrganization();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [organizationToEdit, setOrganizationToEdit] = useState<Organization | null>(null);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);

  // Handle filter changes
  const handleFilterChange = (key: keyof OrganizationFilters, value: string | number) => {

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

  // Handle add organization
  const handleAddOrganization = (organization: OrganizationFormData) => {
    console.log('handleAddOrganization called with:', organization);
    createOrganizationMutation(organization, {
      onSuccess: () => {
        console.log('Organization created successfully');
        toast.success("The organization has been successfully added.");
        setIsAddModalOpen(false);
        refetchOrganizations();
      },
      onError: (error) => {
        console.error('Error creating organization:', error);
        toast.error("Failed to add organization.");
      }
    });
  };

  // Handle edit organization
  const handleEditOrganization = (organizationId: string, updatedOrganization: Partial<Organization>) => {
    updateOrganizationMutation({ organizationId, organization: updatedOrganization as any }, {
      onSuccess: () => {
        toast.success("The organization has been successfully updated.");
        setIsEditModalOpen(false);
        setOrganizationToEdit(null);
        refetchOrganizations();
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to update organization.");
      }
    });
  };

  // Handle delete organization
  const handleDeleteOrganization = (organization: Organization) => {
    setOrganizationToDelete(organization);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (organizationToDelete) {
      deleteOrganizationMutation(organizationToDelete.organization_id, {
        onSuccess: () => {
          toast.success("The organization has been successfully deleted.");
          setIsDeleteDialogOpen(false);
          setOrganizationToDelete(null);
          refetchOrganizations();
        },
        onError: (error) => {
          console.error(error);
          toast.error("Failed to delete organization.");
        }
      });
    }
  };

  // Handle edit button click
  const handleEditClick = (organization: Organization) => {
    setOrganizationToEdit(organization);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
          <p className="text-gray-500">Manage and monitor organizations</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          onClick={() => setIsAddModalOpen(true)}
          disabled={isCreatingOrganization}
        >
          {isCreatingOrganization ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding Organization...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add New Organization
            </>
          )}
        </Button>
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search organizations..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Organization
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
                {isOrganizationsLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </td>
                  </tr>
                ) : (
                  organizations.map((organization) => (
                  <tr key={organization.organization_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{organization.organization_name}</div>
                        <div className="text-sm text-gray-500">ID: {organization.organization_id}</div>
                        <div className="text-sm text-gray-500">Prefix: {organization.organization_prefix}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {`${organization.organization_primary_contact_fname} ${organization.organization_primary_contact_mname ? organization.organization_primary_contact_mname + ' ' : ''}${organization.organization_primary_contact_lname}`}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {organization.organization_primary_contact_phone_number}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {organization.organization_primary_contact_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {organization.organization_address.street}
                        </div>
                        <div className="text-sm text-gray-600 pl-6">
                          {`${organization.organization_address.city}, ${organization.organization_address.state} ${organization.organization_address.zip_code}`}
                        </div>
                        <div className="text-sm text-gray-600 pl-6">
                          {organization.organization_address.country}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEditClick(organization as Organization)}
                          disabled={isUpdatingOrganization}
                        >
                          {isUpdatingOrganization ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteOrganization(organization as Organization)}
                          disabled={isDeletingOrganization}
                        >
                          {isDeletingOrganization ? (
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
          {organizations.length === 0 && !isOrganizationsLoading && (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6">No organizations found matching your filters.</p>
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

      {/* Add Organization Modal */}
      <AddOrganizationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddOrganization}
      />

      {/* Edit Organization Modal */}
      <EditOrganizationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setOrganizationToEdit(null);
        }}
        organization={organizationToEdit}
        onSubmit={handleEditOrganization}
        isLoading={isUpdatingOrganization}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organization
              {organizationToDelete && ` "${organizationToDelete.organization_name}"`} and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletingOrganization}
            >
              {isDeletingOrganization ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrganizationManagement;

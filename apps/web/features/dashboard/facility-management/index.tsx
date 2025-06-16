'use client';
import React, { useState, useEffect } from 'react';
import { Building, Filter, Search, Plus, ChevronRight, MapPin, Phone, Mail, Users, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  totalReferrals: number;
}

interface FacilityFilters {
  search: string;
  type: string;
  status: string;
  city: string;
}

const ITEMS_PER_PAGE = 10;
const ALL_VALUE = 'all';

const FacilityManagement = () => {
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filters, setFilters] = useState<FacilityFilters>({
    search: '',
    type: ALL_VALUE,
    status: ALL_VALUE,
    city: ALL_VALUE,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);
  const [newFacility, setNewFacility] = useState<Partial<Facility>>({
    name: '',
    type: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    status: 'active',
    totalReferrals: 0,
  });

  // Sample facility types - in real app, these would come from an API
  const facilityTypes = [
    'Hospital',
    'Clinic',
    'Urgent Care',
    'Specialty Center',
    'Rehabilitation Center',
  ];

  // Sample cities - in real app, these would come from an API
  const cities = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
  ];

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const mockFacilities: Facility[] = Array.from({ length: 25 }, (_, i) => ({
      id: `FAC${String(i + 1).padStart(3, '0')}`,
      name: `${facilityTypes[i % facilityTypes.length]} ${i + 1}`,
      type: facilityTypes[i % facilityTypes.length],
      address: `${100 + i} Main St`,
      city: cities[i % cities.length],
      state: 'CA',
      phone: `(555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
      email: `facility${i + 1}@example.com`,
      status: i % 5 === 0 ? 'inactive' : 'active',
      totalReferrals: Math.floor(Math.random() * 500) + 50,
    }));

    setFacilities(mockFacilities);
    setIsLoading(false);
  }, []);

  // Update filtered facilities and total pages when filters or facilities change
  useEffect(() => {
    const filtered = facilities.filter(facility => {
      const matchesSearch = !filters.search || 
        facility.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        facility.address.toLowerCase().includes(filters.search.toLowerCase()) ||
        facility.city.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesType = filters.type === ALL_VALUE || facility.type === filters.type;
      const matchesStatus = filters.status === ALL_VALUE || facility.status === filters.status;
      const matchesCity = filters.city === ALL_VALUE || facility.city === filters.city;

      return matchesSearch && matchesType && matchesStatus && matchesCity;
    });

    setFilteredFacilities(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
  }, [facilities, filters]);

  // Get paginated facilities
  const getPaginatedFacilities = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredFacilities.slice(startIndex, endIndex);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FacilityFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle add facility
  const handleAddFacility = () => {
    const facility: Facility = {
      id: `FAC${String(facilities.length + 1).padStart(3, '0')}`,
      name: newFacility.name || '',
      type: newFacility.type || '',
      address: newFacility.address || '',
      city: newFacility.city || '',
      state: newFacility.state || '',
      phone: newFacility.phone || '',
      email: newFacility.email || '',
      status: newFacility.status as 'active' | 'inactive',
      totalReferrals: newFacility.totalReferrals || 0,
    };

    setFacilities(prev => [...prev, facility]);
    setIsAddModalOpen(false);
    setNewFacility({
      name: '',
      type: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      email: '',
      status: 'active',
      totalReferrals: 0,
    });
    toast({
      title: "Facility Added",
      description: "The facility has been successfully added.",
    });
  };

  // Handle delete facility
  const handleDeleteFacility = (facility: Facility) => {
    setFacilityToDelete(facility);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (facilityToDelete) {
      setFacilities(prev => prev.filter(f => f.id !== facilityToDelete.id));
      setIsDeleteDialogOpen(false);
      setFacilityToDelete(null);
      toast({
        title: "Facility Deleted",
        description: "The facility has been successfully deleted.",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-gray-500">Manage and monitor healthcare facilities</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Facility
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Facilities</p>
                <p className="text-2xl font-bold">{facilities.length}</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Facilities</p>
                <p className="text-2xl font-bold">
                  {facilities.filter(f => f.status === 'active').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                <p className="text-2xl font-bold">
                  {facilities.reduce((sum, f) => sum + f.totalReferrals, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
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
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Facility Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Types</SelectItem>
                {facilityTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.city}
              onValueChange={(value) => handleFilterChange('city', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedFacilities().map((facility) => (
                  <tr key={facility.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{facility.name}</div>
                        <div className="text-sm text-gray-500">{facility.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {facility.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {facility.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {facility.address}, {facility.city}, {facility.state}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{facility.totalReferrals}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        facility.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {facility.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteFacility(facility)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Empty State */}
          {filteredFacilities.length === 0 && (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <Building className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6">No facilities found matching your filters.</p>
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  type: ALL_VALUE,
                  status: ALL_VALUE,
                  city: ALL_VALUE,
                })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Facility Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Facility</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Facility Name</Label>
                <Input
                  id="name"
                  value={newFacility.name}
                  onChange={(e) => setNewFacility(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter facility name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Facility Type</Label>
                <Select
                  value={newFacility.type}
                  onValueChange={(value) => setNewFacility(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilityTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newFacility.address}
                onChange={(e) => setNewFacility(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  value={newFacility.city}
                  onValueChange={(value) => setNewFacility(prev => ({ ...prev, city: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newFacility.state}
                  onChange={(e) => setNewFacility(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Enter state"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newFacility.phone}
                  onChange={(e) => setNewFacility(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newFacility.email}
                  onChange={(e) => setNewFacility(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newFacility.status}
                  onValueChange={(value) => setNewFacility(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalReferrals">Total Referrals</Label>
                <Input
                  id="totalReferrals"
                  type="number"
                  value={newFacility.totalReferrals}
                  onChange={(e) => setNewFacility(prev => ({ ...prev, totalReferrals: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter total referrals"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFacility}>Add Facility</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the facility
              {facilityToDelete && ` "${facilityToDelete.name}"`} and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FacilityManagement;

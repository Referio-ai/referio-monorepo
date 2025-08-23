'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  onSubmit: (organizationId: string, organization: Partial<Organization>) => void;
  isLoading: boolean;
}

const EditOrganizationModal: React.FC<EditOrganizationModalProps> = ({
  isOpen,
  onClose,
  organization,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<Organization>>({
    organization_name: '',
    organization_address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
    },
    organization_primary_contact_fname: '',
    organization_primary_contact_mname: '',
    organization_primary_contact_lname: '',
    organization_primary_contact_phone_number: '',
    organization_primary_contact_email: '',
    organization_prefix: '',
  });

  // Update form data when organization prop changes
  useEffect(() => {
    if (organization) {
      setFormData({
        organization_name: organization.organization_name || '',
        organization_address: {
          street: organization.organization_address?.street || '',
          city: organization.organization_address?.city || '',
          state: organization.organization_address?.state || '',
          zip_code: organization.organization_address?.zip_code || '',
          country: organization.organization_address?.country || '',
        },
        organization_primary_contact_fname: organization.organization_primary_contact_fname || '',
        organization_primary_contact_mname: organization.organization_primary_contact_mname || '',
        organization_primary_contact_lname: organization.organization_primary_contact_lname || '',
        organization_primary_contact_phone_number: organization.organization_primary_contact_phone_number || '',
        organization_primary_contact_email: organization.organization_primary_contact_email || '',
        organization_prefix: organization.organization_prefix || '',
      });
    }
  }, [organization]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof any],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organization) return;
    
    // Basic validation
    if (!formData.organization_name?.trim()) {
      toast.error('Organization name is required');
      return;
    }
    
    if (!formData.organization_primary_contact_fname?.trim() || 
        !formData.organization_primary_contact_lname?.trim()) {
      toast.error('Primary contact first and last name are required');
      return;
    }
    
    if (!formData.organization_primary_contact_email?.trim()) {
      toast.error('Primary contact email is required');
      return;
    }
    
    if (!formData.organization_primary_contact_phone_number?.trim()) {
      toast.error('Primary contact phone number is required');
      return;
    }
    
    if (!formData.organization_prefix?.trim()) {
      toast.error('Organization prefix is required');
      return;
    }

    try {
      await onSubmit(organization.organization_id, formData);
    } catch (error) {
      console.error('Error updating organization:', error);
    }
  };

  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Edit Organization</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organization_name">Organization Name *</Label>
                <Input
                  id="organization_name"
                  value={formData.organization_name || ''}
                  onChange={(e) => handleInputChange('organization_name', e.target.value)}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="organization_prefix">Organization Prefix *</Label>
                <Input
                  id="organization_prefix"
                  value={formData.organization_prefix || ''}
                  onChange={(e) => handleInputChange('organization_prefix', e.target.value)}
                  placeholder="e.g., ABC, XYZ"
                  required
                />
              </div>
            </div>
          </div>

          {/* Organization Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Address</h3>
            
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.organization_address?.street || ''}
                onChange={(e) => handleInputChange('organization_address.street', e.target.value)}
                placeholder="Enter street address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.organization_address?.city || ''}
                  onChange={(e) => handleInputChange('organization_address.city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.organization_address?.state || ''}
                  onChange={(e) => handleInputChange('organization_address.state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              
              <div>
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={formData.organization_address?.zip_code || ''}
                  onChange={(e) => handleInputChange('organization_address.zip_code', e.target.value)}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.organization_address?.country || ''}
                onChange={(e) => handleInputChange('organization_address.country', e.target.value)}
                placeholder="Enter country"
              />
            </div>
          </div>

          {/* Primary Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Primary Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contact_fname">First Name *</Label>
                <Input
                  id="contact_fname"
                  value={formData.organization_primary_contact_fname || ''}
                  onChange={(e) => handleInputChange('organization_primary_contact_fname', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contact_mname">Middle Name</Label>
                <Input
                  id="contact_mname"
                  value={formData.organization_primary_contact_mname || ''}
                  onChange={(e) => handleInputChange('organization_primary_contact_mname', e.target.value)}
                  placeholder="Enter middle name"
                />
              </div>
              
              <div>
                <Label htmlFor="contact_lname">Last Name *</Label>
                <Input
                  id="contact_lname"
                  value={formData.organization_primary_contact_lname || ''}
                  onChange={(e) => handleInputChange('organization_primary_contact_lname', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.organization_primary_contact_email || ''}
                  onChange={(e) => handleInputChange('organization_primary_contact_email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Phone Number *</Label>
                <Input
                  id="contact_phone"
                  value={formData.organization_primary_contact_phone_number || ''}
                  onChange={(e) => handleInputChange('organization_primary_contact_phone_number', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Organization'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrganizationModal;

'use client';
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (organization: OrganizationFormData) => void;
}

const AddOrganizationModal: React.FC<AddOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<OrganizationFormData>({
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof OrganizationFormData] as any),
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
    
    // Basic validation
    if (!formData.organization_name.trim()) {
      toast.error('Organization name is required');
      return;
    }
    
    if (!formData.organization_primary_contact_fname.trim() || 
        !formData.organization_primary_contact_lname.trim()) {
      toast.error('Primary contact first and last name are required');
      return;
    }
    
    if (!formData.organization_primary_contact_email.trim()) {
      toast.error('Primary contact email is required');
      return;
    }
    
    if (!formData.organization_primary_contact_phone_number.trim()) {
      toast.error('Primary contact phone number is required');
      return;
    }
    
    if (!formData.organization_prefix.trim()) {
      toast.error('Organization prefix is required');
      return;
    }

    console.log('Submitting organization data:', formData);
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      console.log('Organization submitted successfully');
      // Reset form
      setFormData({
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
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">Adding Organization...</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add New Organization</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                setFormData({
                  organization_name: 'Test Organization Inc.',
                  organization_address: {
                    street: '123 Test Street',
                    city: 'Test City',
                    state: 'TS',
                    zip_code: '12345',
                    country: 'Test Country',
                  },
                  organization_primary_contact_fname: 'John',
                  organization_primary_contact_mname: 'A',
                  organization_primary_contact_lname: 'Doe',
                  organization_primary_contact_phone_number: '+1234567890',
                  organization_primary_contact_email: 'john.doe@testorg.com',
                  organization_prefix: 'TST',
                });
              }}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              🧪 Populate Test Data
            </Button>
          </div>

          {/* Organization Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organization_name">Organization Name *</Label>
                <Input
                  id="organization_name"
                  value={formData.organization_name}
                  onChange={(e) => handleInputChange('organization_name', e.target.value)}
                  placeholder="Enter organization name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="organization_prefix">Organization Prefix *</Label>
                <Input
                  id="organization_prefix"
                  value={formData.organization_prefix}
                  onChange={(e) => handleInputChange('organization_prefix', e.target.value)}
                  placeholder="e.g., ABC, XYZ"
                  required
                  disabled={isSubmitting}
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
                value={formData.organization_address.street}
                onChange={(e) => handleInputChange('organization_address.street', e.target.value)}
                placeholder="Enter street address"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.organization_address.city}
                  onChange={(e) => handleInputChange('organization_address.city', e.target.value)}
                  placeholder="Enter city"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.organization_address.state}
                  onChange={(e) => handleInputChange('organization_address.state', e.target.value)}
                  placeholder="Enter state"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={formData.organization_address.zip_code}
                  onChange={(e) => handleInputChange('organization_address.zip_code', e.target.value)}
                  placeholder="Enter ZIP code"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.organization_address.country}
                onChange={(e) => handleInputChange('organization_address.country', e.target.value)}
                placeholder="Enter country"
                disabled={isSubmitting}
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
                  value={formData.organization_primary_contact_fname}
                  onChange={(e) => handleInputChange('organization_primary_contact_fname', e.target.value)}
                  placeholder="Enter first name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="contact_mname">Middle Name</Label>
                <Input
                  id="contact_mname"
                  value={formData.organization_primary_contact_mname}
                  onChange={(e) => handleInputChange('organization_primary_contact_mname', e.target.value)}
                  placeholder="Enter middle name"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="contact_lname">Last Name *</Label>
                <Input
                  id="contact_lname"
                  value={formData.organization_primary_contact_lname}
                  onChange={(e) => handleInputChange('organization_primary_contact_lname', e.target.value)}
                  placeholder="Enter last name"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.organization_primary_contact_email}
                  onChange={(e) => handleInputChange('organization_primary_contact_email', e.target.value)}
                  placeholder="Enter email address"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Phone Number *</Label>
                <Input
                  id="contact_phone"
                  value={formData.organization_primary_contact_phone_number}
                  onChange={(e) => handleInputChange('organization_primary_contact_phone_number', e.target.value)}
                  placeholder="Enter phone number"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Organization...
                </>
              ) : (
                'Add Organization'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrganizationModal;

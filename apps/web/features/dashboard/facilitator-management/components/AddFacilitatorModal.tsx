'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCreateFacilitatorWithMultipleFacilities } from '@/lib/hooks/facilitators';
import { Facilitator, Facility } from '../types';
import { RefreshCw, Copy, Check } from 'lucide-react';
import Select from 'react-select';

interface AddFacilitatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facilitator: Facilitator) => void;
  facilities: Facility[];
}

interface FacilityOption {
  value: string;
  label: string;
}

const AddFacilitatorModal: React.FC<AddFacilitatorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  facilities,
}) => {
  const [formData, setFormData] = useState({
    facility_ids: [] as string[],
    facilitator_first_name: '',
    facilitator_last_name: '',
    facilitator_email: '',
    facilitator_phone_number: '',
    password: '',
  });
  const [copied, setCopied] = useState(false);

  const { mutate: createFacilitator } = useCreateFacilitatorWithMultipleFacilities();

  // Convert facilities to react-select options
  const facilityOptions: FacilityOption[] = facilities.map(facility => ({
    value: facility.facility_id,
    label: facility.facility_name,
  }));

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
  };

  const copyPassword = async () => {
    if (formData.password) {
      try {
        await navigator.clipboard.writeText(formData.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Password copied to clipboard');
      } catch (err) {
        toast.error('Failed to copy password');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.facility_ids.length) {
      toast.error('Please select at least one facility');
      return;
    }
    
    if (!formData.facilitator_first_name || !formData.facilitator_last_name) {
      toast.error('Please fill in both first and last name');
      return;
    }
    
    if (!formData.facilitator_email) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!formData.facilitator_phone_number) {
      toast.error('Please enter a phone number');
      return;
    }
    
    if (!formData.password) {
      toast.error('Please enter a password');
      return;
    }
    
    // Create facilitator with multiple facilities
    const facilitatorData = {
      facilitator_first_name: formData.facilitator_first_name,
      facilitator_last_name: formData.facilitator_last_name,
      facilitator_full_name: `${formData.facilitator_first_name} ${formData.facilitator_last_name}`.trim(),
      facilitator_email: formData.facilitator_email,
      facilitator_phone_number: formData.facilitator_phone_number,
      facilitator_status: 'active',
      password: formData.password,
      deleted: false,
      facility_ids: formData.facility_ids,
    };
    
    createFacilitator(facilitatorData, {
      onSuccess: (result) => {
        toast.success(`Facilitator added successfully to ${formData.facility_ids.length} facility(ies)`);
        // Reset form and close modal
        setFormData({
          facility_ids: [],
          facilitator_first_name: '',
          facilitator_last_name: '',
          facilitator_email: '',
          facilitator_phone_number: '',
          password: '',
        });
        onSubmit(result.facilitator); // Call the onSubmit callback to trigger refresh
        onClose();
      },
      onError: (error) => {
        toast.error('Failed to add facilitator');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Facilitator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="facilities">Facilities *</Label>
              <Select
                isMulti
                options={facilityOptions}
                value={facilityOptions.filter(option => 
                  formData.facility_ids.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                  setFormData({ ...formData, facility_ids: selectedValues });
                }}
                placeholder="Select facilities..."
                className={!formData.facility_ids.length ? "border-red-500" : ""}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    borderColor: !formData.facility_ids.length ? '#ef4444' : provided.borderColor,
                    '&:hover': {
                      borderColor: !formData.facility_ids.length ? '#ef4444' : provided.borderColor,
                    }
                  })
                }}
              />
              {!formData.facility_ids.length && (
                <p className="text-sm text-red-500 mt-1">Please select at least one facility</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.facilitator_first_name}
                onChange={(e) => setFormData({ ...formData, facilitator_first_name: e.target.value })}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.facilitator_last_name}
                onChange={(e) => setFormData({ ...formData, facilitator_last_name: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.facilitator_email}
                onChange={(e) => setFormData({ ...formData, facilitator_email: e.target.value })}
                placeholder="Email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.facilitator_phone_number}
                onChange={(e) => setFormData({ ...formData, facilitator_phone_number: e.target.value })}
                placeholder="+1-555-0123"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password (min 8 characters)"
                  required
                  minLength={8}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generatePassword}
                  title="Generate secure password"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyPassword}
                  disabled={!formData.password}
                  title="Copy password to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Facilitator</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFacilitatorModal; 
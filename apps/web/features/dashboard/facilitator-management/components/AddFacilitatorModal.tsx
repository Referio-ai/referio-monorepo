'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCreateFacilitatorWithMultipleFacilities } from '@/lib/hooks/facilitators';
import { Facilitator, Facility } from '../types';
import { RefreshCw, Copy, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
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

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8, met: false },
    { id: 'uppercase', label: 'At least 1 uppercase letter', test: (p) => /[A-Z]/.test(p), met: false },
    { id: 'lowercase', label: 'At least 1 lowercase letter', test: (p) => /[a-z]/.test(p), met: false },
    { id: 'number', label: 'At least 1 number', test: (p) => /\d/.test(p), met: false },
    { id: 'special', label: 'At least 1 special character (!@#$%^&*)', test: (p) => /[!@#$%^&*]/.test(p), met: false },
  ]);

  const { mutate: createFacilitator } = useCreateFacilitatorWithMultipleFacilities();

  // Convert facilities to react-select options
  const facilityOptions: FacilityOption[] = facilities.map(facility => ({
    value: facility.facility_id,
    label: facility.facility_name,
  }));

  // Update password requirements when password changes
  const updatePasswordRequirements = (password: string) => {
    setPasswordRequirements(prev => 
      prev.map(req => ({
        ...req,
        met: req.test(password)
      }))
    );
  };

  // Phone number formatting function
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const trimmed = phoneNumber.slice(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (trimmed.length === 0) return '';
    if (trimmed.length <= 3) return `(${trimmed}`;
    if (trimmed.length <= 6) return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
    return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
  };

  // Handle phone number input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, facilitator_phone_number: formatted });
  };

  // Extract only digits for submission
  const getCleanPhoneNumber = (formattedPhone: string): string => {
    return formattedPhone.replace(/\D/g, '');
  };

  // Enhanced password generation with all requirements
  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    
    let password = '';
    
    // Ensure at least one character from each requirement
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));
    
    // Fill the rest with random characters from all sets
    const allChars = lowercase + uppercase + numbers + special;
    for (let i = 4; i < 16; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData({ ...formData, password });
    updatePasswordRequirements(password);
    setShowPassword(true); // Show the generated password
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

  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    updatePasswordRequirements(password);
  };

  // Check if all password requirements are met
  const isPasswordValid = passwordRequirements.every(req => req.met);

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

    if (!isPasswordValid) {
      toast.error('Please ensure your password meets all requirements');
      return;
    }
    
    // Create facilitator with multiple facilities
    const facilitatorData = {
      facilitator_first_name: formData.facilitator_first_name,
      facilitator_last_name: formData.facilitator_last_name,
      facilitator_full_name: `${formData.facilitator_first_name} ${formData.facilitator_last_name}`.trim(),
      facilitator_email: formData.facilitator_email,
      facilitator_phone_number: getCleanPhoneNumber(formData.facilitator_phone_number),
      facilitator_status: 'active',
      password: formData.password,
      deleted: false,
      facility_ids: formData.facility_ids,
    };
    
    createFacilitator(facilitatorData, {
      onSuccess: (result) => {
        toast.success(`User added successfully to ${formData.facility_ids.length} facility(ies)`);
        // Reset form and close modal
        setFormData({
          facility_ids: [],
          facilitator_first_name: '',
          facilitator_last_name: '',
          facilitator_email: '',
          facilitator_phone_number: '',
          password: '',
        });
        setPasswordRequirements(prev => prev.map(req => ({ ...req, met: false })));
        setShowPassword(false);
        onSubmit(result.facilitator); // Call the onSubmit callback to trigger refresh
        onClose();
      },
      onError: (error) => {
        toast.error('Failed to add user');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
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
                onChange={handlePhoneChange}
                placeholder="(510) 555-5555"
                required
                maxLength={14}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    placeholder="Enter password"
                    required
                    className={`pr-20 ${!isPasswordValid && formData.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
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
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Password Requirements</span>
                  </div>
                  <div className="space-y-1">
                    {passwordRequirements.map((requirement) => (
                      <div key={requirement.id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${requirement.met ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span className={`text-sm ${requirement.met ? 'text-green-700' : 'text-red-600'}`}>
                          {requirement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {isPasswordValid && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm text-green-700 font-medium">
                        ✓ Password meets all requirements
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isPasswordValid}>Add User</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFacilitatorModal; 
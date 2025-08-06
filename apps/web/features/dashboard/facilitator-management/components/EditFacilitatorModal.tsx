'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useUpdateFacilitator, useChangeFacilitatorPassword, useUpdateFacilitatorWithMultipleFacilities, useGetUserFacilitiesByFacilitatorId } from '@/lib/hooks/facilitators';
import { Facilitator, Facility } from '../types';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Select from 'react-select';

interface EditFacilitatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facilitator: Facilitator) => void;
  facilitator: Facilitator;
  facilities: Facility[];
}

const EditFacilitatorModal: React.FC<EditFacilitatorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  facilitator,
  facilities,
}) => {
  // Split the full name into first and last name
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  const { firstName: initialFirstName, lastName: initialLastName } = splitName(facilitator.facilitator_full_name);

  const [formData, setFormData] = useState({
    facility_id: facilitator.facility_id,
    facility_ids: [] as string[],
    propelauth_user_id: facilitator.propelauth_user_id,
    facilitator_first_name: initialFirstName,
    facilitator_last_name: initialLastName,
    facilitator_email: facilitator.facilitator_email,
    facilitator_phone_number: facilitator.facilitator_phone_number,
    facilitator_status: facilitator.facilitator_status,
  });

  const [passwordData, setPasswordData] = useState({
    new_password: '',
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: updateFacilitator, isPending } = useUpdateFacilitator();
  const { mutate: updateFacilitatorWithMultipleFacilities, isPending: isUpdatingMultiple } = useUpdateFacilitatorWithMultipleFacilities();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangeFacilitatorPassword();
  const { data: userFacilities, isLoading: isLoadingUserFacilities } = useGetUserFacilitiesByFacilitatorId(facilitator.facilitator_id);

  // Update form data when facilitator prop changes
  useEffect(() => {
    const { firstName, lastName } = splitName(facilitator.facilitator_full_name);
    setFormData({
      facility_id: facilitator.facility_id,
      facility_ids: [], // Will be populated from user_facilities
      propelauth_user_id: facilitator.propelauth_user_id,
      facilitator_first_name: firstName,
      facilitator_last_name: lastName,
      facilitator_email: facilitator.facilitator_email,
      facilitator_phone_number: facilitator.facilitator_phone_number,
      facilitator_status: facilitator.facilitator_status,
    });
  }, [facilitator]);

  // Update facility_ids when userFacilities data is loaded
  useEffect(() => {
    if (userFacilities && userFacilities.length > 0) {
      const facilityIds = userFacilities.map(uf => uf.facility_id);
      setFormData(prev => ({
        ...prev,
        facility_ids: facilityIds
      }));
    }
  }, [userFacilities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include fields that have changed
    const updateData: any = {};
    if (formData.propelauth_user_id !== facilitator.propelauth_user_id) updateData.propelauth_user_id = formData.propelauth_user_id;
    
    // Check if first name or last name has changed
    const currentFullName = facilitator.facilitator_full_name;
    const newFullName = `${formData.facilitator_first_name} ${formData.facilitator_last_name}`.trim();
    if (newFullName !== currentFullName) {
      updateData.facilitator_first_name = formData.facilitator_first_name;
      updateData.facilitator_last_name = formData.facilitator_last_name;
      updateData.facilitator_full_name = newFullName;
    }
    
    if (formData.facilitator_email !== facilitator.facilitator_email) updateData.facilitator_email = formData.facilitator_email;
    if (formData.facilitator_phone_number !== facilitator.facilitator_phone_number) updateData.facilitator_phone_number = formData.facilitator_phone_number;
    if (formData.facilitator_status !== facilitator.facilitator_status) updateData.facilitator_status = formData.facilitator_status;
    
    // Add facility_ids if they have changed
    const currentFacilityIds = userFacilities?.map(uf => uf.facility_id) || [];
    if (JSON.stringify(formData.facility_ids) !== JSON.stringify(currentFacilityIds)) {
      updateData.facility_ids = formData.facility_ids;
    }

    // If no changes, just close the modal
    if (Object.keys(updateData).length === 0 && !showPasswordFields) {
      onClose();
      return;
    }

    updateFacilitatorWithMultipleFacilities(
      { 
        facilitatorId: facilitator.facilitator_id, 
        facilitator: updateData 
      },
      {
        onSuccess: () => {
          toast.success('Facilitator updated successfully');
          // Call onSubmit to notify parent component and trigger refresh
          onSubmit(facilitator);
          onClose();
        },
        onError: (error) => {
          toast.error('Failed to update facilitator');
          console.error('Update error:', error);
        }
      }
    );
  };

  const handlePasswordChange = () => {
    // Validate password field
    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    changePassword(
      {
        facilitatorId: facilitator.facilitator_id,
        newPassword: passwordData.new_password,
      },
      {
        onSuccess: () => {
          toast.success('Password changed successfully');
          setPasswordData({
            new_password: '',
          });
          setShowPasswordFields(false);
        },
        onError: (error) => {
          toast.error('Failed to change password');
          console.error('Password change error:', error);
        }
      }
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Facilitator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="gap-4">
            <div>
              <Label htmlFor="facility">Facilities *</Label>
              <Select
                isMulti
                value={formData.facility_ids?.map(id => ({ value: id, label: facilities.find(f => f.facility_id === id)?.facility_name || id })) || []}
                onChange={(selectedOptions) => {
                  const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                  setFormData({ ...formData, facility_ids: selectedIds });
                }}
                options={facilities.map(facility => ({ value: facility.facility_id, label: facility.facility_name }))}
                placeholder={isLoadingUserFacilities ? "Loading facilities..." : "Select facilities..."}
                className="w-full"
                classNamePrefix="react-select"
                isLoading={isLoadingUserFacilities}
                isDisabled={isLoadingUserFacilities}
              />
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
              <Label htmlFor="status">Status</Label>
              <UISelect value={formData.facilitator_status} onValueChange={(value) => setFormData({ ...formData, facilitator_status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </UISelect>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">Change Password</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
              >
                {showPasswordFields ? 'Cancel' : 'Change Password'}
              </Button>
            </div>

            {showPasswordFields && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={!passwordData.new_password || isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating Password...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending || isUpdatingMultiple}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isUpdatingMultiple}>
              {isPending || isUpdatingMultiple ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Facilitator'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFacilitatorModal; 
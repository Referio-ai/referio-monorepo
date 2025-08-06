import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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

interface EditFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: Facility | null;
  onSubmit: (facilityId: string, facility: Partial<Facility>) => void;
  isLoading?: boolean;
}

const validationSchema = Yup.object({
  facility_name: Yup.string().required('Facility name is required'),
  facility_address: Yup.object({
    street: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zip_code: Yup.string()
      .required('ZIP code is required')
      .matches(/^\d{5}(-\d{4})?$/, 'ZIP code must be in valid format (e.g., 12345 or 12345-6789)'),
    country: Yup.string().required('Country is required'),
  }),
  facility_primary_contact_fname: Yup.string().required('First name is required'),
  facility_primary_contact_mname: Yup.string(),
  facility_primary_contact_lname: Yup.string().required('Last name is required'),
  facility_primary_contact_phone_number: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?1?\d{10,15}$/, 'Phone number must be valid'),
  facility_primary_contact_email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const EditFacilityModal: React.FC<EditFacilityModalProps> = ({
  isOpen,
  onClose,
  facility,
  onSubmit,
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues: {
      facility_name: facility?.facility_name || '',
      facility_address: {
        street: facility?.facility_address.street || '',
        city: facility?.facility_address.city || '',
        state: facility?.facility_address.state || '',
        zip_code: facility?.facility_address.zip_code || '',
        country: facility?.facility_address.country || 'USA',
      },
      facility_primary_contact_fname: facility?.facility_primary_contact_fname || '',
      facility_primary_contact_mname: facility?.facility_primary_contact_mname || '',
      facility_primary_contact_lname: facility?.facility_primary_contact_lname || '',
      facility_primary_contact_phone_number: facility?.facility_primary_contact_phone_number || '',
      facility_primary_contact_email: facility?.facility_primary_contact_email || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!facility) return;
      
      const updatedFacility: Partial<Facility> = {
        facility_name: values.facility_name,
        facility_address: values.facility_address,
        facility_primary_contact_fname: values.facility_primary_contact_fname,
        facility_primary_contact_mname: values.facility_primary_contact_mname,
        facility_primary_contact_lname: values.facility_primary_contact_lname,
        facility_primary_contact_phone_number: values.facility_primary_contact_phone_number,
        facility_primary_contact_email: values.facility_primary_contact_email,
      };
      
      onSubmit(facility.facility_id, updatedFacility);
      formik.resetForm();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  if (!facility) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] p-10 h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Facility</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="facility_name">Facility Name</Label>
            <Input
              id="facility_name"
              {...formik.getFieldProps('facility_name')}
              placeholder="Enter facility name"
              disabled={isLoading}
            />
            {formik.touched.facility_name && formik.errors.facility_name && (
              <div className="text-sm text-red-500">{formik.errors.facility_name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              {...formik.getFieldProps('facility_address.street')}
              placeholder="Enter street address"
              disabled={isLoading}
            />
            {formik.touched.facility_address?.street && formik.errors.facility_address?.street && (
              <div className="text-sm text-red-500">{formik.errors.facility_address.street}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...formik.getFieldProps('facility_address.city')}
                placeholder="Enter city"
                disabled={isLoading}
              />
              {formik.touched.facility_address?.city && formik.errors.facility_address?.city && (
                <div className="text-sm text-red-500">{formik.errors.facility_address.city}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...formik.getFieldProps('facility_address.state')}
                placeholder="Enter state"
                disabled={isLoading}
              />
              {formik.touched.facility_address?.state && formik.errors.facility_address?.state && (
                <div className="text-sm text-red-500">{formik.errors.facility_address.state}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                {...formik.getFieldProps('facility_address.zip_code')}
                placeholder="Enter ZIP code"
                disabled={isLoading}
              />
              {formik.touched.facility_address?.zip_code && formik.errors.facility_address?.zip_code && (
                <div className="text-sm text-red-500">{formik.errors.facility_address.zip_code}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...formik.getFieldProps('facility_address.country')}
                placeholder="Enter country"
                disabled={isLoading}
              />
              {formik.touched.facility_address?.country && formik.errors.facility_address?.country && (
                <div className="text-sm text-red-500">{formik.errors.facility_address.country}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facility_primary_contact_fname">Contact First Name</Label>
              <Input
                id="facility_primary_contact_fname"
                {...formik.getFieldProps('facility_primary_contact_fname')}
                placeholder="Enter first name"
                disabled={isLoading}
              />
              {formik.touched.facility_primary_contact_fname && formik.errors.facility_primary_contact_fname && (
                <div className="text-sm text-red-500">{formik.errors.facility_primary_contact_fname}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="facility_primary_contact_mname">Contact Middle Name</Label>
              <Input
                id="facility_primary_contact_mname"
                {...formik.getFieldProps('facility_primary_contact_mname')}
                placeholder="Enter middle name"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility_primary_contact_lname">Contact Last Name</Label>
            <Input
              id="facility_primary_contact_lname"
              {...formik.getFieldProps('facility_primary_contact_lname')}
              placeholder="Enter last name"
              disabled={isLoading}
            />
            {formik.touched.facility_primary_contact_lname && formik.errors.facility_primary_contact_lname && (
              <div className="text-sm text-red-500">{formik.errors.facility_primary_contact_lname}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facility_primary_contact_phone_number">Contact Phone</Label>
              <Input
                id="facility_primary_contact_phone_number"
                {...formik.getFieldProps('facility_primary_contact_phone_number')}
                placeholder="Enter phone number"
                disabled={isLoading}
              />
              {formik.touched.facility_primary_contact_phone_number && formik.errors.facility_primary_contact_phone_number && (
                <div className="text-sm text-red-500">{formik.errors.facility_primary_contact_phone_number}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="facility_primary_contact_email">Contact Email</Label>
              <Input
                id="facility_primary_contact_email"
                type="email"
                {...formik.getFieldProps('facility_primary_contact_email')}
                placeholder="Enter email"
                disabled={isLoading}
              />
              {formik.touched.facility_primary_contact_email && formik.errors.facility_primary_contact_email && (
                <div className="text-sm text-red-500">{formik.errors.facility_primary_contact_email}</div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={formik.isSubmitting || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Facility'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFacilityModal; 
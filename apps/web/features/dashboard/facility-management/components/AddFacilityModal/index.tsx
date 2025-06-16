import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useOrganizations } from '@/lib/hooks/organizations';

interface Organization {
  organization_id: string;
  organization_name: string;
}

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

interface AddFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  onSubmit: (facility: Facility) => void;
}

const validationSchema = Yup.object({
  organization_id: Yup.string().required('Organization is required'),
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

const AddFacilityModal: React.FC<AddFacilityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {

  const { data: organizations, isLoading } = useOrganizations();


  const generateTestData = () => {

    const testData = {
      organization_id: organizations?.length && organizations.length > 0 ? organizations[0].organization_id : '',
      facility_name: 'Test Medical Center',
      facility_address: {
        street: '123 Healthcare Ave',
        city: 'Medical City',
        state: 'CA',
        zip_code: '90210',
        country: 'USA',
      },
      facility_primary_contact_fname: 'John',
      facility_primary_contact_mname: 'Q',
      facility_primary_contact_lname: 'Smith',
      facility_primary_contact_phone_number: '+14155552671',
      facility_primary_contact_email: 'john.smith@testmedical.com',
    };
    formik.setValues(testData);
  };

  const formik = useFormik({
    initialValues: {
      organization_id: '',
      facility_name: '',
      facility_address: {
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'USA',
      },
      facility_primary_contact_fname: '',
      facility_primary_contact_mname: '',
      facility_primary_contact_lname: '',
      facility_primary_contact_phone_number: '',
      facility_primary_contact_email: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const facility: Facility = {
        facility_id: crypto.randomUUID(),
        organization_id: values.organization_id,
        facility_name: values.facility_name,
        facility_address: values.facility_address,
        facility_primary_contact_fname: values.facility_primary_contact_fname,
        facility_primary_contact_mname: values.facility_primary_contact_mname,
        facility_primary_contact_lname: values.facility_primary_contact_lname,
        facility_primary_contact_phone_number: values.facility_primary_contact_phone_number,
        facility_primary_contact_email: values.facility_primary_contact_email,
        propelauth_facility_id: crypto.randomUUID(),
      };
      onSubmit(facility);
      formik.resetForm();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] p-10 h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Facility</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="organization_id">Organization</Label>
            <Select
              value={formik.values.organization_id}
              onValueChange={(value) => formik.setFieldValue('organization_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading">Loading...</SelectItem>
                ) : organizations?.map((org) => (
                  <SelectItem key={org.organization_id} value={org.organization_id}>
                    {org.organization_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.organization_id && formik.errors.organization_id && (
              <div className="text-sm text-red-500">{formik.errors.organization_id}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility_name">Facility Name</Label>
            <Input
              id="facility_name"
              {...formik.getFieldProps('facility_name')}
              placeholder="Enter facility name"
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility_primary_contact_lname">Contact Last Name</Label>
            <Input
              id="facility_primary_contact_lname"
              {...formik.getFieldProps('facility_primary_contact_lname')}
              placeholder="Enter last name"
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
              />
              {formik.touched.facility_primary_contact_email && formik.errors.facility_primary_contact_email && (
                <div className="text-sm text-red-500">{formik.errors.facility_primary_contact_email}</div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={generateTestData}
              className="mr-auto"
            >
              Fill Test Data
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Adding...' : 'Add Facility'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFacilityModal; 
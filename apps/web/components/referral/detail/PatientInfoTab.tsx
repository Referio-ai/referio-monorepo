import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Paperclip, FileText, Eye, Edit, Save, X } from 'lucide-react';
import { Referral } from '@/constants/referral';
import Image from 'next/image';
import { ImageModal } from '@/components/ImageModal';
import { format } from 'date-fns';
import { useGetPatientById, useUpdatePatient } from '@/lib/hooks/patients';
import { PatientUpdate } from '@/lib/api/client/models/PatientUpdate';
import { toast } from 'sonner';

interface PatientInfoTabProps {
  referral: Referral;
  onUploadFiles?: (files: File[]) => void;
  onUpdateDemographics?: (demographics: any) => void;
}

interface DemographicsData {
  patientName: string;
  age: string | number;
  dateOfBirth: string;
  phone: string;
  email: string;
  referredBy: string;
}

interface ValidationErrors {
  patientName?: string;
  age?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  referredBy?: string;
}

export const PatientInfoTab: React.FC<PatientInfoTabProps> = ({
  referral,
  onUploadFiles,
  onUpdateDemographics
}) => {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt: string;
    title: string;
  } | null>(null);

  const [isEditingDemographics, setIsEditingDemographics] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      return '';
    }
  };

  const [demographicsData, setDemographicsData] = useState<DemographicsData>(() => {
    return {
      patientName: referral.patientName || '',
      age: referral.age || '',
      dateOfBirth: formatDateForInput(referral.dateOfBirth || ''),
      phone: referral.phone || '',
      email: referral.patientName?.toLowerCase().replace(' ', '.') + '@email.com' || '',
      referredBy: referral.referredBy || ''
    };
  });

  // Validation functions
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return true; // Allow empty email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true; // Allow empty phone
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const validateAge = (age: string | number): boolean => {
    const ageNum = typeof age === 'string' ? parseInt(age) : age;
    return ageNum >= 0 && ageNum <= 120;
  };

  const validateDateOfBirth = (dateOfBirth: string): boolean => {
    if (!dateOfBirth) return true; // Allow empty DOB
    const date = new Date(dateOfBirth);
    const today = new Date();
    return date <= today && !isNaN(date.getTime());
  };

  const validatePatientName = (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100;
  };

  const validateField = (field: keyof DemographicsData, value: string): string | undefined => {
    switch (field) {
      case 'patientName':
        if (!validatePatientName(value)) {
          return 'Name must be between 2 and 100 characters';
        }
        break;
      case 'age':
        if (value && !validateAge(value)) {
          return 'Age must be between 0 and 120';
        }
        break;
      case 'dateOfBirth':
        if (value && !validateDateOfBirth(value)) {
          return 'Date of birth cannot be in the future';
        }
        break;
      case 'phone':
        if (value && !validatePhone(value)) {
          return 'Phone number must be between 10-15 digits';
        }
        break;
      case 'email':
        if (value && !validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'referredBy':
        if (value && value.trim().length < 2) {
          return 'Referring doctor name must be at least 2 characters';
        }
        break;
    }
    return undefined;
  };

  const validateAllFields = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    Object.keys(demographicsData).forEach((key) => {
      const field = key as keyof DemographicsData;
      const value = demographicsData[field];
      const error = validateField(field, value as string);
      if (error) {
        errors[field] = error;
      }
    });

    return errors;
  };

  // Calculate age from date of birth
  const calculatedAge = useMemo(() => {
    if (!demographicsData.dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(demographicsData.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }, [demographicsData.dateOfBirth]);

  // Calculate date of birth from age
  const calculateDOBFromAge = (age: number) => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return `${birthYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  // Get patient data if patient_id exists
  const { data: patientData } = useGetPatientById(referral.patientId || '');
  const updatePatientMutation = useUpdatePatient();

  const handleImageClick = (url: string, alt: string, title: string) => {
    setSelectedImage({ url, alt, title });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  const handleEditDemographics = () => {
    // Clear any existing validation errors
    setValidationErrors({});
    
    // Ensure dateOfBirth is properly formatted for the date input
    const formattedDOB = formatDateForInput(demographicsData.dateOfBirth);
    if (formattedDOB !== demographicsData.dateOfBirth) {
      setDemographicsData(prev => ({
        ...prev,
        dateOfBirth: formattedDOB
      }));
    }
    setIsEditingDemographics(true);
  };

  const handleSaveDemographics = async () => {
    // Validate all fields before saving
    const errors = validateAllFields();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix the validation errors before saving');
      return;
    }

    console.log('Saving demographics');
    console.log(referral);
    
    if (referral.patientId) {
      // Prepare update data
      const updateData: PatientUpdate = {
        patient_fname: demographicsData.patientName.split(' ')[0] || '',
        patient_lname: demographicsData.patientName.split(' ').slice(1).join(' ') || '',
        patient_dob: demographicsData.dateOfBirth,
        patient_contact_phone: demographicsData.phone,
        patient_contact_email: demographicsData.email,
      };

      try {
        const updatedPatient = await updatePatientMutation.mutateAsync({
          patientId: referral.patientId,
          patient: updateData
        });
        
        // Update local state with the fresh data from the API response
        if (updatedPatient) {
          const fullName = `${updatedPatient.patient_fname || ''} ${updatedPatient.patient_lname || ''}`.trim();
          const calculatedAge = (() => {
            if (!updatedPatient.patient_dob) return '';
            const today = new Date();
            const birthDate = new Date(updatedPatient.patient_dob);
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              return age - 1;
            }
            return age;
          })();

          setDemographicsData({
            patientName: fullName,
            age: calculatedAge.toString(),
            dateOfBirth: formatDateForInput(updatedPatient.patient_dob || ''),
            phone: updatedPatient.patient_contact_phone || '',
            email: updatedPatient.patient_contact_email || '',
            referredBy: referral.referredBy || ''
          });
        }
        
        // Call the parent callback if provided
        if (onUpdateDemographics) {
          onUpdateDemographics(demographicsData);
        }
        
        setIsEditingDemographics(false);
        setValidationErrors({});
        toast.success('Patient information updated successfully');
      } catch (error) {
        console.error('Failed to update patient:', error);
        toast.error('Failed to update patient information');
        // Error handling is done in the mutation hook
      }
    } else {
      // If no patient ID, just call the parent callback
      if (onUpdateDemographics) {
        onUpdateDemographics(demographicsData);
      }
      setIsEditingDemographics(false);
      setValidationErrors({});
      toast.success('Demographics updated successfully');
    }
  };

  const handleCancelEdit = () => {
    // Reset to original referral data with proper date formatting
    setDemographicsData({
      patientName: referral.patientName || '',
      age: referral.age || '',
      dateOfBirth: formatDateForInput(referral.dateOfBirth || ''),
      phone: referral.phone || '',
      email: referral.patientName?.toLowerCase().replace(' ', '.') + '@email.com' || '',
      referredBy: referral.referredBy || ''
    });
    setIsEditingDemographics(false);
    setValidationErrors({});
  };

  const handleInputChange = (field: keyof DemographicsData, value: string) => {
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    if (field === 'age') {
      const ageValue = parseInt(value) || 0;
      const calculatedDOB = calculateDOBFromAge(ageValue);
      setDemographicsData(prev => ({
        ...prev,
        age: value,
        dateOfBirth: calculatedDOB
      }));
    } else if (field === 'dateOfBirth') {
      setDemographicsData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setDemographicsData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleInputBlur = (field: keyof DemographicsData, value: string) => {
    // Validate field on blur
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const insuranceDocument = referral?.documents?.find((document) => document.document_category === 'insurance_card');
  const xrayDocuments = referral?.documents?.filter((document) => document.document_category === 'xray_radiograph') || [];
  const hasXrayDocuments = xrayDocuments.length > 0;

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      {/* Demographics */}
      <Card className="h-fit">
        <CardHeader className="pb-3 lg:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-lg">Demographics</CardTitle>
            {!isEditingDemographics ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditDemographics}
                className="flex items-center gap-1 text-xs lg:text-sm"
              >
                <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveDemographics}
                  disabled={updatePatientMutation.isPending || hasValidationErrors}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs lg:text-sm"
                >
                  <Save className="h-3 w-3 lg:h-4 lg:w-4" />
                  {updatePatientMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={updatePatientMutation.isPending}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs lg:text-sm"
                >
                  <X className="h-3 w-3 lg:h-4 lg:w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <Label htmlFor="patientName" className="text-xs lg:text-sm font-medium text-gray-500">Name *</Label>
              {isEditingDemographics ? (
                <div>
                  <Input
                    id="patientName"
                    value={demographicsData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    onBlur={(e) => handleInputBlur('patientName', e.target.value)}
                    className={`mt-1 text-xs lg:text-sm ${validationErrors.patientName ? 'border-red-500' : ''}`}
                    placeholder="Enter patient name"
                  />
                  {validationErrors.patientName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.patientName}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900 text-sm lg:text-base mt-1">{demographicsData.patientName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="age" className="text-xs lg:text-sm font-medium text-gray-500">Age</Label>
              {isEditingDemographics ? (
                <div>
                  <Input
                    id="age"
                    type="number"
                    value={demographicsData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    onBlur={(e) => handleInputBlur('age', e.target.value)}
                    className={`mt-1 text-xs lg:text-sm ${validationErrors.age ? 'border-red-500' : ''}`}
                    min="0"
                    max="120"
                    placeholder="Enter age"
                  />
                  {validationErrors.age && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.age}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900 text-sm lg:text-base mt-1">{demographicsData.age}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="dateOfBirth" className="text-xs lg:text-sm font-medium text-gray-500">DOB</Label>
            {isEditingDemographics ? (
              <div>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={demographicsData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  onBlur={(e) => handleInputBlur('dateOfBirth', e.target.value)}
                  className={`mt-1 text-xs lg:text-sm ${validationErrors.dateOfBirth ? 'border-red-500' : ''}`}
                />
                {validationErrors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-900 text-sm lg:text-base mt-1">{demographicsData.dateOfBirth ? formatDate(demographicsData.dateOfBirth) : ''}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <Label htmlFor="phone" className="text-xs lg:text-sm font-medium text-gray-500">Phone</Label>
              {isEditingDemographics ? (
                <div>
                  <Input
                    id="phone"
                    value={demographicsData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={(e) => handleInputBlur('phone', e.target.value)}
                    className={`mt-1 text-xs lg:text-sm ${validationErrors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter phone number"
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900 text-sm lg:text-base mt-1">{demographicsData.phone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-xs lg:text-sm font-medium text-gray-500">Email</Label>
              {isEditingDemographics ? (
                <div>
                  <Input
                    id="email"
                    type="email"
                    value={demographicsData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => handleInputBlur('email', e.target.value)}
                    className={`mt-1 text-xs lg:text-sm ${validationErrors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter email address"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900 text-sm lg:text-base mt-1">{demographicsData.email}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="referredBy" className="text-xs lg:text-sm font-medium text-gray-500">Referring Doctor</Label>
            {isEditingDemographics ? (
              <div>
                <Input
                  id="referredBy"
                  value={demographicsData.referredBy}
                  onChange={(e) => handleInputChange('referredBy', e.target.value)}
                  onBlur={(e) => handleInputBlur('referredBy', e.target.value)}
                  className={`mt-1 text-xs lg:text-sm ${validationErrors.referredBy ? 'border-red-500' : ''}`}
                  placeholder="Enter referring doctor name"
                />
                {validationErrors.referredBy && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.referredBy}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-900 text-sm lg:text-base mt-1">{demographicsData.referredBy}</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Referral Image */}
      <Card className="h-fit">
        <CardHeader className="pb-3 lg:pb-4">
          <CardTitle className="text-base lg:text-lg">Referral</CardTitle>
        </CardHeader>
        <CardContent>
          {referral?.documents?.[0]?.signed_url ? (
            <div className="relative w-full aspect-square max-w-sm mx-auto">
              <Image 
                src={referral.documents[0].signed_url} 
                alt="Referral Document" 
                fill
                className="object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(
                  referral.documents[0].signed_url, 
                  'Referral Document', 
                  'Referral'
                )}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 p-1 h-6 w-6 bg-black/50 text-white hover:bg-black/70"
                onClick={() => handleImageClick(
                  referral.documents[0].signed_url, 
                  'Referral Document', 
                  'Referral'
                )}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-gray-400 text-2xl mb-2">📄</div>
              <p className="text-gray-500 text-sm">No referral document</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Comments */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-3 lg:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-lg">Referral Comments</CardTitle>
            <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1 text-xs">
              <Paperclip className="h-3 w-3" />
              Attached
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-4">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500">Date Received</p>
              <p className="text-gray-900 text-sm lg:text-base">{formatDate(referral.dateReceived)}</p>
            </div>
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500">Reason</p>
              <p className="text-gray-900 text-sm lg:text-base">{referral.reason}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* X-Rays */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-3 lg:pb-4">
          <CardTitle className="text-base lg:text-lg">X-Rays</CardTitle>
        </CardHeader>
        <CardContent>
          {hasXrayDocuments ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {xrayDocuments.slice(0, 4).map((document, index) => (
                <div key={document.document_id} className="space-y-2">
                  <div 
                    className="bg-gray-100 h-24 sm:h-28 lg:h-32 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative overflow-hidden"
                    onClick={() => handleImageClick(
                      document.signed_url, 
                      `X-Ray ${index + 1}`, 
                      `X-Ray Document ${index + 1}`
                    )}
                  >
                    <Image 
                      src={document.signed_url} 
                      alt={`X-Ray ${index + 1}`} 
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 p-1 h-5 w-5 lg:h-6 lg:w-6 bg-black/50 text-white hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(
                          document.signed_url, 
                          `X-Ray ${index + 1}`, 
                          `X-Ray Document ${index + 1}`
                        );
                      }}
                    >
                      <Eye className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                    </Button>
                  </div>
                  <p className="text-xs lg:text-sm text-center font-medium">X-Ray {index + 1}</p>
                </div>
              ))}
              {xrayDocuments.length < 4 && (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-gray-200 h-24 sm:h-28 lg:h-32 rounded-lg flex flex-col items-center justify-center text-gray-400">
                    <div className="text-xl lg:text-2xl">+</div>
                    <p className="text-xs text-center">Upload Additional X-rays</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 sm:h-28 lg:h-32 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-gray-400 text-xl lg:text-2xl mb-2">📷</div>
              <p className="text-gray-500 text-sm">No X-rays provided</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Insurance Information */}
      <Card className="h-fit">
        <CardHeader className="pb-3 lg:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-lg">Insurance Information</CardTitle>
            {referral.hasInsurance && (
              <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          <div>
            <p className="text-xs lg:text-sm font-medium text-gray-500">Provider</p>
            <p className="text-gray-900 text-sm lg:text-base">{referral.insurance}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500">Member ID</p>
              <p className="text-gray-900 text-sm lg:text-base">{referral.memberId}</p>
            </div>
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500">Group #</p>
              <p className="text-gray-900 text-sm lg:text-base">GRP829457</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Document */}
      <Card className="h-fit">
        <CardHeader className="pb-3 lg:pb-4">
          <CardTitle className="text-base lg:text-lg">Insurance Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-xs lg:text-sm font-medium text-gray-500 mb-2">Insurance Document</p>
            {insuranceDocument?.signed_url ? (
              <div className="relative w-full aspect-square max-w-sm mx-auto">
                <Image 
                  src={insuranceDocument.signed_url} 
                  alt="Insurance Document" 
                  fill
                  className="object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageClick(
                    insuranceDocument.signed_url, 
                    'Insurance Document', 
                    'Insurance Card'
                  )}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 p-1 h-6 w-6 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => handleImageClick(
                    insuranceDocument.signed_url, 
                    'Insurance Document', 
                    'Insurance Card'
                  )}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No insurance document available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={closeImageModal}
          imageUrl={selectedImage.url}
          altText={selectedImage.alt}
          title={selectedImage.title}
        />
      )}
    </div>
  );
};

export default PatientInfoTab; 
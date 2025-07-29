'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, FileText, Shield, Image as ImageIcon, UploadCloud, CheckCircle, XCircle } from 'lucide-react';

import { Modal } from '@/components/Modal';
import { FileUpload } from '@/components/FileUpload'
import { ReferralFormUpload } from '@/components/ReferralFormUpload'
import { StartScreenStep } from '@/components/StartScreenStep'
import { ReviewSubmitStep } from '@/components/ReviewSubmitStep'
import { GiftCardStep } from '@/components/GiftCardStep'
import { AppHeader } from '@/components/AppHeader'
import { ProgressBar } from '@/components/ProgressBar'
import { NavigationFooter } from '@/components/NavigationFooter'
import { useReferralBySlug, useMarkReferralAsScanned, useUploadDocument, useUploadReferralFormAsync } from '@/lib/hooks/referrals';


import {
  TOTAL_UPLOAD_STEPS,
  DEMO_USER_ID,
  REFERRING_TO_OFFICE,
  REFERRING_FROM_OFFICE,
  ACCEPTED_FILE_TYPES,
  MODAL_MESSAGES,
  type ModalType,
  type GiftCardContactType,
  type ModalState
} from '@/constants';

// --- Type Definitions ---

interface ReferralApiResponse {
  referral_id: string;
  referral_outbound_facility_id: string;
  referral_inbound_facility_id: string;
  referral_outbound_date: string | null;
  referral_batch_prefix: string;
  referral_slug: string;
  patient_id: string | null;
  referral_scanned: boolean;
  referral_scanned_date: string | null;
  referral_submitted: boolean;
  referral_submitted_date: string | null;
  referral_status: string | null;
  deleted: boolean;
  outbound_facility_name: string;
  inbound_facility_name: string;
  patient_fname: string | null;
  patient_mname: string | null;
  patient_lname: string | null;
  patient_dob: string | null;
  patient_contact_phone: string | null;
  patient_contact_email: string | null;
  patient_gender: string | null;
  patient_insurance_member_id: string | null;
}

interface PatientInfo {
  firstNameInitial: string;
  lastNameInitial: string;
  birthYear: string;
}

interface OfficeInfo {
  name: string;
  address: string;
  phone: string;
}

interface UploadResult {
  fileName: string;
  success: boolean;
  error?: any;
  result?: any;
  canRetry?: boolean;
}

interface UploadProgress {
  total: number;
  completed: number;
  isUploading: boolean;
  results: UploadResult[];
  canCancel: boolean;
  isCancelled: boolean;
}

interface FileWithType extends File {
  documentType: string;
  documentCategory: string;
}

// --- Helper Functions ---
const generateId = () => crypto.randomUUID();

const mapReferralToPatientInfo = (referral: ReferralApiResponse): PatientInfo | null => {
  if (!referral.patient_fname || !referral.patient_lname || !referral.patient_dob) {
    return null;
  }

  const birthYear = new Date(referral.patient_dob).getFullYear().toString();
  return {
    firstNameInitial: referral.patient_fname.charAt(0).toUpperCase(),
    lastNameInitial: referral.patient_lname.charAt(0).toUpperCase(),
    birthYear
  };
};

const mapFacilityToOfficeInfo = (facilityName: string, defaultOffice: OfficeInfo): OfficeInfo => {
  // For now, use the facility name from API and default office info for address/phone
  // In the future, this could be enhanced to fetch full facility details
  return {
    name: facilityName,
    address: defaultOffice.address,
    phone: defaultOffice.phone
  };
};

// --- Main App Component ---
export const QRScan = (props: { params: { slug: string } }) => {

  const markReferralAsScannedMutation = useMarkReferralAsScanned();
  const uploadDocumentMutation = useUploadDocument();
  const uploadReferralFormAsyncMutation = useUploadReferralFormAsync();
  const cancelUploadRef = useRef(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [referralId, setReferralId] = useState<string | null>(null);
  const [userId] = useState<string>(DEMO_USER_ID);
  const [isAuthReady] = useState(true);

  const [referralFormFiles, setReferralFormFiles] = useState<File[]>([]);
  const [insuranceCardFiles, setInsuranceCardFiles] = useState<File[]>([]);
  const [xrayFiles, setXrayFiles] = useState<File[]>([]);
  const [otherDocsFiles, setOtherDocsFiles] = useState<File[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    total: 0,
    completed: 0,
    isUploading: false,
    results: [],
    canCancel: false,
    isCancelled: false
  });
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [giftCardRecipient, setGiftCardRecipient] = useState('');
  const [giftCardContactType, setGiftCardContactType] = useState<GiftCardContactType>('email');

  const [referringToOffice, setReferringToOffice] = useState<OfficeInfo>(REFERRING_TO_OFFICE);
  const [referringFromOffice, setReferringFromOffice] = useState<OfficeInfo>(REFERRING_FROM_OFFICE);
  const [scannedPatientInfo, setScannedPatientInfo] = useState<PatientInfo | null>(null);
  const [isPreviouslyScanned, setIsPreviouslyScanned] = useState(false);

  const { data: referral, isLoading: isReferralLoading, refetch: refetchReferral } = useReferralBySlug(props.params.slug);

  // Update component state when referral data is loaded
  useEffect(() => {
    if (referral) {
      markReferralAsScannedMutation.mutate({ slug: props.params.slug });
      const referralData = referral as ReferralApiResponse;

      // Set referral ID from API
      setReferralId(referralData.referral_id);

      // Map patient info if available
      const patientInfo = mapReferralToPatientInfo(referralData);
      if (patientInfo) {
        setScannedPatientInfo(patientInfo);
        setIsPreviouslyScanned(referralData.referral_scanned);
      }

      // Map facility info to office info
      if (referralData.inbound_facility_name) {
        setReferringToOffice(mapFacilityToOfficeInfo(referralData.inbound_facility_name, REFERRING_TO_OFFICE));
      }

      if (referralData.outbound_facility_name) {
        setReferringFromOffice(mapFacilityToOfficeInfo(referralData.outbound_facility_name, REFERRING_FROM_OFFICE));
      }
    }
  }, [referral]);

  // File validation function
  const validateFile = (file: File, documentType: string): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = {
      referral_form: ['image/*', 'application/pdf', '.doc', '.docx'],
      insurance_card: ['image/*', 'application/pdf'],
      xray_radiograph: ['image/*', 'application/pdf'],
      other_documentation: ['image/*', 'application/pdf', '.doc', '.docx', '.txt']
    };

    // Check file size
    if (file.size > maxSize) {
      return { isValid: false, error: `File size exceeds 10MB limit` };
    }

    // Check file type
    const allowedTypesForDoc = allowedTypes[documentType as keyof typeof allowedTypes] || allowedTypes.other_documentation;
    const isAllowedType = allowedTypesForDoc.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type);
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      return { isValid: false, error: `File type not allowed for ${documentType}` };
    }

    return { isValid: true };
  };

  const uploadFilesOneByOne = async (retryFailedOnly = false) => {
    if (!referralId) {
      throw new Error('No referral ID available');
    }

    // Prepare all files with their metadata
    let allFilesWithMetadata: FileWithType[];
    
    if (retryFailedOnly) {
      // Only retry failed files
      const failedFiles = uploadProgress.results
        .filter(result => !result.success && result.canRetry)
        .map(result => result.fileName);
      
      allFilesWithMetadata = [
        ...referralFormFiles.filter(file => failedFiles.includes(file.name)),
        ...insuranceCardFiles.filter(file => failedFiles.includes(file.name)),
        ...xrayFiles.filter(file => failedFiles.includes(file.name)),
        ...otherDocsFiles.filter(file => failedFiles.includes(file.name))
      ].map(file => {
        let documentType = 'other_documentation';
        if (referralFormFiles.includes(file)) documentType = 'referral_form';
        else if (insuranceCardFiles.includes(file)) documentType = 'insurance_card';
        else if (xrayFiles.includes(file)) documentType = 'xray_radiograph';
        
        return Object.assign(file, { 
          documentType, 
          documentCategory: documentType 
        });
      });
    } else {
      allFilesWithMetadata = [
        ...referralFormFiles.map(file => Object.assign(file, { 
          documentType: 'referral_form', 
          documentCategory: 'referral_form' 
        })),
        ...insuranceCardFiles.map(file => Object.assign(file, { 
          documentType: 'insurance_card', 
          documentCategory: 'insurance_card' 
        })),
        ...xrayFiles.map(file => Object.assign(file, { 
          documentType: 'xray_radiograph', 
          documentCategory: 'xray_radiograph' 
        })),
        ...otherDocsFiles.map(file => Object.assign(file, { 
          documentType: 'other_documentation', 
          documentCategory: 'other_documentation' 
        }))
      ];
    }

    // Validate all files before starting upload
    const validationResults = allFilesWithMetadata.map(file => ({
      file,
      validation: validateFile(file, file.documentType)
    }));

    const invalidFiles = validationResults.filter(result => !result.validation.isValid);
    if (invalidFiles.length > 0) {
      throw new Error(`Invalid files: ${invalidFiles.map(f => `${f.file.name} - ${f.validation.error}`).join(', ')}`);
    }

    // Reset cancel ref
    cancelUploadRef.current = false;

    // Initialize or update upload progress
    if (!retryFailedOnly) {
      setUploadProgress({
        total: allFilesWithMetadata.length,
        completed: 0,
        isUploading: true,
        results: [],
        canCancel: true,
        isCancelled: false
      });
    } else {
      setUploadProgress(prev => ({
        ...prev,
        isUploading: true,
        isCancelled: false,
        results: prev.results.map(result => 
          allFilesWithMetadata.some(file => file.name === result.fileName) 
            ? { ...result, canRetry: false } // Mark as being retried
            : result
        )
      }));
    }

    const results: UploadResult[] = retryFailedOnly ? [...uploadProgress.results] : [];

    // Upload files one by one
    for (let i = 0; i < allFilesWithMetadata.length; i++) {
      // Check if upload was cancelled
      if (cancelUploadRef.current) {
        console.log('Upload cancelled by user');
        setUploadProgress(prev => ({ ...prev, isCancelled: true }));
        break;
      }

      const fileWithMeta = allFilesWithMetadata[i];
      
      try {
        console.log(`Uploading file ${i + 1}/${allFilesWithMetadata.length}: ${fileWithMeta.name}`);
        
        const result = await uploadDocumentMutation.mutateAsync({
          referralId: referralId,
          formData: [fileWithMeta],
          documentType: fileWithMeta.documentType,
          documentCategory: fileWithMeta.documentCategory
        });
        
        const successResult: UploadResult = { 
          fileName: fileWithMeta.name, 
          success: true, 
          result,
          canRetry: false
        };
        
        if (retryFailedOnly) {
          // Update existing result
          const resultIndex = results.findIndex(r => r.fileName === fileWithMeta.name);
          if (resultIndex >= 0) {
            results[resultIndex] = successResult;
          }
        } else {
          results.push(successResult);
        }
        
        setUploadProgress(prev => ({
          ...prev,
          completed: retryFailedOnly ? prev.completed + 1 : i + 1,
          results: [...results]
        }));
        
        console.log(`Successfully uploaded: ${fileWithMeta.name}`);
        
      } catch (error) {
        const errorResult: UploadResult = { 
          fileName: fileWithMeta.name, 
          success: false, 
          error,
          canRetry: true
        };
        
        if (retryFailedOnly) {
          // Update existing result
          const resultIndex = results.findIndex(r => r.fileName === fileWithMeta.name);
          if (resultIndex >= 0) {
            results[resultIndex] = errorResult;
          }
        } else {
          results.push(errorResult);
        }
        
        setUploadProgress(prev => ({
          ...prev,
          completed: retryFailedOnly ? prev.completed : i + 1,
          results: [...results]
        }));
        
        console.error(`Failed to upload: ${fileWithMeta.name}`, error);
      }
    }

    setUploadProgress(prev => ({ 
      ...prev, 
      isUploading: false,
      canCancel: false
    }));
    return results;
  };

  const handleCancelUpload = () => {
    cancelUploadRef.current = true;
    setUploadProgress(prev => ({
      ...prev,
      isCancelled: true,
      isUploading: false,
      canCancel: false
    }));
  };

  const handleRetryFailedUploads = async () => {
    try {
      await uploadFilesOneByOne(true);
    } catch (error) {
      console.error('Retry failed:', error);
      setModal({
        isOpen: true,
        title: 'Retry Failed',
        message: 'Failed to retry uploads. Please try again.',
        type: 'error'
      });
    }
  };

  const handleRetryIndividualFile = async (fileName: string) => {
    if (!referralId) return;

    // Find the file to retry
    const allFiles = [...referralFormFiles, ...insuranceCardFiles, ...xrayFiles, ...otherDocsFiles];
    const fileToRetry = allFiles.find(file => file.name === fileName);
    
    if (!fileToRetry) return;

    // Determine document type
    let documentType = 'other_documentation';
    if (referralFormFiles.includes(fileToRetry)) documentType = 'referral_form';
    else if (insuranceCardFiles.includes(fileToRetry)) documentType = 'insurance_card';
    else if (xrayFiles.includes(fileToRetry)) documentType = 'xray_radiograph';

    const fileWithMeta = Object.assign(fileToRetry, { 
      documentType, 
      documentCategory: documentType 
    });

    // Update the specific result to show retrying
    setUploadProgress(prev => ({
      ...prev,
      results: prev.results.map(result => 
        result.fileName === fileName 
          ? { ...result, canRetry: false } 
          : result
      )
    }));

    try {
      const result = await uploadDocumentMutation.mutateAsync({
        referralId: referralId,
        formData: [fileWithMeta],
        documentType: fileWithMeta.documentType,
        documentCategory: fileWithMeta.documentCategory
      });

      // Update result with success
      setUploadProgress(prev => ({
        ...prev,
        results: prev.results.map(result => 
          result.fileName === fileName 
            ? { fileName, success: true, result, canRetry: false }
            : result
        )
      }));

    } catch (error) {
      // Update result with new error
      setUploadProgress(prev => ({
        ...prev,
        results: prev.results.map(result => 
          result.fileName === fileName 
            ? { fileName, success: false, error, canRetry: true }
            : result
        )
      }));
    }
  };

  const handleStartReferral = async () => {
    setIsLoading(true);
    try {
      // Use the actual referral ID from API if available
      const newReferralId = referral ? (referral as ReferralApiResponse).referral_id : generateId();
      setReferralId(newReferralId);

      setCurrentStep(1);
    } catch (error) {
      setModal(MODAL_MESSAGES.ERROR.START_REFERRAL);
    }
    setIsLoading(false);
  };

  const handleSubmitReferral = async () => {
    setIsLoading(true);
    try {
      const uploadResults = await uploadFilesOneByOne();
      
      const successfulUploads = uploadResults.filter(result => result.success);
      const failedUploads = uploadResults.filter(result => !result.success);
      
      if (failedUploads.length > 0) {
        setModal({
          isOpen: true,
          title: 'Upload Complete with Errors',
          message: `${successfulUploads.length} files uploaded successfully, ${failedUploads.length} files failed. Please check the results below.`,
                     type: 'error'
        });
      } else {
        setModal({
          isOpen: true,
          title: 'Upload Successful',
          message: `All ${successfulUploads.length} files have been uploaded successfully!`,
          type: 'success'
        });
        
        // Auto-proceed to gift card step after success
        setTimeout(() => {
          setShowGiftCard(true);
          setCurrentStep(6);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      setModal({
        isOpen: true,
        title: 'Upload Failed',
        message: 'Failed to upload files. Please try again.',
        type: 'error'
      });
    }
    setIsLoading(false);
  };

  const handleGiftCardSubmit = async () => {
    if (!giftCardRecipient.trim()) {
      setModal(MODAL_MESSAGES.INPUT_REQUIRED.GIFT_CARD(giftCardContactType));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setModal(MODAL_MESSAGES.SUCCESS.GIFT_CARD);

      setShowGiftCard(false);
      setTimeout(resetFormStateAndReturnToStart, 3000);
    } catch (error) {
      setModal(MODAL_MESSAGES.ERROR.GIFT_CARD);
    }
    setIsLoading(false);
  };

  const resetFormStateAndReturnToStart = () => {
    setCurrentStep(0);
    setReferralId(null);
    setReferralFormFiles([]);
    setInsuranceCardFiles([]);
    setXrayFiles([]);
    setOtherDocsFiles([]);
    setShowGiftCard(false);
    setGiftCardRecipient('');
    setScannedPatientInfo(null);
    setIsPreviouslyScanned(false);
    cancelUploadRef.current = false;
    setUploadProgress({
      total: 0,
      completed: 0,
      isUploading: false,
      results: [],
      canCancel: false,
      isCancelled: false
    });
  };

  // Validation function to check if user can proceed to next step
  const canProceedToNextStep = (): boolean => {
    // For step 0 (start screen), check if we have scanned QR and patient info
    if (currentStep === 1) {
  
      if (!scannedPatientInfo) {
        setModal({
          isOpen: true,
          title: 'Patient Information Required',
          message: 'No patient information found for this referral. Please ensure the QR code contains valid patient data.',
          type: 'error'
        });
        return false;
      }

      if (!referralId) {
        setModal({
          isOpen: true,
          title: 'Referral ID Required',
          message: 'No valid referral ID found. Please scan a valid QR code.',
          type: 'error'
        });
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (canProceedToNextStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  // Show loading state while fetching referral data
  if (isReferralLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-2 sm:p-4 font-sans min-h-screen">
        <div className="w-full max-w-sm sm:max-w-2xl bg-gray-50 shadow-2xl rounded-xl overflow-hidden p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-center">
            <Loader2 size={32} className="text-blue-500 animate-spin sm:mr-4 mb-2 sm:mb-0" />
            <span className="text-base sm:text-lg text-gray-600 text-center">Loading referral data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if referral not found
  if (!referral && !isReferralLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-2 sm:p-4 font-sans min-h-screen ">
        <div className="w-full max-w-sm sm:max-w-2xl bg-gray-50 shadow-2xl rounded-xl overflow-hidden p-4 sm:p-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Referral Not Found</h2>
            <p className="text-sm sm:text-base text-gray-600 px-2">The referral with slug "{props.params.slug}" could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentStepTitle = () => {
    if (currentStep === 1) return 'Upload Referral Form';
    if (currentStep === 2) return 'Upload Insurance Card';
    if (currentStep === 3) return 'Upload X-ray Radiograph';
    if (currentStep === 4) return 'Upload Other Documentation';
    if (currentStep === 5) return 'Review & Submit';
  };

  const renderUploadProgress = () => {
    if (!uploadProgress.isUploading && uploadProgress.results.length === 0) return null;

    const failedUploads = uploadProgress.results.filter(result => !result.success && result.canRetry);
    const hasFailedUploads = failedUploads.length > 0;

    return (
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">
            Upload Progress: {uploadProgress.completed}/{uploadProgress.total}
          </h3>
          <div className="flex items-center space-x-2">
            {uploadProgress.isUploading && (
              <Loader2 size={16} className="text-blue-500 animate-spin" />
            )}
            {uploadProgress.canCancel && (
              <button
                onClick={handleCancelUpload}
                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-300 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              uploadProgress.isCancelled ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }}
          ></div>
        </div>

        {/* Status message */}
        {uploadProgress.isCancelled && (
          <div className="text-xs text-red-600 mb-2">Upload cancelled by user</div>
        )}

        {/* Retry buttons */}
        {!uploadProgress.isUploading && hasFailedUploads && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-600">
              {failedUploads.length} file(s) failed to upload
            </span>
            <button
              onClick={handleRetryFailedUploads}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-300 rounded"
            >
              Retry All Failed
            </button>
          </div>
        )}

        {/* Upload results */}
        {uploadProgress.results.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700 mb-1">Upload Results:</h4>
            {uploadProgress.results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center flex-1">
                  <span className="truncate max-w-[150px] text-xs">{result.fileName}</span>
                  {result.success ? (
                    <CheckCircle size={14} className="text-green-500 ml-2" />
                  ) : (
                    <div className="flex items-center ml-2">
                      <XCircle size={14} className="text-red-500" />
                      {result.error && (
                        <span className="text-xs text-red-500 ml-1 truncate max-w-[100px]" title={result.error.message || result.error}>
                          {result.error.message || 'Upload failed'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {!result.success && result.canRetry && !uploadProgress.isUploading && (
                  <button
                    onClick={() => handleRetryIndividualFile(result.fileName)}
                    className="text-xs text-blue-600 hover:text-blue-800 px-1 py-1 border border-blue-300 rounded ml-2"
                  >
                    Retry
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCurrentStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <StartScreenStep
          referringToOffice={referringToOffice}
          referringFromOffice={referringFromOffice}
          isPreviouslyScanned={isPreviouslyScanned}

          scannedPatientInfo={scannedPatientInfo}
          userId={userId}
          isLoading={isLoading}
          isAuthReady={isAuthReady}
          onStartReferral={handleStartReferral}
        />;
      case 1:
        return <ReferralFormUpload
          nextStep={nextStep}
          onFilesSelected={setReferralFormFiles}
          referralId={referralId || undefined}
          existingFilesCount={referralFormFiles.length}
          isPreviouslyScanned={isPreviouslyScanned}
          scannedPatientInfo={scannedPatientInfo}
          isRequired={true}
          lastScannedDate={referral?.referral_scanned_date}
          maxFiles={5}
          maxFileSize={10}
          documentType="referral_form"
          onUploadComplete={(uploadedFiles) => {
            console.log('Referral forms uploaded successfully:', uploadedFiles);
            refetchReferral();
            // Handle successful upload - could trigger next step or show success message
          }}
        />;
      case 2:
        return <FileUpload
          title="Step 2: Upload Insurance Card(s) (Optional)"
          description="Take a picture or upload images of the patient's insurance member ID card(s)."
          icon={<Shield size={20} className="text-green-500" />}
          onFilesSelected={setInsuranceCardFiles}
          acceptedFileTypes={ACCEPTED_FILE_TYPES.IMAGES}
          multiple={true}
          actionButtonText="Continue"
          actionButtonOnClick={nextStep}
          existingFilesCount={insuranceCardFiles.length}
          files={insuranceCardFiles}
          documentType="insurance_card"
        />;
      case 3:
        return <FileUpload
          title="Step 3: Upload X-ray Radiograph(s) (Optional)"
          description="Take a picture or upload X-ray images."
          icon={<ImageIcon size={20} className="text-purple-500" />}
          onFilesSelected={setXrayFiles}
          acceptedFileTypes={ACCEPTED_FILE_TYPES.IMAGES}
          multiple={true}
          existingFilesCount={xrayFiles.length}
          files={xrayFiles}
          actionButtonText="Continue"
          actionButtonOnClick={nextStep}
          documentType="xray_radiograph"
        />;
      case 4:
        return <FileUpload
          title="Step 4: Upload Other Documentation (Optional)"
          description="Upload any other relevant documents (PDF, images, Word/Text files)."
          icon={<UploadCloud size={20} className="text-yellow-500" />}
          onFilesSelected={setOtherDocsFiles}
          acceptedFileTypes={ACCEPTED_FILE_TYPES.DOCUMENTS}
          multiple={true}
          existingFilesCount={otherDocsFiles.length}
          files={otherDocsFiles}
          actionButtonText="Continue"
          actionButtonOnClick={nextStep}
          documentType="other_documentation"
        />;
      case 5:
        return (
          <div>
            <ReviewSubmitStep
              referralFormData={referralFormFiles}
              insuranceCardData={insuranceCardFiles}
              xrayData={xrayFiles}
              otherDocsData={otherDocsFiles}
              onSubmitReferral={handleSubmitReferral}
            />
            {renderUploadProgress()}
          </div>
        );
      case 6:
        if (!showGiftCard) return null;
        return <GiftCardStep
          giftCardRecipient={giftCardRecipient}
          setGiftCardRecipient={setGiftCardRecipient}
          giftCardContactType={giftCardContactType}
          setGiftCardContactType={setGiftCardContactType}
          isLoading={isLoading}
          onGiftCardSubmit={handleGiftCardSubmit}
        />;
      default:
        return <p>Unknown step.</p>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 font-sans min-h-screen">
      <div className="w-full max-w-sm sm:max-w-2xl bg-gray-50 shadow-2xl border border-gray-200 rounded-xl overflow-hidden p-1 sm:p-2">
        {currentStep > 1 && <AppHeader currentStep={currentStep} referralId={referralId} prevStep={prevStep} showBackButton={true} title={getCurrentStepTitle()}/>}
        {currentStep > 1 && <ProgressBar currentStep={currentStep} totalSteps={TOTAL_UPLOAD_STEPS} />}

        <main className="p-3 sm:p-4 md:p-8">
          {renderCurrentStepComponent()}
        </main>

        {/* <NavigationFooter
          currentStep={currentStep}
          totalSteps={TOTAL_UPLOAD_STEPS}
          isLoading={isLoading}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onSubmitReferral={handleSubmitReferral}
          referralFormDataLength={referralFormFiles.length}
        /> */}
        <footer className="mt-4 sm:mt-8 text-center text-xs text-gray-500 px-2">
        </footer>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        type={modal.type}
      >
        <p>{modal.message}</p>
      </Modal>
      {(isLoading || uploadProgress.isUploading) && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <Loader2 size={24} className="text-blue-500 animate-spin mr-3" />
              <span className="text-gray-700">
                {uploadProgress.isUploading 
                  ? `Uploading files... ${uploadProgress.completed}/${uploadProgress.total}`
                  : 'Loading...'
                }
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


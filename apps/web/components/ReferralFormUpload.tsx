import React, { useState, useEffect, useRef } from 'react';
import { Camera, FileText, Trash2, Upload, AlertCircle, CheckCircle2, User, Calendar, Phone, MapPin, Building } from 'lucide-react';
import { FilePreview } from './types';
import { useUploadReferralForm } from '@/lib/hooks/referrals';
import { toast } from 'sonner';

interface ReferralFormUploadProps {
  onFilesSelected: (files: File[]) => void;
  onUploadComplete?: (uploadedFiles: File[]) => void;
  referralId?: string;
  existingFilesCount?: number;
  isRequired?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export const ReferralFormUpload: React.FC<ReferralFormUploadProps> = ({
  onFilesSelected,
  onUploadComplete,
  referralId,
  existingFilesCount = 0,
  isRequired = true,
  maxFiles = 1, // Changed default from 5 to 1
  maxFileSize = 10 // 10MB default
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [extractionResults, setExtractionResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the upload hook
  const uploadMutation = useUploadReferralForm();

  // Accepted file types specifically for referral forms
  const REFERRAL_FORM_TYPES = "image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  useEffect(() => {
    if (existingFilesCount === 0 && selectedFiles.length > 0) {
      // Reset if parent indicates no files
      setSelectedFiles([]);
      setPreviews([]);
      setErrors([]);
      setIsValid(false);
    }
  }, [existingFilesCount]);

  useEffect(() => {
    // Validate files whenever selection changes
    validateFiles();
  }, [selectedFiles]);

  const validateFiles = () => {
    const newErrors: string[] = [];
    
    // Check if required files are present
    if (isRequired && selectedFiles.length === 0) {
      newErrors.push('A referral form is required'); // Updated message for single file
    }

    // Check file count limit
    if (selectedFiles.length > maxFiles) {
      newErrors.push(`Only ${maxFiles} file allowed`); // Updated message for single file
    }

    // Check file sizes
    selectedFiles.forEach((file, index) => {
      if (file.size > maxFileSize * 1024 * 1024) {
        newErrors.push(`File "${file.name}" exceeds ${maxFileSize}MB limit`);
      }
    });

    setErrors(newErrors);
    setIsValid(newErrors.length === 0 && selectedFiles.length > 0);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Clear existing previews before adding new one
      previews.forEach(p => {
        if (p.type === 'image' && p.url) URL.revokeObjectURL(p.url);
      });
      
      // For single file upload, replace existing files instead of appending
      const newFile = files[0]; // Only take the first file
      setSelectedFiles([newFile]);
      onFilesSelected([newFile]);

      const newPreview = newFile.type.startsWith('image/')
        ? { name: newFile.name, url: URL.createObjectURL(newFile), type: 'image' as const }
        : { name: newFile.name, type: 'other' as const };
      
      setPreviews([newPreview]);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);

    const updatedPreviews = [...previews];
    const removedPreview = updatedPreviews.splice(index, 1)[0];
    if (removedPreview && removedPreview.type === 'image' && removedPreview.url) {
      URL.revokeObjectURL(removedPreview.url);
    }
    setPreviews(updatedPreviews);
    
    onFilesSelected(updatedFiles);
  };

  const clearAllFiles = () => {
    previews.forEach(p => {
      if (p.type === 'image' && p.url) URL.revokeObjectURL(p.url);
    });
    setSelectedFiles([]);
    setPreviews([]);
    onFilesSelected([]);
    setErrors([]);
    setIsValid(false);
  };

  const handleUploadToAPI = async () => {
    if (!isValid || selectedFiles.length === 0 || !referralId) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrors([]);

    try {
      // Use the mutation to upload files

      
      const result = await uploadMutation.mutateAsync({
        referralId,
        files: selectedFiles
      });

      // Handle the response
      if (result) {
        setExtractionResults(result);
        
        // Show success message with extraction details
        if (result.summary) {
          toast.success(
            `Successfully uploaded ${result.summary.total_files} file(s). ` +
            `${result.successful_extractions} of ${result.processed_files} extracted successfully.`
          );
          
          // If there were extraction errors, show them
          if (result.summary.extraction_errors?.length > 0) {
            result.summary.extraction_errors.forEach((error: any) => {
              toast.warning(`Failed to extract data from ${error.file}: ${error.error}`);
            });
          }

          // Show patient creation status
          if (result.patient_data?.status === "created") {
            toast.success(`Patient "${result.patient_data.patient_data.patient_fname} ${result.patient_data.patient_data.patient_lname}" was created successfully.`);
          }

          // Show referral update status
          if (result.referral_updates?.status === "error") {
            toast.warning("Referral update failed: " + result.referral_updates.error);
          }
        }
        
        // Call the completion callback
        onUploadComplete?.(selectedFiles);
        
        setUploadProgress(100);
        
        // Clear files after successful upload
        setTimeout(() => {
          clearAllFiles();
          setIsUploading(false);
          setUploadProgress(0);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setErrors([errorMessage]);
      toast.error(errorMessage);
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to format extracted data for display
  const formatExtractedValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Helper function to render patient information section
  const renderPatientInfo = (patientData: any) => {
    if (!patientData) return null;

    const patientFields = [
      { key: 'first_name', label: 'First Name', icon: User },
      { key: 'last_name', label: 'Last Name', icon: User },
      { key: 'date_of_birth', label: 'Date of Birth', icon: Calendar },
      { key: 'phone_number', label: 'Phone Number', icon: Phone },
      { key: 'email', label: 'Email', icon: Phone },
      { key: 'gender', label: 'Gender', icon: User },
      { key: 'insurance_id', label: 'Insurance Member ID', icon: Building },
    ];

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <User size={20} className="text-blue-600 mr-2" />
          <h4 className="text-lg font-semibold text-blue-800">Patient Information</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patientFields.map(({ key, label, icon: Icon }) => {
            const value = patientData[key];
            if (!value && value !== false && value !== null) return null;
            
            return (
              <div key={key} className="flex items-start space-x-2">
                <Icon size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-700">{label}</p>
                  <p className="text-sm text-blue-900 break-words">{formatExtractedValue(value)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };



  // Helper function to render extraction summary
  const renderExtractionSummary = (summary: any) => {
    if (!summary) return null;

    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <CheckCircle2 size={20} className="text-purple-600 mr-2" />
          <h4 className="text-lg font-semibold text-purple-800">Extraction Summary</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-purple-700">Total Files</p>
            <p className="text-sm text-purple-900">{summary.total_files || 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-purple-700">Successful Extractions</p>
            <p className="text-sm text-purple-900">{summary.successful_extractions || 0}</p>
          </div>
          {summary.extraction_errors && summary.extraction_errors.length > 0 && (
            <div className="col-span-2">
              <p className="text-xs font-medium text-purple-700 mb-2">Extraction Errors</p>
              {summary.extraction_errors.map((error: any, index: number) => (
                <p key={index} className="text-sm text-red-600">
                  {error.file}: {error.error}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper function to extract and format data from the API response
  const getExtractedPatientData = (extractionResults: any) => {
    if (!extractionResults?.extraction_results?.[0]?.extraction_data?.result?.[0]) return null;
    
    const extractedData = extractionResults.extraction_results[0].extraction_data.result[0];
    const patientInfo = extractedData.patient_information || {};
    const createdPatient = extractionResults.patient_data?.patient_data || {};
    
    // Combine extracted data with created patient data
    return {
      first_name: patientInfo.first_name || createdPatient.patient_fname,
      last_name: patientInfo.last_name || createdPatient.patient_lname,
      date_of_birth: patientInfo.date_of_birth !== "Not Specified" ? patientInfo.date_of_birth : createdPatient.patient_dob,
      phone_number: createdPatient.patient_contact_phone !== "000-000-0000" ? createdPatient.patient_contact_phone : null,
      email: createdPatient.patient_contact_email?.includes("@placeholder.com") ? null : createdPatient.patient_contact_email,
      gender: createdPatient.patient_gender !== "Not Specified" ? createdPatient.patient_gender : null,
      insurance_id: createdPatient.patient_insurance_member_id,
    };
  };

  // Helper function to extract referral and medical data
  const getExtractedReferralData = (extractionResults: any) => {
    if (!extractionResults?.extraction_results?.[0]?.extraction_data?.result?.[0]) return null;
    
    const extractedData = extractionResults.extraction_results[0].extraction_data.result[0];
    const referralInfo = extractedData.referral_information || {};
    const providerInfo = extractedData.referring_provider || {};
    const attachments = extractedData.attachments || {};
    
    return {
      referral_date: referralInfo.referral_date !== "Not Specified" ? referralInfo.referral_date : null,
      clinical_description: referralInfo.clinical_description,
      referring_doctor: providerInfo.provider_name,
      radiographs_included: attachments.radiographs_included,
      // Add any other referral-related fields here
    };
  };

  // Helper function to render referral information
  const renderReferralInfo = (referralData: any) => {
    if (!referralData) return null;

    const referralFields = [
      { key: 'referral_date', label: 'Referral Date', icon: Calendar },
      { key: 'clinical_description', label: 'Clinical Description', icon: FileText },
      { key: 'referring_doctor', label: 'Referring Doctor', icon: User },
      { key: 'radiographs_included', label: 'Radiographs Included', icon: FileText },
    ];

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <FileText size={20} className="text-green-600 mr-2" />
          <h4 className="text-lg font-semibold text-green-800">Referral Information</h4>
        </div>
        <div className="space-y-3">
          {referralFields.map(({ key, label, icon: Icon }) => {
            const value = referralData[key];
            if (!value && value !== false) return null;
            
            return (
              <div key={key} className="flex items-start space-x-2">
                <Icon size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-green-700">{label}</p>
                  <p className="text-sm text-green-900 break-words whitespace-pre-wrap">{formatExtractedValue(value)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper function to render extraction details
  const renderExtractionDetails = (extractionResults: any) => {
    if (!extractionResults?.extraction_results?.[0]) return null;

    const extractionResult = extractionResults.extraction_results[0];
    const extractedFields = extractionResult.extracted_fields || {};
    const usage = extractionResult.extraction_data?.usage || {};

    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <AlertCircle size={20} className="text-orange-600 mr-2" />
          <h4 className="text-lg font-semibold text-orange-800">Extraction Details</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-orange-700">Pages Processed</p>
            <p className="text-sm text-orange-900">{usage.num_pages || 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-orange-700">Fields Extracted</p>
            <p className="text-sm text-orange-900">{usage.num_fields || 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-orange-700">Credits Used</p>
            <p className="text-sm text-orange-900">{usage.credits || 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-orange-700">Status</p>
            <p className="text-sm text-orange-900">{extractionResult.extraction_status || 'Unknown'}</p>
          </div>
        </div>
        
        {/* Field Detection Status */}
        <div className="mt-4">
          <p className="text-xs font-medium text-orange-700 mb-2">Field Detection</p>
          <div className="space-y-1">
            {Object.entries(extractedFields).map(([field, detected]) => (
              <div key={field} className="flex justify-between text-xs">
                <span className="text-orange-600 capitalize">{field.replace('has_', '').replace('_', ' ')}</span>
                <span className={`font-medium ${detected ? 'text-green-600' : 'text-red-600'}`}>
                  {detected ? '✓ Detected' : '✗ Not Found'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white px-6 py-8">
      {/* Header Icon */}
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText size={32} className="text-blue-600" />
        </div>
      </div>

      {/* Title and Description */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Upload Referral Form
        </h2>
        <p className="text-sm text-gray-600">
          {isRequired && <span className="text-red-500">Required</span>}
          {isRequired && ' • '}
          Take a photo or select from device • {maxFileSize}MB max file size
        </p>
      </div>

      {/* Extracted Data Display */}
      {extractionResults && (
        <div className="w-full max-w-4xl mb-8 space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              📋 Extracted Information
            </h3>
            <p className="text-sm text-gray-600">
              Here's the information we successfully extracted from your referral form
            </p>
          </div>

          {/* Extraction Summary */}
          {extractionResults.summary && renderExtractionSummary(extractionResults.summary)}

          {/* Patient Information */}
          {(() => {
            const patientData = getExtractedPatientData(extractionResults);
            return patientData && renderPatientInfo(patientData);
          })()}

          {/* Referral Information */}
          {(() => {
            const referralData = getExtractedReferralData(extractionResults);
            return referralData && renderReferralInfo(referralData);
          })()}

          {/* Extraction Details */}
          {/* {renderExtractionDetails(extractionResults)} */}

          {/* Raw Extracted Data (for debugging/completeness) */}
          {/* <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FileText size={20} className="text-gray-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-800">Complete API Response</h4>
            </div>
            <div className="bg-white border rounded p-3 max-h-96 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(extractionResults, null, 2)}
              </pre>
            </div>
          </div> */}

          {/* Action Buttons for Extracted Data */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setExtractionResults(null)}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Results
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(extractionResults, null, 2));
                toast.success('Extracted data copied to clipboard');
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Copy Data
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!extractionResults && (
        <div className="w-full max-w-md mb-8">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              errors.length > 0 
                ? 'border-red-300 bg-red-50 hover:border-red-400' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                errors.length > 0 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <Camera size={24} className={errors.length > 0 ? 'text-red-500' : 'text-gray-500'} />
              </div>
              <p className="text-gray-600 text-sm font-medium">
                Tap to capture or upload referral form
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, Images, Word docs accepted
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept={REFERRAL_FORM_TYPES}
        onChange={handleFileChange}
        className="hidden"
        capture="environment"
      />

      {/* Error Messages */}
      {!extractionResults && errors.length > 0 && (
        <div className="w-full max-w-md mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <AlertCircle size={16} className="text-red-500 mr-2" />
              <span className="text-sm font-medium text-red-800">
                {errors.length === 1 ? 'Error' : 'Errors'}
              </span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* File Previews */}
      {!extractionResults && previews.length > 0 && (
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Selected file:
            </h4>
            {isValid && (
              <div className="flex items-center text-green-600">
                <CheckCircle2 size={16} className="mr-1" />
                <span className="text-xs">Valid</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {previews.map((preview, index) => (
              <div key={preview.name + index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center overflow-hidden flex-1">
                  {preview.type === 'image' ? (
                    <img src={preview.url} alt={preview.name} className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0" />
                  ) : (
                    <FileText size={20} className="text-gray-500 mr-3 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700 truncate block" title={preview.name}>
                      {preview.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(selectedFiles[index]?.size || 0)}
                    </span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(index)} 
                  className="text-red-500 hover:text-red-700 ml-2 p-1 flex-shrink-0"
                  disabled={isUploading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          {previews.length > 0 && (
            <div className="flex justify-between items-center mt-3">
              <button
                type="button"
                onClick={clearAllFiles}
                className="text-sm text-red-600 hover:text-red-800"
                disabled={isUploading}
              >
                Remove file
              </button>
              <span className="text-xs text-gray-500">
                Size: {formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="w-full max-w-md mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Upload size={16} className="text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Uploading referral form...
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-xs text-blue-600 mt-1 text-right">
              {uploadProgress.toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!extractionResults && (
        <div className="w-full max-w-md space-y-3">
          {/* Upload to API Button */}
          {referralId && isValid && !isUploading && (
            <button
              type="button"
              onClick={handleUploadToAPI}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Upload to Referral System
            </button>
          )}
          
          {/* Continue Button */}
          <button
            type="button"
            disabled={!isValid || isUploading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isValid && !isUploading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Continue'}
          </button>
        </div>
      )}

      {/* New Upload Button (shown when results are displayed) */}
      {extractionResults && (
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => {
              setExtractionResults(null);
              clearAllFiles();
            }}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Upload Another Form
          </button>
        </div>
      )}
    </div>
  );
}; 
import React, { useState, useEffect, useRef } from 'react';
import { Camera, FileText, Trash2, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { FileUploadProps, FilePreview, UploadProgress, UploadResult } from './types';

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesSelected, 
  acceptedFileTypes, 
  multiple = true, 
  title, 
  description, 
  icon, 
  files,
  existingFilesCount = 0,
  actionButtonText,
  actionButtonOnClick,
  documentType = 'unknown',
  onUploadProgress,
  onUploadComplete,
  uploadFilesImmediately = false,
  uploadFunction
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    total: 0,
    completed: 0,
    isUploading: false,
    results: [],
    canCancel: true,
    isCancelled: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedFiles(files || []);
  }, [files]);

  // Also reset previews when files prop changes
  useEffect(() => {
    if (files) {
      const newPreviews = files.map(file => {
        if (file.type.startsWith('image/')) {
          return { name: file.name, url: URL.createObjectURL(file), type: 'image' as const };
        } else {
          return { name: file.name, type: 'other' as const };
        }
      });
      setPreviews(newPreviews);
    } else {
      setPreviews([]);
    }
  }, [files]);

  const uploadFilesWithProgress = async (filesToUpload: File[]) => {
    if (!uploadFunction) return;

    const totalFiles = filesToUpload.length;
    setUploadProgress(prev => ({
      ...prev,
      total: totalFiles,
      completed: 0,
      isUploading: true,
      results: [],
      canCancel: true,
      isCancelled: false
    }));

    const results: UploadResult[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        if (uploadProgress.isCancelled) break;

        const file = filesToUpload[i];
        try {
          const result = await uploadFunction([file]);
          results.push(...result);
          
          setUploadProgress(prev => ({
            ...prev,
            completed: i + 1,
            results: [...prev.results, ...result]
          }));

          if (onUploadProgress) {
            onUploadProgress({
              total: totalFiles,
              completed: i + 1,
              isUploading: true,
              results: [...results],
              canCancel: true,
              isCancelled: false
            });
          }
        } catch (error) {
          const failedResult: UploadResult = {
            fileName: file.name,
            success: false,
            error,
            canRetry: true
          };
          results.push(failedResult);
          
          setUploadProgress(prev => ({
            ...prev,
            completed: i + 1,
            results: [...prev.results, failedResult]
          }));
        }
      }
    } finally {
      setUploadProgress(prev => ({
        ...prev,
        isUploading: false,
        canCancel: false
      }));

      if (onUploadComplete) {
        onUploadComplete(results);
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Add document type to each file
      const filesWithDocType = files.map(file => {
        // Create a new file object with document type metadata
        const fileWithMetadata = file as File & { documentType?: string };
        fileWithMetadata.documentType = documentType;
        return fileWithMetadata;
      });

      const newFiles = multiple ? [...selectedFiles, ...filesWithDocType] : filesWithDocType;
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);

      const newPreviews = files.map(file => {
        if (file.type.startsWith('image/')) {
          return { name: file.name, url: URL.createObjectURL(file), type: 'image' as const };
        } else {
          return { name: file.name, type: 'other' as const };
        }
      });
      setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews);

      // Upload files immediately if enabled
      if (uploadFilesImmediately && uploadFunction) {
        await uploadFilesWithProgress(filesWithDocType);
      }
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
  };

  const handleCancelUpload = () => {
    setUploadProgress(prev => ({
      ...prev,
      isCancelled: true,
      canCancel: false
    }));
  };

  const handleRetryFailedUploads = async () => {
    const failedUploads = uploadProgress.results.filter(result => !result.success && result.canRetry);
    if (failedUploads.length > 0 && uploadFunction) {
      // Find the corresponding files for failed uploads
      const failedFiles = selectedFiles.filter(file => 
        failedUploads.some(result => result.fileName === file.name)
      );
      await uploadFilesWithProgress(failedFiles);
    }
  };

  const renderUploadProgress = () => {
    if (!uploadProgress.isUploading && uploadProgress.results.length === 0) return null;

    const failedUploads = uploadProgress.results.filter(result => !result.success && result.canRetry);
    const hasFailedUploads = failedUploads.length > 0;

    return (
      <div className=" p-4 bg-gray-100 rounded-lg w-full mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">
            Upload Progress: {uploadProgress.completed}/{uploadProgress.total}
          </h3>
          <div className="flex items-center space-x-2">
            {uploadProgress.isUploading && (
              <Loader2 size={16} className="text-blue-500 animate-spin" />
            )}
            {uploadProgress.canCancel && uploadProgress.isUploading && (
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
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center  bg-white px-6 py-8">
      {/* Header Icon */}
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText size={32} className="text-blue-600" />
        </div>
      </div>

      {/* Title and Description */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title || 'Upload Referral Form'}</h2>
        <p className="text-sm text-gray-600">{description || 'Required • Take a photo or select from gallery'}</p>
      </div>

      {/* Upload Area */}
      <div className="w-full max-w-md mb-8">
        <div 
          onClick={() => !uploadProgress.isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            uploadProgress.isUploading 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              uploadProgress.isUploading ? 'bg-gray-200' : 'bg-gray-100'
            }`}>
              {uploadProgress.isUploading ? (
                <Loader2 size={24} className="text-gray-400 animate-spin" />
              ) : (
                <Camera size={24} className="text-gray-500" />
              )}
            </div>
            <p className={`text-sm ${
              uploadProgress.isUploading ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {uploadProgress.isUploading ? 'Uploading...' : 'Tap to capture or upload'}
            </p>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        multiple={multiple}
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        className="hidden"
        capture="environment" 
      />

      {/* Upload Progress */}
      {renderUploadProgress()}

      {/* Continue Button */}
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={actionButtonOnClick}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700`}
        >
          {actionButtonText || 'Continue'}
        </button>
      </div>
    </div>
  );
}; 
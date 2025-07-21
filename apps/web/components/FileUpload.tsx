import React, { useState, useEffect, useRef } from 'react';
import { Camera, FileText, Trash2, Upload } from 'lucide-react';
import { FileUploadProps, FilePreview } from './types';

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
  documentType = 'unknown'
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Camera size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-600 text-sm">Tap to capture or upload</p>
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

      {/* File Previews */}
      {files && files.length > 0 && (
        <div className="w-full max-w-md mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Selected files:</h4>
          <div className="space-y-2">
            {files.map((preview, index) => (
              <div key={preview.name + index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center overflow-hidden">
                  <FileText size={20} className="text-gray-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate" title={preview.name}>{preview.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(index)} 
                  className="text-red-500 hover:text-red-700 ml-2 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          {files && files.length > 0 && (
            <button
              type="button"
              onClick={clearAllFiles}
              className="mt-3 text-sm text-red-600 hover:text-red-800"
            >
              Clear all files
            </button>
          )}
        </div>
      )}

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
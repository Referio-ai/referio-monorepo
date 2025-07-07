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
  existingFilesCount = 0 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingFilesCount === 0 && selectedFiles.length > 0) {
      // If parent indicates no files but component has them, means a reset happened.
      // setSelectedFiles([]); // This might be too aggressive, depends on desired behavior
      // setPreviews([]);
    }
  }, [existingFilesCount]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newFiles = multiple ? [...selectedFiles, ...files] : files;
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
      {previews.length > 0 && (
        <div className="w-full max-w-md mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Selected files:</h4>
          <div className="space-y-2">
            {previews.map((preview, index) => (
              <div key={preview.name + index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center overflow-hidden">
                  {preview.type === 'image' ? (
                    <img src={preview.url} alt={preview.name} className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0" />
                  ) : (
                    <FileText size={20} className="text-gray-500 mr-3 flex-shrink-0" />
                  )}
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
          
          {previews.length > 0 && (
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
          disabled={previews.length === 0}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            previews.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}; 
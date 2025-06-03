import React, { useState, useEffect, useRef } from 'react';
import { Camera, FileText, Trash2 } from 'lucide-react';
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
    <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
        {icon} <span className="ml-2">{title}</span>
      </h3>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center text-sm"
        >
          <Camera size={18} className="mr-2" /> Take Picture / Upload
        </button>
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
      {previews.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-md font-medium text-gray-600">Selected files for this upload session:</h4>
          {previews.map((preview, index) => (
            <div key={preview.name + index} className="flex items-center justify-between p-2 border border-gray-200 rounded-md bg-white">
              <div className="flex items-center overflow-hidden">
                {preview.type === 'image' ? (
                  <img src={preview.url} alt={preview.name} className="w-10 h-10 object-cover rounded mr-2 flex-shrink-0" />
                ) : (
                  <FileText size={24} className="text-gray-500 mr-2 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-700 truncate" title={preview.name}>{preview.name}</span>
              </div>
              <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 ml-2">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 
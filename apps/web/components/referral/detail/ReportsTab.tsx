import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, File } from 'lucide-react';

interface ReportsTabProps {
  referralId?: string;
  onFileUpload?: (files: FileList) => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  referralId,
  onFileUpload
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileUpload = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
      return validTypes.includes(file.type);
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
    onFileUpload?.(files);
  };

  const handleBrowseFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.jpeg,.jpg';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFileUpload(target.files);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Treatment Reports Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Treatment Reports</h3>
        <p className="text-sm text-gray-600 mb-4">Report files and documentation</p>
        
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <File className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 font-medium mb-2">No report files uploaded yet</p>
              <p className="text-sm text-gray-400">Reports will appear here when treatment is completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Upload Section */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop PDF or JPEG files here, or{' '}
              <button 
                onClick={handleBrowseFiles}
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                browse files
              </button>
            </p>
            <p className="text-sm text-gray-400">Supported formats: PDF, JPEG</p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List (if any) */}
      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-gray-500 mr-3" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab; 
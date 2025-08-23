import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, File, Download, Trash2, Eye } from 'lucide-react';
import { useUploadDocument } from '@/lib/hooks/referrals';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ReportsTabProps {
  referralId?: string;
  onFileUpload?: (files: File[]) => void;
  onDocumentsUpdated?: (newDocuments: Array<{
    document_id: string;
    created_at: string;
    source: string;
    document_category: string;
    signed_url: string;
    filename?: string;
  }>) => void;
  existingDocuments?: Array<{
    document_id: string;
    created_at: string;
    source: string;
    document_category: string;
    signed_url: string;
    filename?: string;
  }>;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  referralId,
  onFileUpload,
  onDocumentsUpdated,
  existingDocuments = []
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  

  const uploadDocumentMutation = useUploadDocument();

  // State for newly uploaded documents
  const [newlyUploadedDocs, setNewlyUploadedDocs] = useState<Array<{
    document_id: string;
    created_at: string;
    source: string;
    document_category: string;
    signed_url: string;
    filename?: string;
  }>>([]);

  // Sync newly uploaded docs when existing documents change (e.g., after parent refresh)
  useEffect(() => {
    // Clear newly uploaded docs if they're now in the existing documents
    // This prevents duplicates when parent component refreshes data
    if (existingDocuments.length > 0) {
      setNewlyUploadedDocs(prev => 
        prev.filter(newDoc => 
          !existingDocuments.some(existingDoc => 
            existingDoc.document_id === newDoc.document_id ||
            (newDoc.document_id.startsWith('temp_') && existingDoc.filename === newDoc.filename)
          )
        )
      );
    }
  }, [existingDocuments]);

  // Combine existing documents with newly uploaded ones
  const allTreatmentReports = [
    ...existingDocuments.filter(doc => doc.document_category === 'treatment_reports'),
    ...newlyUploadedDocs
  ];

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

  const handleFileUpload = async (files: FileList) => {
    if (!referralId) {
      toast.error("Referral ID is required to upload files");
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length === 0) {
      toast.error("Please upload PDF, JPEG, or PNG files only");
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // Call the parent handler if provided
    onFileUpload?.(validFiles);

    // Upload to backend
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await uploadDocumentMutation.mutateAsync({
        referralId,
        formData: validFiles,
        documentType: 'treatment_report',
        documentCategory: 'treatment_reports'
      });

      toast.success(`${validFiles.length} treatment report(s) uploaded successfully`);

      // Clear uploaded files after successful upload
      setUploadedFiles([]);
      
      // Add newly uploaded documents to the local state
      if (response && response.document_records) {
        const newDocs = response.document_records.map((doc: any) => ({
          document_id: doc.document_id || `temp_${Date.now()}_${Math.random()}`,
          created_at: doc.created_at || new Date().toISOString(),
          source: doc.source || doc.signed_url || '',
          document_category: doc.document_category || 'treatment_reports',
          signed_url: doc.signed_url || doc.source || '',
          filename: validFiles.find(f => f.name)?.name || 'Treatment Report'
        }));
        
        setNewlyUploadedDocs(prev => [...prev, ...newDocs]);
        
        // Notify parent component about the new documents
        onDocumentsUpdated?.(newDocs);
      } else {
        // Fallback: create temporary documents if response structure is different
        const tempDocs = validFiles.map((file, index) => ({
          document_id: `temp_${Date.now()}_${index}`,
          created_at: new Date().toISOString(),
          source: '',
          document_category: 'treatment_reports',
          signed_url: '',
          filename: file.name
        }));
        
        setNewlyUploadedDocs(prev => [...prev, ...tempDocs]);
        
        // Notify parent component about the new documents
        onDocumentsUpdated?.(tempDocs);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload treatment reports. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleBrowseFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.jpeg,.jpg,.png';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleFileUpload(target.files);
      }
    };
    input.click();
  };

  const handleViewDocument = (document: any) => {
    if (document.signed_url) {
      window.open(document.signed_url, '_blank');
    }
  };

  const handleDownloadDocument = (document: any) => {
    if (document.signed_url) {
      const link = document.createElement('a');
      link.href = document.signed_url;
      link.download = document.filename || 'treatment_report';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Treatment Reports Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Treatment Reports</h3>
        <p className="text-sm text-gray-600 mb-4">Report files and documentation</p>
        
        {allTreatmentReports.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <File className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium mb-2">No treatment reports uploaded yet</p>
                <p className="text-sm text-gray-400">Upload treatment reports using the form below</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {allTreatmentReports.map((document) => (
              <Card key={document.document_id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {document.filename || 'Treatment Report'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Uploaded on {format(new Date(document.created_at), 'MMM dd, yyyy')}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {document.document_category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(document)}
                        className="h-8 px-3"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                        className="h-8 px-3"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
              Drag and drop PDF or image files here, or{' '}
              <button 
                onClick={handleBrowseFiles}
                className="text-blue-600 hover:text-blue-800 underline font-medium"
                disabled={isUploading}
              >
                browse files
              </button>
            </p>
            <p className="text-sm text-gray-400 mb-4">Supported formats: PDF, JPEG, PNG</p>
            
            {isUploading && (
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List (if any) */}
      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3">Files to Upload</h4>
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
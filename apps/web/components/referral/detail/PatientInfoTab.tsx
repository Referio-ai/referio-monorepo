import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Paperclip, FileText, Eye } from 'lucide-react';
import { Referral } from '@/constants/referral';
import Image from 'next/image';
import { ImageModal } from '@/components/ImageModal';
import { format } from 'date-fns';

interface PatientInfoTabProps {
  referral: Referral;
  onUploadFiles?: (files: File[]) => void;
}

export const PatientInfoTab: React.FC<PatientInfoTabProps> = ({
  referral,
  onUploadFiles
}) => {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt: string;
    title: string;
  } | null>(null);

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

  const insuranceDocument = referral?.documents?.find((document) => document.document_category === 'insurance_card');
  const xrayDocuments = referral?.documents?.filter((document) => document.document_category === 'xray_radiograph') || [];
  const hasXrayDocuments = xrayDocuments.length > 0;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900">{referral.patientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Age</p>
                <p className="text-gray-900">{referral.age}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">DOB</p>
              <p className="text-gray-900">{referral.dateOfBirth}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-gray-900">{referral.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{referral.patientName.toLowerCase().replace(' ', '.')}@email.com</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Referring Doctor</p>
              <p className="text-gray-900">{referral.referredBy}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Insurance Information</CardTitle>
            {referral.hasInsurance && (
              <Badge className="bg-green-100 text-green-800">Verified</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Insurance Document</p>
              {insuranceDocument?.signed_url ? (
                <div className="relative inline-block">
                  <Image 
                    src={insuranceDocument.signed_url} 
                    alt="Insurance Document" 
                    width={100} 
                    height={100}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleImageClick(
                      insuranceDocument.signed_url, 
                      'Insurance Document', 
                      'Insurance Card'
                    )}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 p-1 h-6 w-6 bg-black/50 text-white hover:bg-black/70"
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
            <div>
              <p className="text-sm font-medium text-gray-500">Provider</p>
              <p className="text-gray-900">{referral.insurance}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Member ID</p>
                <p className="text-gray-900">{referral.memberId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Group #</p>
                <p className="text-gray-900">GRP829457</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Comments */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Referral Comments</CardTitle>
            <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              Attached
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Date Received</p>
              <p className="text-gray-900">{formatDate(referral.dateReceived)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reason</p>
              <p className="text-gray-900">{referral.reason}</p>
            </div>
          </div>
    
        </CardContent>
      </Card>

      {/* X-Rays */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>X-Rays</CardTitle>
        </CardHeader>
        <CardContent>
          {hasXrayDocuments ? (
            <div className="grid grid-cols-4 gap-4">
              {xrayDocuments.slice(0, 3).map((document, index) => (
                <div key={document.document_id} className="space-y-2">
                  <div 
                    className="bg-gray-100 h-32 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative overflow-hidden"
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
                      className="absolute top-1 right-1 p-1 h-6 w-6 bg-black/50 text-white hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(
                          document.signed_url, 
                          `X-Ray ${index + 1}`, 
                          `X-Ray Document ${index + 1}`
                        );
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-center font-medium">X-Ray {index + 1}</p>
                </div>
              ))}
              {xrayDocuments.length < 4 && (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-gray-200 h-32 rounded-lg flex flex-col items-center justify-center text-gray-400">
                    <div className="text-2xl">+</div>
                    <p className="text-xs text-center">Upload Additional X-rays</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-gray-400 text-2xl mb-2">📷</div>
              <p className="mt-2 text-gray-500">No X-rays provided</p>
              <Button className="mt-2 text-sm" variant="outline">Request X-rays</Button>
            </div>
          )}
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
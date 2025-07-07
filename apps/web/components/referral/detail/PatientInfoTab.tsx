import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Paperclip, FileText, Image } from 'lucide-react';
import { Referral } from '@/constants/referral';

interface PatientInfoTabProps {
  referral: Referral;
  onUploadFiles?: (files: File[]) => void;
}

export const PatientInfoTab: React.FC<PatientInfoTabProps> = ({
  referral,
  onUploadFiles
}) => {
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
              <p className="text-gray-900">{referral.dateReceived}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reason</p>
              <p className="text-gray-900">{referral.reason}</p>
            </div>
          </div>
          <div className="border-l-4 border-blue-200 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Document</span>
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
          {referral.hasXrays ? (
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-center font-medium">Panoramic</p>
              </div>
              <div className="space-y-2">
                <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-center font-medium">Bitewing L</p>
              </div>
              <div className="space-y-2">
                <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-center font-medium">Bitewing R</p>
              </div>
              <div className="space-y-2">
                <div className="border-2 border-dashed border-gray-200 h-32 rounded-lg flex flex-col items-center justify-center text-gray-400">
                  <div className="text-2xl">+</div>
                  <p className="text-xs text-center">Upload Additional X-rays</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
              <Image className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-gray-500">No X-rays provided</p>
              <Button className="mt-2 text-sm" variant="outline">Request X-rays</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientInfoTab; 
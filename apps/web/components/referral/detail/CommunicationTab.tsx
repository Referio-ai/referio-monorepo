import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Paperclip, FileText, Send } from 'lucide-react';
import { Referral } from '@/constants/referral';

interface CommunicationTabProps {
  referral: Referral;
  onSendMessage?: (message: string) => void;
  onUploadFiles?: (files: File[]) => void;
}

export const CommunicationTab: React.FC<CommunicationTabProps> = ({
  referral,
  onSendMessage,
  onUploadFiles
}) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
        <CardDescription>Messages and referral letters</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{referral.referredBy}</p>
                <p className="text-sm text-gray-600">Initial Referral</p>
              </div>
              <p className="text-sm text-gray-500">{referral.dateReceived}</p>
            </div>
            <div className="mt-3 bg-blue-100 rounded-lg p-3">
              <p className="text-gray-800">Patient is being referred for {referral.reason}. Please evaluate and provide treatment as necessary. Patient has reported increasing discomfort over the past two weeks.</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Badge className="bg-gray-800 text-white flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                X-rays (3)
              </Badge>
              <Badge className="bg-gray-800 text-white flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Referral Form
              </Badge>
            </div>
          </div>

          {referral.status === 'active' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Dr. Elizabeth Taylor</p>
                  <p className="text-sm text-gray-600">Referral Acceptance</p>
                </div>
                <p className="text-sm text-gray-500">April 21, 2025</p>
              </div>
              <div className="mt-3 bg-blue-100 rounded-lg p-3">
                <p className="text-gray-800">Thank you for your referral. We will be happy to see this patient for the requested treatment. We have contacted the patient to schedule an appointment.</p>
              </div>
            </div>
          )}

          {referral.appointmentDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Front Office</p>
                  <p className="text-sm text-gray-600">Appointment Scheduled</p>
                </div>
                <p className="text-sm text-gray-500">April 22, 2025</p>
              </div>
              <div className="mt-3 bg-blue-100 rounded-lg p-3">
                <p className="text-gray-800">Patient has been scheduled for an appointment on {referral.appointmentDate} at {referral.appointmentTime}.</p>
              </div>
            </div>
          )}

          {referral.status === 'archive' && referral.completedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Dr. Elizabeth Taylor</p>
                  <p className="text-sm text-gray-600">Treatment Completed</p>
                </div>
                <p className="text-sm text-gray-500">{referral.completedDate}</p>
              </div>
              <div className="mt-3 bg-blue-100 rounded-lg p-3">
                <p className="text-gray-800">Treatment has been completed successfully. Patient was seen for {referral.reason} and procedure was performed without complications. Please see attached post-treatment X-rays and report.</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge className="bg-gray-800 text-white flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  Post-Treatment X-rays
                </Badge>
                <Badge className="bg-gray-800 text-white flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Treatment Report
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full">
          <div className="flex gap-2 mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-200 text-blue-600"
              onClick={() => onUploadFiles?.([])}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-200 text-blue-600"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Type your message..." 
              className="flex-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CommunicationTab; 
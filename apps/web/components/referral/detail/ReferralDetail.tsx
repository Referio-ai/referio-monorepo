import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Paperclip, 
  FileText, 
  Image, 
  Send 
} from 'lucide-react';
import { Referral } from '@/constants/referral';
import { ReferralDetailSkeleton } from '../skeletons/ReferralSkeletons';

interface ReferralDetailProps {
  referral: Referral;
  onScheduleAppointment?: () => void;
  onAcceptReferral?: () => void;
  onVerifyBenefits?: () => void;
  onSendMessage?: (message: string) => void;
  onUploadFiles?: (files: File[]) => void;
  isLoading?: boolean;
}

export const ReferralDetail: React.FC<ReferralDetailProps> = ({
  referral,
  onScheduleAppointment,
  onAcceptReferral,
  onVerifyBenefits,
  onSendMessage,
  onUploadFiles,
  isLoading = false
}) => {
  const [activeDetailTab, setActiveDetailTab] = useState('info');
  const [message, setMessage] = useState('');

  if (isLoading) {
    return <ReferralDetailSkeleton />;
  }

  if (!referral) return null;

  const handleSendMessage = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">{referral.patientName}</h2>
          <p className="text-gray-500">Referred by {referral.referredBy} • {referral.dateReceived}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onScheduleAppointment}
            className="bg-blue-200 hover:bg-blue-300 text-blue-700"
          >
            Schedule Appointment
          </Button>
          <Button 
            onClick={onAcceptReferral}
            className="bg-green-200 hover:bg-green-300 text-green-700"
          >
            Accept Referral
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger 
            value="info" 
            onClick={() => setActiveDetailTab('info')} 
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
          >
            Patient Info
          </TabsTrigger>
          <TabsTrigger 
            value="xrays" 
            onClick={() => setActiveDetailTab('xrays')} 
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
          >
            X-Rays
          </TabsTrigger>
          <TabsTrigger 
            value="insurance" 
            onClick={() => setActiveDetailTab('insurance')} 
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
          >
            Insurance
          </TabsTrigger>
          <TabsTrigger 
            value="communication" 
            onClick={() => setActiveDetailTab('communication')} 
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
          >
            Communication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="flex-1">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p>{referral.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p>{referral.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p>06/12/{2025 - referral.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>(555) 123-4567</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{referral.patientName.toLowerCase().replace(' ', '.')}@email.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referral Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Referring Doctor</p>
                    <p>{referral.referredBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Practice</p>
                    <p>{referral.practice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date Received</p>
                    <p>{referral.dateReceived}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reason for Referral</p>
                    <p>{referral.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Medical History Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Patient reports no allergies to medications. Has controlled hypertension (medication: Lisinopril 10mg). Last dental cleaning was 3 months ago. Patient experiences dental anxiety and prefers morning appointments.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="xrays" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>X-Rays</CardTitle>
              <CardDescription>X-rays and imaging provided by the referring office</CardDescription>
            </CardHeader>
            <CardContent>
              {referral.hasXrays ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-2">
                    <div className="bg-gray-200 h-40 rounded flex items-center justify-center">
                      <img src="/api/placeholder/300/200" alt="X-ray placeholder" />
                    </div>
                    <p className="mt-2 text-sm">Panoramic X-ray</p>
                    <p className="text-xs text-gray-500">Uploaded April 20, 2025</p>
                  </div>
                  <div className="border rounded-lg p-2">
                    <div className="bg-gray-200 h-40 rounded flex items-center justify-center">
                      <img src="/api/placeholder/300/200" alt="X-ray placeholder" />
                    </div>
                    <p className="mt-2 text-sm">Bitewing - Right</p>
                    <p className="text-xs text-gray-500">Uploaded April 20, 2025</p>
                  </div>
                  <div className="border rounded-lg p-2">
                    <div className="bg-gray-200 h-40 rounded flex items-center justify-center">
                      <img src="/api/placeholder/300/200" alt="X-ray placeholder" />
                    </div>
                    <p className="mt-2 text-sm">Bitewing - Left</p>
                    <p className="text-xs text-gray-500">Uploaded April 20, 2025</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg">
                  <Image className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No X-rays provided</p>
                  <Button className="mt-4 bg-blue-200 hover:bg-blue-300 text-blue-700">Request X-rays</Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="mr-2 bg-blue-200 hover:bg-blue-300 text-blue-700">
                <Paperclip className="mr-2 h-4 w-4" />
                Upload Response X-rays
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Add Notes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>Patient's dental insurance details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center p-4 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full mr-4">
                    <img src="/api/placeholder/40/40" alt="Insurance logo" className="h-10 w-10" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{referral.insurance}</h3>
                    <p className="text-sm text-gray-500">Primary Dental Insurance</p>
                  </div>
                  <Badge className="bg-green-200 text-green-700">Verified</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Member ID</p>
                    <p className="font-medium">{referral.memberId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Group Number</p>
                    <p className="font-medium">GRP829457</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subscriber</p>
                    <p className="font-medium">{referral.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Relationship to Subscriber</p>
                    <p className="font-medium">Self</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Coverage Type</p>
                    <p className="font-medium">PPO Plan</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Effective Date</p>
                    <p className="font-medium">01/01/2025</p>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Coverage Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-sm">Annual Maximum</p>
                        <p className="font-medium">$2,000</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Remaining Benefit</p>
                        <p className="font-medium">$1,750</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Deductible</p>
                        <p className="font-medium">$50 (Met)</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Preventive Coverage</p>
                        <p className="font-medium">100%</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Basic Services</p>
                        <p className="font-medium">80%</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Major Services</p>
                        <p className="font-medium">60%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={onVerifyBenefits}
                className="bg-green-200 hover:bg-green-300 text-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify Benefits
              </Button>
              <Button variant="outline" className="ml-2 text-green-700 border-green-300">
                <FileText className="mr-2 h-4 w-4" />
                Pre-Authorization
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="flex-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>Messages and referral letters</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{referral.referredBy}</p>
                      <p className="text-sm text-gray-500">Initial Referral</p>
                    </div>
                    <p className="text-sm text-gray-500">{referral.dateReceived}</p>
                  </div>
                  <p className="mt-2">Patient is being referred for {referral.reason}. Please evaluate and provide treatment as necessary. Patient has reported increasing discomfort over the past two weeks.</p>
                  <div className="mt-4 flex gap-2">
                    <Badge className="bg-gray-200 text-gray-700 flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      X-rays (3)
                    </Badge>
                    <Badge className="bg-gray-200 text-gray-700 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Referral Form
                    </Badge>
                  </div>
                </div>

                {referral.status === 'in-progress' || referral.status === 'scheduled' || referral.status === 'completed' ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Dr. Elizabeth Taylor</p>
                        <p className="text-sm text-gray-500">Referral Acceptance</p>
                      </div>
                      <p className="text-sm text-gray-500">April 21, 2025</p>
                    </div>
                    <p className="mt-2">Thank you for your referral. We will be happy to see this patient for the requested treatment. We have contacted the patient to schedule an appointment.</p>
                  </div>
                ) : null}

                {referral.status === 'scheduled' || referral.status === 'completed' ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Front Office</p>
                        <p className="text-sm text-gray-500">Appointment Scheduled</p>
                      </div>
                      <p className="text-sm text-gray-500">April 22, 2025</p>
                    </div>
                    <p className="mt-2">Patient has been scheduled for an appointment on {referral.appointmentDate} at {referral.appointmentTime}.</p>
                  </div>
                ) : null}

                {referral.status === 'completed' ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Dr. Elizabeth Taylor</p>
                        <p className="text-sm text-gray-500">Treatment Completed</p>
                      </div>
                      <p className="text-sm text-gray-500">{referral.completedDate}</p>
                    </div>
                    <p className="mt-2">Treatment has been completed successfully. Patient was seen for {referral.reason} and procedure was performed without complications. Please see attached post-treatment X-rays and report.</p>
                    <div className="mt-4 flex gap-2">
                      <Badge className="bg-gray-200 text-gray-700 flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        Post-Treatment X-rays
                      </Badge>
                      <Badge className="bg-gray-200 text-gray-700 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Treatment Report
                      </Badge>
                    </div>
                  </div>
                ) : null}
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
                    className="bg-blue-200 hover:bg-blue-300 text-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralDetail; 
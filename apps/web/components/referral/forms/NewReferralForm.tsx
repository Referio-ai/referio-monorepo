import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip } from 'lucide-react';
import { NewReferralFormData, DEFAULT_FORM_DATA } from '@/constants/referral';
import { NewReferralFormSkeleton } from '../skeletons/ReferralSkeletons';

interface NewReferralFormProps {
  onSubmit: (data: NewReferralFormData) => void;
  onCancel: () => void;
  initialData?: Partial<NewReferralFormData>;
  isLoading?: boolean;
}

export const NewReferralForm: React.FC<NewReferralFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isLoading = false
}) => {
  const [formData, setFormData] = useState<NewReferralFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData
  });

  if (isLoading) {
    return <NewReferralFormSkeleton />;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-2">
          <Label htmlFor="patientName" className="text-xs">Patient Name</Label>
          <Input 
            id="patientName" 
            name="patientName" 
            value={formData.patientName} 
            onChange={handleChange} 
            required 
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor="patientAge" className="text-xs">Age</Label>
          <Input 
            id="patientAge" 
            name="patientAge" 
            type="number" 
            value={formData.patientAge} 
            onChange={handleChange} 
            required 
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor="patientPhone" className="text-xs">Phone</Label>
          <Input 
            id="patientPhone" 
            name="patientPhone" 
            value={formData.patientPhone} 
            onChange={handleChange} 
            required 
            className="h-8"
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="patientEmail" className="text-xs">Email</Label>
          <Input 
            id="patientEmail" 
            name="patientEmail" 
            type="email" 
            value={formData.patientEmail} 
            onChange={handleChange}
            className="h-8" 
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="referringDoctor" className="text-xs">Referring Doctor</Label>
          <Input 
            id="referringDoctor" 
            name="referringDoctor" 
            value={formData.referringDoctor} 
            onChange={handleChange} 
            required 
            className="h-8"
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="referringPractice" className="text-xs">Practice Name</Label>
          <Input 
            id="referringPractice" 
            name="referringPractice" 
            value={formData.referringPractice} 
            onChange={handleChange} 
            required 
            className="h-8"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="reason" className="text-xs">Reason for Referral</Label>
          <Input 
            id="reason" 
            name="reason" 
            value={formData.reason} 
            onChange={handleChange} 
            required 
            className="h-8"
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="insurance" className="text-xs">Insurance Provider</Label>
          <Input 
            id="insurance" 
            name="insurance" 
            value={formData.insurance} 
            onChange={handleChange}
            className="h-8" 
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="insuranceId" className="text-xs">Member ID</Label>
          <Input 
            id="insuranceId" 
            name="insuranceId" 
            value={formData.insuranceId} 
            onChange={handleChange}
            className="h-8" 
          />
        </div>

        <div className="col-span-4">
          <Label htmlFor="notes" className="text-xs">Additional Notes</Label>
          <Textarea 
            id="notes" 
            name="notes" 
            value={formData.notes} 
            onChange={handleChange} 
            rows={2}
            className="text-sm" 
          />
        </div>
      </div>
      
      <div className="flex gap-3 border border-dashed rounded p-2 border-blue-200">
        <Paperclip className="h-5 w-5 text-blue-400" />
        <div className="flex-1">
          <p className="text-xs text-blue-500">Attach X-rays and Documents</p>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs border-blue-200 text-blue-600">
          Upload
        </Button>
      </div>
      
      <div className="flex justify-end gap-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          size="sm" 
          className="border-blue-200 text-blue-600"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          size="sm" 
          className="bg-blue-200 hover:bg-blue-300 text-blue-700"
        >
          Create Referral
        </Button>
      </div>
    </form>
  );
};

export default NewReferralForm; 
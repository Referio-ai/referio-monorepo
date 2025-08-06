import React from 'react';
import { CheckCircle, FileText, Shield } from 'lucide-react';

export interface ThankYouStepProps {
  onReturnToStart: () => void;
  referralId?: string | null;
  totalFilesUploaded?: number;
}

export const ThankYouStep: React.FC<ThankYouStepProps> = ({ 
  onReturnToStart,
  referralId,
  totalFilesUploaded = 0
}) => {
  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle size={48} className="text-green-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thank You for Your Upload!
        </h2>
        
        <p className="text-gray-600 mb-4">
          Your referral has been successfully processed and submitted.
        </p>
        
        {referralId && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Referral ID:</strong> {referralId}
            </p>
          </div>
        )}
        
        {totalFilesUploaded > 0 && (
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-green-800">
              <strong>Files Uploaded:</strong> {totalFilesUploaded} file(s)
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border text-center">
          <FileText size={24} className="text-blue-500 mx-auto mb-2" />
          <h3 className="font-medium text-gray-700 text-sm mb-1">Documents Processed</h3>
          <p className="text-xs text-gray-600">All files have been securely uploaded</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border text-center">
          <Shield size={24} className="text-green-500 mx-auto mb-2" />
          <h3 className="font-medium text-gray-700 text-sm mb-1">Secure Transfer</h3>
          <p className="text-xs text-gray-600">Your data is protected and encrypted</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border text-center">
          <CheckCircle size={24} className="text-purple-500 mx-auto mb-2" />
          <h3 className="font-medium text-gray-700 text-sm mb-1">Referral Complete</h3>
          <p className="text-xs text-gray-600">Ready for processing by our team</p>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-800 mb-2">What happens next?</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Your referral will be reviewed by our medical team</li>
          <li>• You'll receive updates on the processing status</li>
          <li>• The referring facility will be notified of completion</li>
        </ul>
      </div>
      
      <button
        onClick={onReturnToStart}
        className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
      >
        Return to Start
      </button>
    </div>
  );
}; 
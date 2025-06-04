import React from 'react';
import { ReviewSubmitStepProps } from './types';

export const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ 
  referralFormData, 
  insuranceCardData, 
  xrayData, 
  otherDocsData 
}) => (
  <div className="p-6 bg-gray-50 rounded-lg shadow">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Step 5: Review & Submit Referral</h2>
    <div className="space-y-4 mb-8">
      <div>
        <h3 className="font-medium text-gray-700">Referral Forms:</h3>
        <p className="text-sm text-gray-600">{referralFormData.length} file(s) selected. {referralFormData.length === 0 && <span className="text-red-500">(Required)</span>}</p>
      </div>
      <div>
        <h3 className="font-medium text-gray-700">Insurance Cards:</h3>
        <p className="text-sm text-gray-600">{insuranceCardData.length} file(s) selected.</p>
      </div>
      <div>
        <h3 className="font-medium text-gray-700">X-rays:</h3>
        <p className="text-sm text-gray-600">{xrayData.length} file(s) selected.</p>
      </div>
      <div>
        <h3 className="font-medium text-gray-700">Other Documents:</h3>
        <p className="text-sm text-gray-600">{otherDocsData.length} file(s) selected.</p>
      </div>
    </div>
    <p className="text-xs text-gray-500 mb-6 text-center">
      By clicking submit, you confirm all information is accurate and you have consent to share these documents.
    </p>
  </div>
); 
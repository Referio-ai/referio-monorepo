import React from 'react';
import { ReviewSubmitStepProps } from './types';

export const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ 
  referralFormData, 
  insuranceCardData, 
  xrayData, 
  otherDocsData,
  onSubmitReferral
}) => {
  const totalFiles = referralFormData.length + insuranceCardData.length + xrayData.length + otherDocsData.length;
  
  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-lg border">
          <h3 className="font-medium text-gray-700 text-sm mb-1">Referral Forms:</h3>
          <p className="text-sm text-gray-600">{referralFormData.length} file(s)</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <h3 className="font-medium text-gray-700 text-sm mb-1">Insurance Cards:</h3>
          <p className="text-sm text-gray-600">{insuranceCardData.length} file(s)</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <h3 className="font-medium text-gray-700 text-sm mb-1">X-rays:</h3>
          <p className="text-sm text-gray-600">{xrayData.length} file(s)</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <h3 className="font-medium text-gray-700 text-sm mb-1">Other Documents:</h3>
          <p className="text-sm text-gray-600">{otherDocsData.length} file(s)</p>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-blue-800 mb-1">Total Files Uploaded:</h3>
        <p className="text-lg font-semibold text-blue-900">{totalFiles} file(s)</p>
      </div>
      
      <p className="text-xs text-gray-500 mb-6 text-center">
        All files have been successfully uploaded. Click continue to finish the process.
      </p>
      
      <button
        onClick={onSubmitReferral}
        className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
      >
        Continue
      </button>
    </div>
  );
}; 
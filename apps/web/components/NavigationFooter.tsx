import React from 'react';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';
import { NavigationFooterProps } from './types';

export const NavigationFooter: React.FC<NavigationFooterProps> = ({ 
  currentStep, 
  totalSteps, 
  isLoading, 
  onPrevStep, 
  onNextStep, 
  onSubmitReferral, 
  referralFormDataLength 
}) => {
  if (currentStep === 0 || currentStep > totalSteps) return null;

  return (
    <footer className="px-4 sm:px-8 py-6 border-t border-gray-200 bg-gray-50">
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevStep}
          disabled={isLoading || currentStep === 1}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" /> Previous
        </button>
        {currentStep < totalSteps ? (
          <button
            onClick={onNextStep}
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
          >
            Next <ArrowRight size={18} className="ml-2" />
          </button>
        ) : (
          <button
            onClick={onSubmitReferral}
            disabled={isLoading || referralFormDataLength === 0}
            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
            Submit Referral
          </button>
        )}
      </div>
    </footer>
  );
}; 
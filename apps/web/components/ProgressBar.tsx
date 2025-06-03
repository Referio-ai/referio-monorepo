import React from 'react';
import { ProgressBarProps } from './types';

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  if (currentStep === 0 || currentStep > totalSteps) return null;
  const progressPercentage = currentStep === totalSteps ? 100 : ((currentStep - 1) / totalSteps) * 100;

  let stepDescription = "";
  if (currentStep === 1) stepDescription = ": Referral Form(s)";
  else if (currentStep === 2) stepDescription = ": Insurance Card(s)";
  else if (currentStep === 3) stepDescription = ": X-Ray(s)";
  else if (currentStep === 4) stepDescription = ": Other Document(s)";
  else if (currentStep === 5) stepDescription = ": Review & Submit";

  return (
    <div className="px-6 pt-4">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div 
          className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Step {currentStep} of {totalSteps}
        {stepDescription}
      </p>
    </div>
  );
}; 
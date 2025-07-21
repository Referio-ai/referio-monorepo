import React from 'react';
import { AppHeaderProps } from './types';

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  currentStep, 
  referralId, 
  prevStep, 
  title = "Patient Referral Portal",
  showBackButton = false 
}) => (
  <header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white rounded-t-lg">
    <div className="flex items-center justify-between">
      {showBackButton ? (
        <button
          onClick={prevStep}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      ) : (
        <div className="w-20"></div>
      )}
      
      <div className="flex text-center">
        <h4 className="text-2xl sm:text-3xl font-bold">{title}</h4>
      </div>
      
      <div className="flex"></div>
    </div>
  </header> 
); 
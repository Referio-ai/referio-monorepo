import React from 'react';
import { AppHeaderProps } from './types';

export const AppHeader: React.FC<AppHeaderProps> = ({ currentStep, referralId }) => (
  <header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
    <h1 className="text-2xl sm:text-3xl font-bold">Patient Referral Portal</h1>
    {currentStep > 0 && currentStep <= 5 && referralId && (
      <p className="text-sm opacity-90 mt-1">Referral ID: <span className="font-mono text-xs bg-black bg-opacity-20 px-1 py-0.5 rounded">{referralId}</span></p>
    )}
  </header>
); 
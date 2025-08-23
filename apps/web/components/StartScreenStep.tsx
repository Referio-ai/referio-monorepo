import React from 'react';
import { Loader2, FileText, ChevronRight, User, Calendar, Phone, Mail, CreditCard } from 'lucide-react';
import { StartScreenStepProps } from './types';

export const StartScreenStep: React.FC<StartScreenStepProps> = ({ 
  referringToOffice, 
  referringFromOffice, 
  isPreviouslyScanned, 
  scannedPatientInfo, 
  userId, 
  isLoading, 
  isAuthReady, 
  onStartReferral,
}) => {
  // Determine button text based on scan status and patient info
  const getButtonText = () => {
    if (isPreviouslyScanned && scannedPatientInfo) {
      return "Continue with Existing Patient";
    } else if (isPreviouslyScanned) {
      return "Continue Referral";
    } else {
      return "Start Referral";
    }
  };

  return (
    <div className="space-y-6">
      {/* Referring From Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText size={16} className="text-blue-600" />
          </div>
          <div className='flex gap-1 flex-col'>
            <p className="text-sm text-gray-600">Referring From</p>
            <p className="font-semibold text-gray-900">{referringFromOffice.name}</p>
            {referringFromOffice.address && (
              <p className="text-xs text-gray-600">{referringFromOffice.address}</p>
            )}
          </div>
        </div>
      </div>

  

      {/* Referring To Office Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-center">
          {/* Office Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-blue-600" />
          </div>
          
          {/* Office Name */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {referringToOffice.name}
          </h2>
          
          {/* Office Address - Only show if available */}
          {referringToOffice.address && referringToOffice.address !== "Address information not available" && (
            <p className="text-gray-600 mb-1">{referringToOffice.address}</p>
          )}
          
          {/* Office Phone - Only show if available */}
          {referringToOffice.phone && referringToOffice.phone !== "Phone information not available" && (
            <p className="text-gray-600 mb-4">{referringToOffice.phone}</p>
          )}
        
        </div>
      </div>

          {/* Patient Info Card - Middle Section */}
          {scannedPatientInfo && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
          {/* Patient Icon */}
          {/* Patient Initials and Birth Year */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {scannedPatientInfo.firstNameInitial}. {scannedPatientInfo.lastNameInitial}.
            </h3>
            <p className="text-lg text-gray-600 mb-2">
              Born {scannedPatientInfo.birthYear}
            </p>
            {/* Last Scan Information */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Calendar size={14} className="text-gray-400" />
              <span>Last Scanned: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Start Referral Button */}
      <button
        onClick={onStartReferral}
        disabled={isLoading || !isAuthReady}
        className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold disabled:opacity-50 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading...
          </>
        ) : (
          getButtonText()
        )}
      </button>

      {/* User ID Footer */}
      {userId && (
        <div className="text-center text-xs text-gray-400">
          User ID: {userId}
        </div>
      )}
    </div>
  );
}; 
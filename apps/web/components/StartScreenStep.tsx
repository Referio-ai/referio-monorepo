import React from 'react';
import { Loader2, FileText, ChevronRight } from 'lucide-react';
import { StartScreenStepProps } from './types';

export const StartScreenStep: React.FC<StartScreenStepProps> = ({ 
  referringToOffice, 
  referringFromOffice, 
  isPreviouslyScanned, 
  scannedPatientInfo, 
  userId, 
  isLoading, 
  isAuthReady, 
  onStartReferral 
}) => (
  <div className="space-y-6">
    {/* Referring From Header */}
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <FileText size={16} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Referring From</p>
          <p className="font-semibold text-gray-900">{referringFromOffice.name}</p>
        </div>
      </div>
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <ChevronRight size={16} className="text-white" />
      </div>
    </div>

    {/* Main Referral Card */}
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
        
        {/* Office Address */}
        <p className="text-gray-600 mb-1">{referringToOffice.address}</p>
        
        {/* Office Phone */}
        {referringToOffice.phone && (
          <p className="text-gray-600 mb-4">{referringToOffice.phone}</p>
        )}
        
        {/* Welcome Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-medium">Welcome!</p>
          <p className="text-blue-700 text-sm">Click below to get started.</p>
        </div>
      </div>
    </div>

    {/* Previously Scanned Patient Info */}
    {isPreviouslyScanned && scannedPatientInfo && (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="font-semibold text-amber-800 mb-1">This QR code has been previously scanned.</p>
        <p className="text-amber-700 text-sm">
          Associated with patient: <span className="font-bold">{scannedPatientInfo.firstNameInitial}. {scannedPatientInfo.lastNameInitial}. ({scannedPatientInfo.birthYear})</span>
        </p>
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
        "Start Referral"
      )}
    </button>

    {/* User ID Footer */}
    <div className="text-center">
      <p className="text-xs text-gray-500">
        User ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{userId || 'Loading...'}</span>
      </p>
    </div>
  </div>
); 
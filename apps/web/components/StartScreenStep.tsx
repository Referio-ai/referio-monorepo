import React from 'react';
import { UploadCloud, Camera, Loader2 } from 'lucide-react';
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
  <div className="text-center p-6">
    <UploadCloud size={64} className="mx-auto text-blue-500 mb-4" />
    <h1 className="text-3xl font-bold text-gray-800 mb-2">Dental Referral Submission</h1>
    
    <div className="my-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
      <p><span className="font-semibold text-gray-800">Referring To:</span> {referringToOffice}</p>
      <p><span className="font-semibold text-gray-800">Referring From:</span> {referringFromOffice}</p>
    </div>

    {isPreviouslyScanned && scannedPatientInfo && (
      <div className="my-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
        <p className="font-semibold">This QR code has been previously scanned.</p>
        <p>Associated with patient: <span className="font-bold">{scannedPatientInfo.firstNameInitial}. {scannedPatientInfo.lastNameInitial}. ({scannedPatientInfo.birthYear})</span></p>
      </div>
    )}

    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {isPreviouslyScanned ? "You can continue by uploading or reviewing documents for this patient." : "Welcome! Please start the referral process by clicking the button below."}
      <br/>
      Your User ID: <span className="font-mono text-xs bg-gray-100 p-1 rounded">{userId || 'Loading...'}</span>
    </p>
    <button
      onClick={onStartReferral}
      disabled={isLoading || !isAuthReady}
      className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold disabled:opacity-50 flex items-center justify-center mx-auto"
    >
      {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Camera size={20} className="mr-2" />}
      {isPreviouslyScanned ? "Continue Referral" : "Start New Referral"}
    </button>
  </div>
); 
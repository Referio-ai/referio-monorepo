'use client';

import React, { useState } from 'react';
import { Loader2, FileText, Shield, Image as ImageIcon, UploadCloud } from 'lucide-react';

import {Modal} from '@/components/Modal';
import {FileUpload} from '@/components/FileUpload'
import {StartScreenStep} from '@/components/StartScreenStep'
import {ReviewSubmitStep} from '@/components/ReviewSubmitStep'
import {GiftCardStep} from '@/components/GiftCardStep'
import {AppHeader} from '@/components/AppHeader'
import {ProgressBar} from '@/components/ProgressBar'
import {NavigationFooter} from '@/components/NavigationFooter'


import {
  TOTAL_UPLOAD_STEPS,
  DEMO_USER_ID,
  REFERRING_TO_OFFICE,
  REFERRING_FROM_OFFICE,
  ACCEPTED_FILE_TYPES,
  MODAL_MESSAGES,
  type ModalType,
  type GiftCardContactType,
  type ModalState
} from '@/constants';

// --- Type Definitions ---


interface PatientInfo {
  firstNameInitial: string;
  lastNameInitial: string;
  birthYear: string;
}


// --- Helper Functions ---
const generateId = () => crypto.randomUUID();

// --- Main App Component ---
export const QRScan = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [referralId, setReferralId] = useState<string | null>(null);
  const [userId] = useState<string>(DEMO_USER_ID);
  const [isAuthReady] = useState(true);
  
  const [referralFormFiles, setReferralFormFiles] = useState<File[]>([]);
  const [insuranceCardFiles, setInsuranceCardFiles] = useState<File[]>([]);
  const [xrayFiles, setXrayFiles] = useState<File[]>([]);
  const [otherDocsFiles, setOtherDocsFiles] = useState<File[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'info' 
  });
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [giftCardRecipient, setGiftCardRecipient] = useState('');
  const [giftCardContactType, setGiftCardContactType] = useState<GiftCardContactType>('email');

  const [referringToOffice] = useState(REFERRING_TO_OFFICE);
  const [referringFromOffice] = useState(REFERRING_FROM_OFFICE);
  const [scannedPatientInfo, setScannedPatientInfo] = useState<PatientInfo | null>(null);
  const [isPreviouslyScanned, setIsPreviouslyScanned] = useState(false);

  const handleStartReferral = async () => {
    setIsLoading(true);
    try {
      const newReferralId = generateId();
      setReferralId(newReferralId);
      
      // Simulate previously scanned patient for demo
      if (Math.random() < 0.5) {
        setScannedPatientInfo({
          firstNameInitial: "J",
          lastNameInitial: "D",
          birthYear: "1985"
        });
        setIsPreviouslyScanned(true);
      }
      
      setCurrentStep(1);
    } catch (error) {
      setModal(MODAL_MESSAGES.ERROR.START_REFERRAL);
    }
    setIsLoading(false);
  };

  const handleSubmitReferral = async () => {
    if (referralFormFiles.length === 0) {
      setModal(MODAL_MESSAGES.ERROR.MISSING_REFERRAL_FORM);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setModal(MODAL_MESSAGES.SUCCESS.REFERRAL_SUBMITTED);
      
      if (Math.random() < 0.5) {
        setShowGiftCard(true);
        setCurrentStep(TOTAL_UPLOAD_STEPS + 1);
      } else {
        setTimeout(resetFormStateAndReturnToStart, 3000);
      }
    } catch (error) {
      setModal(MODAL_MESSAGES.ERROR.SUBMISSION);
    }
    setIsLoading(false);
  };

  const handleGiftCardSubmit = async () => {
    if (!giftCardRecipient.trim()) {
      setModal(MODAL_MESSAGES.INPUT_REQUIRED.GIFT_CARD(giftCardContactType));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setModal(MODAL_MESSAGES.SUCCESS.GIFT_CARD);
      
      setShowGiftCard(false);
      setTimeout(resetFormStateAndReturnToStart, 3000);
    } catch (error) {
      setModal(MODAL_MESSAGES.ERROR.GIFT_CARD);
    }
    setIsLoading(false);
  };

  const resetFormStateAndReturnToStart = () => {
    setCurrentStep(0);
    setReferralId(null);
    setReferralFormFiles([]);
    setInsuranceCardFiles([]);
    setXrayFiles([]);
    setOtherDocsFiles([]);
    setShowGiftCard(false);
    setGiftCardRecipient('');
    setScannedPatientInfo(null);
    setIsPreviouslyScanned(false);
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const renderCurrentStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <StartScreenStep 
          referringToOffice={referringToOffice}
          referringFromOffice={referringFromOffice}
          isPreviouslyScanned={isPreviouslyScanned}
          scannedPatientInfo={scannedPatientInfo}
          userId={userId}
          isLoading={isLoading}
          isAuthReady={isAuthReady}
          onStartReferral={handleStartReferral}
        />;
      case 1: 
        return <FileUpload
          title="Step 1: Upload Referral Form(s)"
          description="Take a picture or upload the referral form. You can upload multiple images."
          icon={<FileText size={20} className="text-blue-500" />}
          onFilesSelected={setReferralFormFiles}
          acceptedFileTypes={ACCEPTED_FILE_TYPES.IMAGES}
          multiple={true}
          existingFilesCount={referralFormFiles.length}
        />;
      case 2: 
        return <FileUpload
          title="Step 2: Upload Insurance Card(s) (Optional)"
          description="Take a picture or upload images of the patient's insurance member ID card(s)."
          icon={<Shield size={20} className="text-green-500" />}
          onFilesSelected={setInsuranceCardFiles}
          acceptedFileTypes={ACCEPTED_FILE_TYPES.IMAGES}
          multiple={true}
          existingFilesCount={insuranceCardFiles.length}
        />;
      case 3: 
        return <FileUpload
          title="Step 3: Upload X-ray Radiograph(s) (Optional)"
          description="Take a picture or upload X-ray images."
          icon={<ImageIcon size={20} className="text-purple-500" />}
          onFilesSelected={setXrayFiles}
          acceptedFileTypes={ACCEPTED_FILE_TYPES.IMAGES}
          multiple={true}
          existingFilesCount={xrayFiles.length}
        />;
      case 4: 
        return <FileUpload
          title="Step 4: Upload Other Documentation (Optional)"
          description="Upload any other relevant documents (PDF, images, Word/Text files)."
          icon={<UploadCloud size={20} className="text-yellow-500" />}
          onFilesSelected={setOtherDocsFiles}
          acceptedFileTypes={ACCEPTED_FILE_TYPES.DOCUMENTS}
          multiple={true}
          existingFilesCount={otherDocsFiles.length}
        />;
      case 5: 
        return <ReviewSubmitStep 
          referralFormData={referralFormFiles}
          insuranceCardData={insuranceCardFiles}
          xrayData={xrayFiles}
          otherDocsData={otherDocsFiles}
        />;
      case 6:
        if (!showGiftCard) return null;
        return <GiftCardStep
          giftCardRecipient={giftCardRecipient}
          setGiftCardRecipient={setGiftCardRecipient}
          giftCardContactType={giftCardContactType}
          setGiftCardContactType={setGiftCardContactType}
          isLoading={isLoading}
          onGiftCardSubmit={handleGiftCardSubmit}
        />;
      default:
        return <p>Unknown step.</p>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-50 shadow-2xl rounded-xl overflow-hidden p-2">
      <AppHeader currentStep={currentStep} referralId={referralId} />
        
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_UPLOAD_STEPS} />

        <main className="p-4 sm:p-8">
          {renderCurrentStepComponent()}
        </main>

        <NavigationFooter 
          currentStep={currentStep}
          totalSteps={TOTAL_UPLOAD_STEPS}
          isLoading={isLoading}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onSubmitReferral={handleSubmitReferral}
          referralFormDataLength={referralFormFiles.length}
        />
          <footer className="mt-8 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Dental Referral Services. User ID: {userId}</p>
      </footer>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        type={modal.type}
      >
        <p>{modal.message}</p>
      </Modal>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <Loader2 size={48} className="text-white animate-spin" />
        </div>
      )}
    
    </div>
  );
};


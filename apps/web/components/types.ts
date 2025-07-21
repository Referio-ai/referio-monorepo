export interface FilePreview {
  name: string;
  url?: string;
  type: 'image' | 'other';
}

export interface FileMetadata {
  fileName: string;
  fileType: string;
  size: number;
  uploadedAt: Date;
}

export interface PatientInfo {
  firstNameInitial: string;
  lastNameInitial: string;
  birthYear: string;
}

export interface OfficeInfo {
  name: string;
  address: string;
  phone: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'success' | 'error';
}

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes: string;
  multiple?: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  existingFilesCount?: number;
  files?: File[];
  actionButtonText?: string;
  actionButtonOnClick?: () => void;
  documentType?: string;
}

export interface StartScreenStepProps {
  referringToOffice: OfficeInfo;
  referringFromOffice: OfficeInfo;
  isPreviouslyScanned: boolean;
  scannedPatientInfo: PatientInfo | null;
  userId: string | null;
  isLoading: boolean;
  isAuthReady: boolean;
  onStartReferral: () => void;
}

export interface ReviewSubmitStepProps {
  referralFormData: File[];
  insuranceCardData: File[];
  xrayData: File[];
  otherDocsData: File[];
  onSubmitReferral: () => void;
}

export interface GiftCardStepProps {
  giftCardRecipient: string;
  setGiftCardRecipient: (value: string) => void;
  giftCardContactType: 'email' | 'phone';
  setGiftCardContactType: (value: 'email' | 'phone') => void;
  isLoading: boolean;
  onGiftCardSubmit: () => void;
}

export interface AppHeaderProps {
  currentStep: number;
  referralId: string | null;
  prevStep: () => void;
  title?: string;
  showBackButton?: boolean;
}

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export interface NavigationFooterProps {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmitReferral: () => void;
  referralFormDataLength: number;
}

export interface ReferralFormUploadProps {
  onFilesSelected: (files: File[]) => void;
  onUploadComplete?: (uploadedFiles: File[]) => void;
  referralId?: string;
  existingFilesCount?: number;
  isRequired?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  isPreviouslyScanned?: boolean;
  scannedPatientInfo?: PatientInfo | null;
  lastScannedDate?: string | null;
  nextStep: () => void;
  documentType?: string;
} 
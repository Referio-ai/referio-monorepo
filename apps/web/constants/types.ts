// Modal Types
export type ModalType = 'info' | 'success' | 'error';

// Gift Card Types
export type GiftCardContactType = 'email' | 'phone';

// Modal State Type
export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: ModalType;
} 
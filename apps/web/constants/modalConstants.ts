import { ModalType, GiftCardContactType } from './types';

// Modal Messages
export const MODAL_MESSAGES = {
  ERROR: {
    START_REFERRAL: {
      isOpen: true,
      title: 'Error',
      message: 'Could not start new referral. Please try again.',
      type: 'error' as ModalType
    },
    MISSING_REFERRAL_FORM: {
      isOpen: true,
      title: 'Missing Information',
      message: 'Please upload at least one referral form document.',
      type: 'error' as ModalType
    },
    SUBMISSION: {
      isOpen: true,
      title: 'Submission Error',
      message: 'Failed to submit referral. Please try again.',
      type: 'error' as ModalType
    },
    GIFT_CARD: {
      isOpen: true,
      title: 'Error',
      message: 'Failed to save gift card information. Please try again.',
      type: 'error' as ModalType
    }
  },
  SUCCESS: {
    REFERRAL_SUBMITTED: {
      isOpen: true,
      title: 'Referral Submitted!',
      message: 'Your referral has been successfully submitted.',
      type: 'success' as ModalType
    },
    GIFT_CARD: {
      isOpen: true,
      title: 'Thank You!',
      message: 'Your gift card information has been saved. You will receive it shortly.',
      type: 'success' as ModalType
    }
  },
  INPUT_REQUIRED: {
    GIFT_CARD: (contactType: GiftCardContactType) => ({
      isOpen: true,
      title: 'Input Required',
      message: `Please enter your ${contactType}.`,
      type: 'error' as ModalType
    })
  }
} as const; 
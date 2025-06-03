import React from 'react';
import { Gift, Send, Loader2 } from 'lucide-react';
import { GiftCardStepProps } from './types';

export const GiftCardStep: React.FC<GiftCardStepProps> = ({ 
  giftCardRecipient, 
  setGiftCardRecipient, 
  giftCardContactType, 
  setGiftCardContactType, 
  isLoading, 
  onGiftCardSubmit 
}) => (
  <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-lg shadow">
    <div className="flex items-center justify-center mb-4">
      <Gift size={48} className="text-yellow-500 mr-3" />
      <h2 className="text-2xl font-semibold text-yellow-700">Congratulations!</h2>
    </div>
    <p className="text-yellow-600 text-center mb-2">Thank you for your referral! You've earned a $10 Starbucks gift card.</p>
    <p className="text-sm text-yellow-600 text-center mb-6">Please provide your phone number or email to receive your reward.</p>
    
    <div className="mb-4">
      <label htmlFor="contactType" className="block text-sm font-medium text-yellow-700 mb-1">Receive gift card via:</label>
      <select 
        id="contactType"
        value={giftCardContactType}
        onChange={(e) => setGiftCardContactType(e.target.value as 'email' | 'phone')}
        className="w-full p-2 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 bg-white"
      >
        <option value="email">Email</option>
        <option value="phone">Phone Number</option>
      </select>
    </div>

    <div className="mb-6">
      <label htmlFor="giftCardRecipient" className="block text-sm font-medium text-yellow-700 mb-1">
        Your {giftCardContactType === 'email' ? 'Email Address' : 'Phone Number'}
      </label>
      <input
        type={giftCardContactType === 'email' ? 'email' : 'tel'}
        id="giftCardRecipient"
        value={giftCardRecipient}
        onChange={(e) => setGiftCardRecipient(e.target.value)}
        placeholder={giftCardContactType === 'email' ? 'you@example.com' : 'e.g., (555) 123-4567'}
        className="w-full p-2 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 bg-white"
      />
    </div>
    <button
      onClick={onGiftCardSubmit}
      disabled={isLoading}
      className="w-full bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600 transition-colors font-semibold flex items-center justify-center disabled:opacity-50"
    >
      {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
      Claim Gift Card
    </button>
  </div>
); 
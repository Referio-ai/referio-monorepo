import React from 'react';
import { XCircle } from 'lucide-react';
import { ModalProps } from './types';

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, type = 'info' }) => {
  if (!isOpen) return null;

  let bgColor = 'bg-blue-500';
  if (type === 'success') bgColor = 'bg-green-500';
  if (type === 'error') bgColor = 'bg-red-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className={`flex items-center justify-between pb-3 mb-3 border-b`}>
          <h3 className={`text-xl font-semibold ${type === 'error' ? 'text-red-600' : type === 'success' ? 'text-green-600' : 'text-gray-700'}`}>{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle size={24} />
          </button>
        </div>
        <div>{children}</div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className={`${bgColor} text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 
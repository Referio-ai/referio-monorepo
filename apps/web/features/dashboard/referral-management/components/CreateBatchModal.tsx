import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { Facility, BatchForm } from '../types';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  facilities: Facility[];
  form: BatchForm;
  onFormChange: (form: BatchForm) => void;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  facilities,
  form,
  onFormChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Create New Batch
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Outbound Facility
              </label>
              <select
                value={form.outboundFacility}
                onChange={(e) => onFormChange({...form, outboundFacility: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select facility...</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Inbound Facility
              </label>
              <select
                value={form.inboundFacility}
                onChange={(e) => onFormChange({...form, inboundFacility: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select facility...</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Referrals
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.numberOfReferrals}
                onChange={(e) => onFormChange({...form, numberOfReferrals: parseInt(e.target.value) || 1})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => onFormChange({...form, description: e.target.value})}
                placeholder="Add notes about this batch..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Generate Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
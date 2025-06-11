import React from 'react';
import { Filter, Printer } from 'lucide-react';

interface Batch {
  id: string;
  totalReferrals: number;
}

interface ReferralFiltersProps {
  batches: Batch[];
  selectedBatchId: string | null;
  onBatchSelect: (batchId: string | null) => void;
  onPrintBatch: () => void;
}

export const ReferralFilters: React.FC<ReferralFiltersProps> = ({
  batches,
  selectedBatchId,
  onBatchSelect,
  onPrintBatch,
}) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-semibold text-gray-700">Filter by Batch:</label>
          <select
            value={selectedBatchId || ''}
            onChange={(e) => onBatchSelect(e.target.value || null)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">All Batches</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>
                {batch.id} ({batch.totalReferrals} referrals)
              </option>
            ))}
          </select>
        </div>
        {selectedBatchId && (
          <button
            onClick={onPrintBatch}
            className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            <Printer className="w-4 h-4" />
            Print Batch QR Codes
          </button>
        )}
      </div>
    </div>
  );
}; 
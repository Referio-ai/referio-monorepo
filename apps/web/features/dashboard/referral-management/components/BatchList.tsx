import React from 'react';
import { ChevronRight, Printer, Trash2, Package } from 'lucide-react';
import { Batch } from '../types';

interface BatchListProps {
  batches: Batch[];
  onViewReferrals: (batchId: string) => void;
  onPrintBatch: (batch: Batch) => void;
  onDeleteBatch: (batchId: string) => void;
}

export const BatchList: React.FC<BatchListProps> = ({
  batches,
  onViewReferrals,
  onPrintBatch,
  onDeleteBatch,
}) => {
  if (batches.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 mb-6">No batches created yet.</p>
        <button
          onClick={() => onViewReferrals('')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
        >
          Create Your First Batch
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Batch ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Outbound → Inbound
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Referrals
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Scanned QR
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {batches.map((batch) => (
            <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-mono text-sm font-medium text-gray-900">{batch.id}</span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 max-w-xs truncate" title={batch.description}>
                  {batch.description || '-'}
                </p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-blue-600">{batch.outboundFacility.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-purple-600">{batch.inboundFacility.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{batch.totalReferrals}</span>
                  <span className="text-xs text-gray-500">referrals</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{batch.usedReferrals || 0}</span>
                  <span className="text-xs text-gray-500">/ {batch.totalReferrals}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(batch.usedReferrals || 0) / batch.totalReferrals * 100}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(batch.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewReferrals(batch.id)}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    View Referrals
                  </button>
                  <button
                    onClick={() => onPrintBatch(batch)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Print QR Codes"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteBatch(batch.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Batch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 
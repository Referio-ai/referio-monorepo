import React from 'react';
import { QrCode, Download, Copy, Check, Trash2, Filter, Printer, ChevronDown } from 'lucide-react';
import { PaginationWrapper } from '@/components/PaginationWrapper';

interface Facility {
  id: string;
  name: string;
}

interface Referral {
  id: string;
  url: string;
  qrCode: string;
  status: string;
}

interface Batch {
  id: string;
  referral_batch_id: string;
  referral_batch_prefix: string;
  referral_batch_size: number;
  referral_outbound_facility_id: string;
  referral_inbound_facility_id: string;
  outboundFacility?: Facility;
  inboundFacility?: Facility;
  referrals?: Referral[];
  createdAt?: string;
  totalReferrals?: number;
  usedReferrals?: number;
  description?: string;
}

interface ExtendedReferral extends Referral {
  batchId: string;
  outboundFacility: Facility;
  inboundFacility: Facility;
  createdAt: string;
}

interface ReferralListProps {
  batches: Batch[];
  selectedBatchId: string | null;
  setSelectedBatchId: (id: string | null) => void;
  copiedId: string | null;
  copyToClipboard: (url: string, id: string) => void;
  downloadQRCode: (qrCode: string, id: string) => void;
  deleteReferral: (batchPrefix: string, referralId: string) => void;
  showPrintPreviewModal: (batch: Batch) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  totalItems: number;
}

const ReferralList: React.FC<ReferralListProps> = ({
  batches,
  selectedBatchId,
  setSelectedBatchId,
  copiedId,
  copyToClipboard,
  downloadQRCode,
  deleteReferral,
  showPrintPreviewModal,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems,
}) => {
  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

  // Get all referrals from all batches
  const getAllReferrals = (): ExtendedReferral[] => {
    const allReferrals: ExtendedReferral[] = [];
    batches.forEach(batch => {
      if (batch.referrals && batch.outboundFacility && batch.inboundFacility && batch.createdAt) {
        batch.referrals.forEach(referral => {
          allReferrals.push({
            ...referral,
            batchId: batch.referral_batch_prefix,
            outboundFacility: batch.outboundFacility!,
            inboundFacility: batch.inboundFacility!,
            createdAt: batch.createdAt!
          });
        });
      }
    });
    return allReferrals;
  };

  // Get filtered referrals
  const getFilteredReferrals = (): ExtendedReferral[] => {
    if (!selectedBatchId) return getAllReferrals();
    
    const batch = batches.find(b => b.referral_batch_prefix === selectedBatchId);
    if (!batch || !batch.referrals || !batch.outboundFacility || !batch.inboundFacility || !batch.createdAt) return [];
    
    return batch.referrals.map(referral => ({
      ...referral,
      batchId: batch.referral_batch_prefix,
      outboundFacility: batch.outboundFacility!,
      inboundFacility: batch.inboundFacility!,
      createdAt: batch.createdAt!
    }));
  };

  // Get paginated referrals
  const getPaginatedReferrals = (): ExtendedReferral[] => {
    const filteredReferrals = getFilteredReferrals();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredReferrals.slice(startIndex, endIndex);
  };

  const totalReferrals = totalItems;
  const paginatedReferrals = getPaginatedReferrals();
  const totalPages = Math.ceil(totalReferrals / pageSize) || 1;

  const handlePageSizeChange = (newPageSize: number) => {
    onPageSizeChange(newPageSize);
    onPageChange(1); // Reset to first page when page size changes
  };

  return (
    <div>
      {/* Filter by Batch */}
      <div className="p-6 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-semibold text-gray-700">Filter by Batch:</label>
            <select
              value={selectedBatchId || ''}
              onChange={(e) => {
                setSelectedBatchId(e.target.value || null);
                onPageChange(1); // Reset to first page when filter changes
              }}
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
              onClick={() => {
                const batch = batches.find(b => b.id === selectedBatchId);
                if (batch) showPrintPreviewModal(batch);
              }}
              className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <Printer className="w-4 h-4" />
              Print Batch QR Codes
            </button>
          )}
        </div>
      </div>

      {/* Total Count & Pagination Controls */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Total Count Display */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              <span className="text-lg font-semibold text-gray-900">
                Total Referrals: {totalReferrals}
              </span>
            </div>
            {selectedBatchId && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Filtered by batch: {selectedBatchId}
              </span>
            )}
          </div>

          {/* Pagination Info & Page Size Selector */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {paginatedReferrals.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, totalReferrals)} of {totalReferrals} referrals
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>
      </div>

      {totalReferrals === 0 ? (
        <div className="p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <QrCode className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500">No referrals found. {selectedBatchId ? 'Try selecting a different batch.' : 'Create a batch to generate referrals.'}</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                    Referral ID
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px] hidden md:table-cell">
                    Batch ID
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                    Facilities
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px] hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[160px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-gray-900 truncate max-w-[100px] lg:max-w-none" title={referral.id}>
                            {referral.id}
                          </span>
                          <button
                            onClick={() => copyToClipboard(referral.url, referral.id)}
                            className="p-1 lg:p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            title="Copy URL"
                          >
                            {copiedId === referral.id ? (
                              <Check className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <span className="text-xs text-gray-500 md:hidden block mt-1" title={referral.batchId}>
                          Batch: {referral.batchId}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="text-sm text-gray-600">{referral.batchId}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-sm min-w-0">
                        <div className="font-medium text-blue-600 truncate max-w-[120px] lg:max-w-none" title={referral.outboundFacility?.name}>
                          {referral.outboundFacility?.name}
                        </div>
                        <div className="text-gray-500 truncate max-w-[120px] lg:max-w-none">
                          → <span className="text-purple-600" title={referral.inboundFacility?.name}>
                            {referral.inboundFacility?.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className="px-2 lg:px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white">
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 lg:gap-2">
                        <button
                          onClick={() => downloadQRCode(referral.qrCode, referral.id)}
                          className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-medium whitespace-nowrap"
                          title="Download QR Code"
                        >
                          <Download className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span className="hidden lg:inline">Download QR</span>
                          <span className="lg:hidden">QR</span>
                        </button>
                        <button
                          onClick={() => deleteReferral(referral.batchId, referral.id)}
                          className="p-1.5 lg:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Referral"
                        >
                          <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Enhanced Pagination */}
          {totalReferrals > pageSize && (
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • {totalReferrals.toLocaleString()} total referrals
                </div>
                <PaginationWrapper
                  currentPage={currentPage}
                  totalItems={totalReferrals}
                  itemsPerPage={pageSize}
                  onPageChange={onPageChange}
                  maxVisiblePages={5}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferralList; 
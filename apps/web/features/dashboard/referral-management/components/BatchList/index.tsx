import React from 'react';
import { Package, Filter, ChevronRight, Printer, Trash2, Plus } from 'lucide-react';
import { Facility as ApiFacility } from '@/lib/api/client/models/Facility';
import { ReferralBatch } from '@/lib/api/client/models/ReferralBatch';

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

interface BatchFilters {
  outboundFacility: string;
  inboundFacility: string;
}

interface BatchListProps {
  batches: Batch[];
  facilities: Facility[];
  batchFilters: BatchFilters;
  setBatchFilters: (filters: BatchFilters) => void;
  setShowCreateModal: (show: boolean) => void;
  showPrintPreviewModal: (batch: Batch) => void;
  deleteBatch: (batchPrefix: string) => void;
  setActiveTab: (tab: string) => void;
  setSelectedBatchId: (id: string) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  totalItems: number;
}

const BatchList: React.FC<BatchListProps> = ({
  batches,
  facilities,
  batchFilters,
  setBatchFilters,
  setShowCreateModal,
  showPrintPreviewModal,
  deleteBatch,
  setActiveTab,
  setSelectedBatchId,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems,
}) => {
  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

  const getFilteredBatches = () => {
    return batches.filter(batch => {
      const matchesOutbound = !batchFilters.outboundFacility || batch.outboundFacility?.id === batchFilters.outboundFacility;
      const matchesInbound = !batchFilters.inboundFacility || batch.inboundFacility?.id === batchFilters.inboundFacility;
      return matchesOutbound && matchesInbound;
    });
  };

  const getPaginatedBatches = () => {
    const filteredBatches = getFilteredBatches();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredBatches.slice(startIndex, endIndex);
  };

  const filteredBatches = getFilteredBatches();
  const paginatedBatches = getPaginatedBatches();
  const totalPages = Math.ceil(filteredBatches.length / pageSize) || 1;

  const handlePageSizeChange = (newPageSize: number) => {
    onPageSizeChange(newPageSize);
    onPageChange(1); // Reset to first page when page size changes
  };

  return (
    <div>
      {/* Batch Filters */}
      {batches.length > 0 && (
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-semibold text-gray-700">Filter by:</label>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Outbound:</label>
              <select
                value={batchFilters.outboundFacility}
                onChange={(e) => setBatchFilters({...batchFilters, outboundFacility: e.target.value})}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Facilities</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Inbound:</label>
              <select
                value={batchFilters.inboundFacility}
                onChange={(e) => setBatchFilters({...batchFilters, inboundFacility: e.target.value})}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Facilities</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
            
            {(batchFilters.outboundFacility || batchFilters.inboundFacility) && (
              <button
                onClick={() => setBatchFilters({ outboundFacility: '', inboundFacility: '' })}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
      
      {batches.length === 0 ? (
        <div className="p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-6">No batches created yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Create Your First Batch
          </button>
        </div>
                ) : filteredBatches.length === 0 ? (
        <div className="p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Filter className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-6">No batches match the selected filters.</p>
          <button
            onClick={() => setBatchFilters({ outboundFacility: '', inboundFacility: '' })}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full min-w-max table-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                    Batch Prefix
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                    Outbound → Inbound
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px] hidden lg:table-cell">
                    Progress
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px] hidden xl:table-cell">
                    Created
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="min-w-0">
                        <span className="font-mono text-sm font-medium text-gray-900 block truncate">{batch.referral_batch_prefix}</span>
                        <span className="text-xs text-gray-500 md:hidden block mt-1">{batch.totalReferrals} referrals</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-sm">
                          <span className="font-medium text-blue-600 truncate max-w-[80px] lg:max-w-none" title={batch.outboundFacility?.name}>
                            {batch.outboundFacility?.name}
                          </span>
                          <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-purple-600 truncate max-w-[80px] lg:max-w-none" title={batch.inboundFacility?.name}>
                            {batch.inboundFacility?.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{batch.usedReferrals || 0}</span>
                        <span className="text-xs text-gray-500">/ {batch.totalReferrals}</span>
                        <div className="w-16 xl:w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(batch.usedReferrals || 0) / (batch.totalReferrals || 1) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                      {batch.createdAt ? new Date(batch.createdAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 lg:gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('referrals');
                            setSelectedBatchId(batch.referral_batch_id);
                          }}
                          className="px-2 lg:px-3 py-1.5 text-xs lg:text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium whitespace-nowrap"
                        >
                          <span className="hidden lg:inline">View Referrals</span>
                          <span className="lg:hidden">View</span>
                        </button>
                        <button
                          onClick={() => showPrintPreviewModal(batch)}
                          className="p-1.5 lg:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Print QR Codes"
                        >
                          <Printer className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button
                          onClick={() => deleteBatch(batch.referral_batch_id)}
                          className="p-1.5 lg:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Batch"
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
          
          {/* Pagination Controls */}
          {filteredBatches.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Show:</label>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {PAGE_SIZE_OPTIONS.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => onPageChange(page)}
                              className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                                page === currentPage
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2 py-1 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => onPageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchList; 
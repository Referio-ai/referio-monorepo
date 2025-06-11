import React from 'react';
import { X, Eye, Download, Printer } from 'lucide-react';
import { Batch } from '../types';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onDownload: () => void;
  batch: Batch | null;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  onPrint,
  onDownload,
  batch,
}) => {
  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Print Preview - {batch.id}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden bg-gray-100 p-4">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <div className="bg-white shadow-xl mx-auto rounded-lg max-w-5xl">
              <div className="sticky top-0 bg-white z-10 px-12 pt-12 pb-8 rounded-t-lg">
                <div className="text-center pb-8 border-b-2 border-gray-200">
                  <h1 className="text-3xl font-bold mb-4 text-gray-800">Referral QR Codes</h1>
                  <div className="space-y-2 text-gray-600">
                    <p className="text-lg"><strong className="font-semibold">Batch ID:</strong> {batch.id}</p>
                    {batch.description && (
                      <p className="text-lg"><strong className="font-semibold">Description:</strong> {batch.description}</p>
                    )}
                    <p className="text-lg"><strong className="font-semibold">Route:</strong> {batch.outboundFacility.name} → {batch.inboundFacility.name}</p>
                    <p className="text-lg"><strong className="font-semibold">Generated:</strong> {new Date(batch.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-12 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {batch.referrals.map((referral) => (
                    <div key={referral.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative bg-white border-2 border-gray-200 p-6 text-center rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                        <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                          <div 
                            className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                            dangerouslySetInnerHTML={{ __html: referral.qrCode }}
                          />
                        </div>
                        <p className="text-sm font-mono font-bold text-gray-800 break-all mb-3 bg-gray-100 px-3 py-2 rounded-lg">{referral.id}</p>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong className="font-semibold text-blue-600">From:</strong> {batch.outboundFacility.name}</p>
                          <p><strong className="font-semibold text-purple-600">To:</strong> {batch.inboundFacility.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white px-12 pt-8 pb-12 rounded-b-lg">
                <div className="text-center pt-8 border-t border-gray-200">
                  <p className="text-gray-500">
                    Generated on {new Date().toLocaleString()} | Total QR Codes: {batch.referrals.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-between bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-all font-medium"
          >
            Close
          </button>
          <div className="flex gap-4">
            <button
              onClick={onDownload}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download HTML
            </button>
            <button
              onClick={onPrint}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print QR Codes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
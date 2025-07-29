import React from 'react';
import { X, Eye, Printer } from 'lucide-react';
import { Batch } from '../types';
import { useReferralsForQrPrinting } from '@/lib/hooks/referrals';
import { QRCodeSVG } from 'qrcode.react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (qrPrintData: any) => void;
  batch: Batch | null;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  onPrint,
  batch,
}) => {
  const { data: qrPrintData } = useReferralsForQrPrinting({ batchPrefix: batch?.referral_batch_prefix || '' });
  
  if (!isOpen || !batch) return null;

  // Extract data from the QR print data
  const referrals = qrPrintData?.referrals || [];
  const totalReferrals = qrPrintData?.total_referrals || 0;
  const batchPrefix = qrPrintData?.batch_prefix || batch.referral_batch_prefix;
  const outboundFacilityName = qrPrintData?.outbound_facility_name || batch.outboundFacility?.name;
  const inboundFacilityName = qrPrintData?.inbound_facility_name || batch.inboundFacility?.name;
  const batchSize = qrPrintData?.batch_size || 0;

  const handlePrint = () => {
    onPrint(qrPrintData);
  };

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
                    <p className="text-lg"><strong className="font-semibold">Batch Prefix:</strong> {batchPrefix}</p>
                    {batch.description && (
                      <p className="text-lg"><strong className="font-semibold">Description:</strong> {batch.description}</p>
                    )}
                    <p className="text-lg"><strong className="font-semibold">Route:</strong> {outboundFacilityName || 'Unknown'} → {inboundFacilityName || 'Unknown'}</p>
                    <p className="text-lg"><strong className="font-semibold">Generated:</strong> {batch.createdAt ? new Date(batch.createdAt).toLocaleString() : 'Unknown'}</p>
                    <p className="text-lg"><strong className="font-semibold">Total QR Codes:</strong> {totalReferrals}</p>
                    <p className="text-lg"><strong className="font-semibold">Batch Size:</strong> {batchSize}</p>
                  </div>
                </div>
              </div>

              <div className="px-12 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {referrals.map((referral: any) => (
                    <div key={referral.referral_id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative bg-white border-2 p-6 text-center rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all">
                        <div className="mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                          <div className="w-full h-full flex items-center justify-center">
                            <QRCodeSVG
                              value={referral.qr_code_url}
                              size={200}
                              level="M"
                              bgColor="#ffffff"
                              fgColor="#1e293b"
                              includeMargin={true}
                              style={{
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                          <p><strong>Referral ID:</strong> {referral.referral_slug}</p>
                          <p><strong>Status:</strong> {referral.status || 'Pending'}</p>
                          {referral.scanned && (
                            <p className="text-green-600"><strong>✓ Scanned</strong></p>
                          )}
                          {referral.submitted && (
                            <p className="text-blue-600"><strong>✓ Submitted</strong></p>
                          )}
                          <p><strong>Route:</strong> {referral.outbound_facility_name} → {referral.inbound_facility_name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white px-12 pt-8 pb-12 rounded-b-lg">
                <div className="text-center pt-8 border-t border-gray-200">
                  <p className="text-gray-500">
                    Generated on {new Date().toLocaleString()} | Total QR Codes: {totalReferrals} | Batch Size: {batchSize}
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
              onClick={handlePrint}
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
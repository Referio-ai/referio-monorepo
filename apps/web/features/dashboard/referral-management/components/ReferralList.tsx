import React from 'react';
import { Download, Trash2, Copy, Check, QrCode } from 'lucide-react';
import { Referral } from '../types';

interface ReferralListProps {
  referrals: Referral[];
  copiedId: string | null;
  onCopyUrl: (url: string, id: string) => void;
  onDownloadQR: (qrCode: string, id: string) => void;
  onDeleteReferral: (batchId: string, referralId: string) => void;
}

export const ReferralList: React.FC<ReferralListProps> = ({
  referrals,
  copiedId,
  onCopyUrl,
  onDownloadQR,
  onDeleteReferral,
}) => {
  if (referrals.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
          <QrCode className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500">No referrals found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Referral ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Batch ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Facilities
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {referrals.map((referral) => (
            <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-gray-900">{referral.id}</span>
                  <button
                    onClick={() => onCopyUrl(referral.url, referral.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === referral.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{referral.batchId}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">
                  <div className="font-medium text-blue-600">{referral.outboundFacility?.name}</div>
                  <div className="text-gray-500">→ <span className="text-purple-600">{referral.inboundFacility?.name}</span></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white">
                  {referral.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDownloadQR(referral.qrCode, referral.id)}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-medium"
                    title="Download QR Code"
                  >
                    <Download className="w-4 h-4" />
                    Download QR
                  </button>
                  <button
                    onClick={() => referral.batchId && onDeleteReferral(referral.batchId, referral.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Referral"
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
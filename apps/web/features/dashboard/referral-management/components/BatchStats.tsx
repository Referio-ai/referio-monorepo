import React from 'react';
import { Package, QrCode, Building, Calendar } from 'lucide-react';

interface BatchStatsProps {
  totalBatches: number;
  totalReferrals: number;
  activeFacilities: number;
  todaysBatches: number;
}

export const BatchStats: React.FC<BatchStatsProps> = ({
  totalBatches,
  totalReferrals,
  activeFacilities,
  todaysBatches,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex-1 min-w-[160px] text-white">
          <div>
            <p className="text-xs font-medium opacity-90 whitespace-nowrap">Total Batches</p>
            <p className="text-3xl font-bold">{totalBatches}</p>
          </div>
          <Package className="w-10 h-10 opacity-80" />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex-1 min-w-[160px] text-white">
          <div>
            <p className="text-xs font-medium opacity-90 whitespace-nowrap">Total Referrals</p>
            <p className="text-3xl font-bold">{totalReferrals}</p>
          </div>
          <QrCode className="w-10 h-10 opacity-80" />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex-1 min-w-[160px] text-white">
          <div>
            <p className="text-xs font-medium opacity-90 whitespace-nowrap">Active Facilities</p>
            <p className="text-3xl font-bold">{activeFacilities}</p>
          </div>
          <Building className="w-10 h-10 opacity-80" />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex-1 min-w-[160px] text-white">
          <div>
            <p className="text-xs font-medium opacity-90 whitespace-nowrap">Today's Batches</p>
            <p className="text-3xl font-bold">{todaysBatches}</p>
          </div>
          <Calendar className="w-10 h-10 opacity-80" />
        </div>
      </div>
    </div>
  );
}; 
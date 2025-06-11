import React from 'react';
import { Filter } from 'lucide-react';

interface Facility {
  id: string;
  name: string;
}

interface BatchFiltersProps {
  facilities: Facility[];
  filters: {
    outboundFacility: string;
    inboundFacility: string;
  };
  onFilterChange: (filters: { outboundFacility: string; inboundFacility: string }) => void;
}

export const BatchFilters: React.FC<BatchFiltersProps> = ({
  facilities,
  filters,
  onFilterChange,
}) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-gray-50/50">
      <div className="flex items-center gap-4 flex-wrap">
        <Filter className="w-5 h-5 text-gray-500" />
        <label className="text-sm font-semibold text-gray-700">Filter by:</label>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Outbound:</label>
          <select
            value={filters.outboundFacility}
            onChange={(e) => onFilterChange({ ...filters, outboundFacility: e.target.value })}
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
            value={filters.inboundFacility}
            onChange={(e) => onFilterChange({ ...filters, inboundFacility: e.target.value })}
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
        
        {(filters.outboundFacility || filters.inboundFacility) && (
          <button
            onClick={() => onFilterChange({ outboundFacility: '', inboundFacility: '' })}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}; 
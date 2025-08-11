import type { Facilitator, FacilitatorFilters } from '../types';

export const filterFacilitators = (
  facilitators: Facilitator[],
  filters: FacilitatorFilters
): Facilitator[] => {
  return facilitators.filter(facilitator => {
    const matchesSearch = facilitator.facilitator_full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         facilitator.facilitator_email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesFacility = filters.facility_id === 'all' || facilitator.facility_id === filters.facility_id;
    const matchesStatus = filters.status === 'all' || facilitator.facilitator_status === filters.status;
    
    return matchesSearch && matchesFacility && matchesStatus;
  });
}; 
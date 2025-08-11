import type { Facility as ApiFacility } from '@/lib/api/client/models/Facility';
import type { Facilitator as ApiFacilitator } from '@/lib/api/client/models/Facilitator';

export type Facility = ApiFacility;
export type Facilitator = ApiFacilitator;

export interface FacilitatorFilters {
  search: string;
  facility_id: string;
  status: string;
  facilitator_first_name: string;
  facilitator_last_name: string;
} 
export interface Facility {
  id: string;
  name: string;
}

export interface Referral {
  id: string;
  url: string;
  qrCode: string;
  status: string;
  batchId?: string;
  outboundFacility?: Facility;
  inboundFacility?: Facility;
  createdAt?: string;
}

export interface Batch {
  id: string;
  outboundFacility: Facility;
  inboundFacility: Facility;
  referrals: Referral[];
  createdAt: string;
  totalReferrals: number;
  usedReferrals: number;
  description: string;
}

export interface BatchForm {
  outboundFacility: string;
  inboundFacility: string;
  numberOfReferrals: number;
  description: string;
}

export interface BatchFilters {
  outboundFacility: string;
  inboundFacility: string;
} 
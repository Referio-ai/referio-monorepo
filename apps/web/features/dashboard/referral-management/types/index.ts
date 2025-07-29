import React from 'react';

export interface Facility {
  id: string;
  name: string;
}

export interface Referral {
  id: string;
  url: string;
  qrCode: React.ReactElement;
  status: string;
  batchId?: string;
  outboundFacility?: Facility;
  inboundFacility?: Facility;
  createdAt?: string;
}

export interface Batch {
  id: string;
  referral_batch_id?: string;
  referral_batch_prefix?: string;
  referral_batch_size?: number;
  referral_outbound_facility_id?: string;
  referral_inbound_facility_id?: string;
  outboundFacility?: Facility;
  inboundFacility?: Facility;
  referrals?: Referral[];
  createdAt?: string;
  totalReferrals?: number;
  usedReferrals?: number;
  description?: string;
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
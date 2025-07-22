// Types
export type ReferralStatus = 'new' | 'active' | 'archive';
export type ReferralPriority = 'normal' | 'urgent' | 'overdue';
export type ReferralSortOption = 'date-newest' | 'date-oldest' | 'patient-name' | 'priority';
export type ReferralSearchFilter = 'patient' | 'dob' | 'phone' | 'doctor' | 'practice';
export type ReferralDocument = {
  document_id: string;
  created_at: string;
  source: string;
  document_category: string;
  signed_url: string;
}

export interface Referral {
  id: number;
  patientName: string;
  age: number;
  dateOfBirth: string;
  phone: string;
  referredBy: string;
  practice: string;
  dateReceived: string;
  status: ReferralStatus;
  priority: ReferralPriority;
  insurance: string;
  memberId: string;
  reason: string;
  hasXrays: boolean;
  hasInsurance: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  completedDate?: string;
  documents: ReferralDocument[];
}

export interface NewReferralFormData {
  patientName: string;
  patientAge: string;
  patientPhone: string;
  patientEmail: string;
  referringDoctor: string;
  referringPractice: string;
  reason: string;
  insurance: string;
  insuranceId: string;
  notes: string;
}

// Constants
export const REFERRAL_STATUSES: ReferralStatus[] = ['new', 'active', 'archive'];
export const REFERRAL_PRIORITIES: ReferralPriority[] = ['normal', 'urgent', 'overdue'];

export const STATUS_BADGE_STYLES = {
  new: 'bg-green-100 text-green-700',
  active: 'bg-blue-200 text-blue-700',
  archive: 'bg-gray-200 text-gray-700',
} as const;

export const PRIORITY_BADGE_STYLES = {
  normal: 'bg-green-100 text-green-700',
  urgent: 'bg-orange-200 text-orange-700',
  overdue: 'bg-red-200 text-red-700',
} as const;

export const STATUS_LABELS = {
  new: 'New',
  active: 'Active',
  archive: 'Archive',
} as const;

export const PRIORITY_LABELS = {
  normal: 'New',
  urgent: 'Urgent',
  overdue: 'Overdue',
} as const;

export const SORT_OPTIONS = [
  { value: 'date-newest', label: 'Date (Newest)' },
  { value: 'date-oldest', label: 'Date (Oldest)' },
  { value: 'patient-name', label: 'Patient Name' },
  { value: 'priority', label: 'Priority' },
] as const;

export const SEARCH_FILTER_OPTIONS = [
  { value: 'patient', label: 'Patient' },
  { value: 'dob', label: 'DOB' },
  { value: 'phone', label: 'Phone' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'practice', label: 'Practice' },
] as const;

export const DEFAULT_FORM_DATA: NewReferralFormData = {
  patientName: '',
  patientAge: '',
  patientPhone: '',
  patientEmail: '',
  referringDoctor: '',
  referringPractice: '',
  reason: '',
  insurance: '',
  insuranceId: '',
  notes: '',
};

// Sample data (in a real app, this would come from an API)
export const SAMPLE_REFERRALS: Referral[] = [
  {
    id: 1,
    patientName: "Sarah Johnson",
    age: 32,
    dateOfBirth: "January 15, 1993",
    phone: "(555) 123-4567",
    referredBy: "Dr. Michael Chen, DDS",
    practice: "Sunshine Dental Care",
    dateReceived: "April 22, 2025",
    status: "new",
    priority: "urgent",
    insurance: "Delta Dental Premier",
    memberId: "DDP78923456",
    reason: "Impacted wisdom teeth extraction",
    hasXrays: true,
    hasInsurance: true,
    documents: []
  },
  {
    id: 2,
    patientName: "Robert Williams",
    age: 45,
    dateOfBirth: "March 8, 1980",
    phone: "(555) 234-5678",
    referredBy: "Dr. Amanda Lee, DDS",
    practice: "City Center Dental",
    dateReceived: "April 20, 2025",
    status: "active",
    priority: "normal",
    insurance: "Cigna Dental PPO",
    memberId: "CDP45678912",
    reason: "Root canal treatment",
    hasXrays: true,
    hasInsurance: true,
    documents: []
  },
  {
    id: 3,
    patientName: "Emily Rodriguez",
    age: 28,
    dateOfBirth: "September 12, 1997",
    phone: "(555) 345-6789",
    referredBy: "Dr. James Wilson, DDS",
    practice: "Parkview Family Dental",
    dateReceived: "April 18, 2025",
    status: "active",
    priority: "normal",
    insurance: "MetLife Dental",
    memberId: "MLD12345678",
    reason: "Periodontal evaluation",
    hasXrays: true,
    hasInsurance: true,
    appointmentDate: "April 29, 2025",
    appointmentTime: "2:30 PM",
    documents: []
  },
  {
    id: 4,
    patientName: "David Thompson",
    age: 52,
    dateOfBirth: "November 5, 1972",
    phone: "(555) 456-7890",
    referredBy: "Dr. Sarah Peterson, DDS",
    practice: "Lakeview Dental Associates",
    dateReceived: "April 15, 2025",
    status: "archive",
    priority: "normal",
    insurance: "Aetna Dental",
    memberId: "AD98765432",
    reason: "Implant consultation",
    hasXrays: true,
    hasInsurance: true,
    completedDate: "April 21, 2025",
    documents: []
  },
  {
    id: 5,
    patientName: "Jessica Martinez",
    age: 19,
    dateOfBirth: "April 23, 2006",
    phone: "(555) 567-8901",
    referredBy: "Dr. Thomas Brown, DDS",
    practice: "Maple Street Dental",
    dateReceived: "April 23, 2025",
    status: "new",
    priority: "overdue",
    insurance: "Guardian Dental",
    memberId: "GD24681357",
    reason: "Orthodontic evaluation",
    hasXrays: false,
    hasInsurance: true,
    documents: []
  }
]; 
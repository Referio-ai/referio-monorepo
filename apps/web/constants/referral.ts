// Types
export type ReferralStatus = 'new' | 'in-progress' | 'scheduled' | 'completed';

export interface Referral {
  id: number;
  patientName: string;
  age: number;
  referredBy: string;
  practice: string;
  dateReceived: string;
  status: ReferralStatus;
  insurance: string;
  memberId: string;
  reason: string;
  hasXrays: boolean;
  hasInsurance: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  completedDate?: string;
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
export const REFERRAL_STATUSES: ReferralStatus[] = ['new', 'in-progress', 'scheduled', 'completed'];

export const STATUS_BADGE_STYLES = {
  new: 'bg-blue-200 text-blue-700',
  'in-progress': 'bg-yellow-200 text-yellow-700',
  scheduled: 'bg-purple-200 text-purple-700',
  completed: 'bg-green-200 text-green-700',
} as const;

export const STATUS_LABELS = {
  new: 'New',
  'in-progress': 'In Progress',
  scheduled: 'Scheduled',
  completed: 'Completed',
} as const;

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
    referredBy: "Dr. Michael Chen, DDS",
    practice: "Sunshine Dental Care",
    dateReceived: "April 22, 2025",
    status: "new",
    insurance: "Delta Dental Premier",
    memberId: "DDP78923456",
    reason: "Impacted wisdom teeth extraction",
    hasXrays: true,
    hasInsurance: true
  },
  {
    id: 2,
    patientName: "Robert Williams",
    age: 45,
    referredBy: "Dr. Amanda Lee, DDS",
    practice: "City Center Dental",
    dateReceived: "April 20, 2025",
    status: "in-progress",
    insurance: "Cigna Dental PPO",
    memberId: "CDP45678912",
    reason: "Root canal treatment",
    hasXrays: true,
    hasInsurance: true
  },
  {
    id: 3,
    patientName: "Emily Rodriguez",
    age: 28,
    referredBy: "Dr. James Wilson, DDS",
    practice: "Parkview Family Dental",
    dateReceived: "April 18, 2025",
    status: "scheduled",
    insurance: "MetLife Dental",
    memberId: "MLD12345678",
    reason: "Periodontal evaluation",
    hasXrays: true,
    hasInsurance: true,
    appointmentDate: "April 29, 2025",
    appointmentTime: "2:30 PM"
  },
  {
    id: 4,
    patientName: "David Thompson",
    age: 52,
    referredBy: "Dr. Sarah Peterson, DDS",
    practice: "Lakeview Dental Associates",
    dateReceived: "April 15, 2025",
    status: "completed",
    insurance: "Aetna Dental",
    memberId: "AD98765432",
    reason: "Implant consultation",
    hasXrays: true,
    hasInsurance: true,
    completedDate: "April 21, 2025"
  },
  {
    id: 5,
    patientName: "Jessica Martinez",
    age: 19,
    referredBy: "Dr. Thomas Brown, DDS",
    practice: "Maple Street Dental",
    dateReceived: "April 23, 2025",
    status: "new",
    insurance: "Guardian Dental",
    memberId: "GD24681357",
    reason: "Orthodontic evaluation",
    hasXrays: false,
    hasInsurance: true
  }
]; 
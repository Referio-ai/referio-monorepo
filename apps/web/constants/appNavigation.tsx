import { BarChart3, Building, ClipboardList, Home, QrCode, Settings, Users, ListChecksIcon, UserCheck } from "lucide-react";

export const appNavigation = [
  { icon: Home, label: 'Dashboard',  path: '/referral-management/' },
  { icon: QrCode, label: 'Referrals',  path: '/referral-management/referral-management/' },
  { icon: ListChecksIcon, label: 'Referrals-list', path: '/referral-management/referral-list/' },
  { icon: Building, label: 'Facilities', path: '/referral-management/facilities/' },
  { icon: UserCheck, label: 'Facilitators', path: '/referral-management/facilitator/' },
  { icon: Users, label: 'Patients',  path: '/referral-management/patients/' },
]
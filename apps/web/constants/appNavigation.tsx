import { BarChart3, Building, ClipboardList, Home, QrCode, Settings, Users, ListChecksIcon } from "lucide-react";

export const appNavigation = [
  { icon: Home, label: 'Dashboard',  path: '/dashboard/' },
  { icon: QrCode, label: 'Referrals',  path: '/dashboard/referral-management/' },
  { icon: ListChecksIcon, label: 'Referrals-list', path: '/dashboard/referral-list/' },
  { icon: Building, label: 'Facilities', path: '/dashboard/facilities/' },
  { icon: Users, label: 'Patients',  path: '/dashboard/patients/' },
  { icon: BarChart3, label: 'Analytics',  path: '/dashboard/analytics/' },
  { icon: ClipboardList, label: 'Reports',  path: '/dashboard/reports/' },
  { icon: Settings, label: 'Settings',  path: '/dashboard/settings/' },
]
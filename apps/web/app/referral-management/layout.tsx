import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";

export default function DashboardLayoutPage({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
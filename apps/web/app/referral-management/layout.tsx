import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { useUser, useLogoutFunction, useRedirectFunctions } from "@propelauth/nextjs/client";

export default function DashboardLayoutPage({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
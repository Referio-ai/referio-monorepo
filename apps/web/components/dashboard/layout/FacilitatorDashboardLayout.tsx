'use client';
import React, { useState } from 'react';
import { Sidebar, SidebarItem } from './Sidebar';
import Header from './Header';
import { facilitatorNavigation } from '@/constants/facilitatorNavigation';
import { usePathname } from 'next/navigation';
import { useUser } from "@propelauth/nextjs/client";
import FacilityRequirementWrapper from '@/components/facility/FacilityRequirementWrapper';

interface FacilitatorDashboardLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void; 
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  sidebarItems?: SidebarItem[];
}

export const FacilitatorDashboardLayout: React.FC<FacilitatorDashboardLayoutProps> = ({
  children,
  onSearch,
  user,
  onLogout,
  onProfileClick,
  onSettingsClick,
  sidebarItems = facilitatorNavigation
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user: propelauthUser } = useUser();
  const title = facilitatorNavigation.find((item) => item.path === pathname)?.label || 'Facilitator Dashboard';
  
  // Get user type from PropelAuth user metadata
  const userType = (propelauthUser?.properties?.metadata as any)?.user_type as 'facilitator' | 'admin' | undefined;
  
  return (
    <FacilityRequirementWrapper userType={userType}>
      <div className="h-screen bg-gray-50 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          items={sidebarItems}
          onLogout={onLogout}
          userType={userType}
        />

        <div className="flex-1 flex flex-col">
          <Header
            title={title}
            onSearch={onSearch}
            onProfileClick={onProfileClick}
            onSettingsClick={onSettingsClick}
          />

          <main className="overflow-y-scroll h-screen">
            {children}
          </main>
        </div>
      </div>
    </FacilityRequirementWrapper>
  );
};

export default FacilitatorDashboardLayout; 
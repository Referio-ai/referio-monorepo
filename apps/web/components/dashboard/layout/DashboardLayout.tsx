'use client';
import React, { useState } from 'react';
import { Sidebar, SidebarItem } from './Sidebar';
import Header from './Header';
import { 
  Home, QrCode, Building, Users, BarChart3, 
  ClipboardList, Settings 
} from 'lucide-react';
import { appNavigation } from '@/constants/appNavigation';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
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

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  onSearch,
  user,
  onLogout,
  onProfileClick,
  onSettingsClick,
  sidebarItems = appNavigation
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const title = appNavigation.find((item) => item.path === pathname)?.label || 'Dashboard';
  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        items={sidebarItems}
        onLogout={onLogout}
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
  );
};

export default DashboardLayout; 
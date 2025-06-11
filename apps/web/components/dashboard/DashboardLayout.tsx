import React, { useState } from 'react';
import { Sidebar, SidebarItem } from './Sidebar';
import Header from './Header';
import { 
  Home, QrCode, Building, Users, BarChart3, 
  ClipboardList, Settings 
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
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
  title,
  onSearch,
  user,
  onLogout,
  onProfileClick,
  onSettingsClick,
  sidebarItems = [
    { icon: Home, label: 'Dashboard', active: false },
    { icon: QrCode, label: 'Referrals', active: true },
    { icon: Building, label: 'Facilities', active: false },
    { icon: Users, label: 'Patients', active: false },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: ClipboardList, label: 'Reports', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ]
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          user={user}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onSettingsClick={onSettingsClick}
        />

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 
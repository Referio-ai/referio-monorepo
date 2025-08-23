'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  QrCode, Home, Building, Users, BarChart3, ClipboardList, 
  Settings, LogOut, HelpCircle, Menu, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useFacilityStore } from '@/lib/stores/facilityStore';
import FacilitySelectionModal from '@/components/facility/FacilitySelectionModal';
import { useUser, useLogoutFunction } from "@propelauth/nextjs/client";

export interface SidebarItem {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  path?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  items: SidebarItem[];
  onLogout?: () => void;
  userType?: 'facilitator' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  items,
  onLogout,
  userType
}) => {
  const router = useRouter();
  const activePath = usePathname();
  const logoutFn = useLogoutFunction();

  const handleLogout = async () => {
    await logoutFn();
    router.push('/');
  };
  
  const { activeFacilityId, openFacilityModal, facilities } = useFacilityStore();

  // Helper function to check if a path is active
  const isPathActive = (itemPath: string | undefined) => {
    if (!itemPath) return false;
    
    // Normalize paths by removing trailing slashes
    const normalizedActivePath = activePath.replace(/\/$/, '');
    const normalizedItemPath = itemPath.replace(/\/$/, '');
    
    // Exact match
    if (normalizedActivePath === normalizedItemPath) return true;
    
    // For nested routes, check if the active path starts with the item path
    // but only if the item path is not the root path
    if (normalizedItemPath !== '' && normalizedActivePath.startsWith(normalizedItemPath)) {
      // Make sure we're not matching a partial segment
      const nextChar = normalizedActivePath.charAt(normalizedItemPath.length);
      return nextChar === '' || nextChar === '/';
    }
    
    return false;
  };

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col h-screen`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            {isOpen && (
              <span className="text-xl font-bold text-gray-800">Referio.ai</span>
            )}
          </div>
          {isOpen && <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
          </button>}
        </div>
        <div className="flex items-center justify-center mt-4 self-center">
        {!isOpen && <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors w-full bg-gray-100 items-center justify-center"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
          </button>}
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {/* Facility Selection Button - Only show for facilitators */}
          {userType === 'facilitator' && (
            <li>
              <button
                onClick={openFacilityModal}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  'text-gray-600 hover:bg-gray-100'
                } ${!isOpen && 'justify-center'}`}
              >
                <Building className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <div className="flex-1 text-left">
                    <span className="block text-sm font-medium">Facility</span>
                    <span className="block text-xs text-gray-500 truncate">
                      {activeFacilityId 
                        ? facilities.find(f => f.facility_id === activeFacilityId)?.facility_name || 'Select Facility'
                        : 'Select Facility'
                      }
                    </span>
                  </div>
                )}
              </button>
            </li>
          )}
          
          {items.map((item, index) => (
            <li key={index}>
              <button
                onClick={item.onClick || (() => {
                  router.push(item.path || '/dashboard');
                })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isPathActive(item.path)
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                } ${!isOpen && 'justify-center'}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button className={`w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-all ${!isOpen && 'justify-center'}`}>
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Help & Support</span>}
        </button>
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all mt-2 ${!isOpen && 'justify-center'}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
      
      {/* Facility Selection Modal - Only show for facilitators */}
      {userType === 'facilitator' && <FacilitySelectionModal />}
    </aside>
  );
};

export default Sidebar; 
'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  QrCode, Home, Building, Users, BarChart3, ClipboardList, 
  Settings, LogOut, HelpCircle, Menu, ChevronLeft, ChevronRight
} from 'lucide-react';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  items,
  onLogout
}) => {
  const router = useRouter();
  //get active path
  const activePath = usePathname();

  //get the data path from the items

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
          {items.map((item, index) => (
            <li key={index}>
              <button
                onClick={item.onClick || (() => {
                  router.push(item.path || '/dashboard');
                })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activePath === item.path 
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
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all mt-2 ${!isOpen && 'justify-center'}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 
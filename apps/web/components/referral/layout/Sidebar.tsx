import React from 'react';
import { Inbox, Calendar, Bell } from 'lucide-react';

interface SidebarProps {
  userInitials?: string;
  onNavigate?: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  userInitials = 'DS',
  onNavigate 
}) => {
  return (
    <div className="w-16 bg-blue-50 border-r flex flex-col items-center py-4">
      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold mb-8">
        {userInitials}
      </div>
      <div className="flex flex-col items-center gap-6 flex-1">
        <button 
          className="p-2 rounded-lg bg-blue-100 text-blue-600"
          onClick={() => onNavigate?.('inbox')}
        >
          <Inbox className="h-6 w-6" />
        </button>
        <button 
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
          onClick={() => onNavigate?.('calendar')}
        >
          <Calendar className="h-6 w-6" />
        </button>
        <button 
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
          onClick={() => onNavigate?.('notifications')}
        >
          <Bell className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 
import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HeaderSkeleton } from '../skeletons/ReferralSkeletons';

interface HeaderProps {
  title?: string;
  userInitials?: string;
  userName?: string;
  onSearch?: (query: string) => void;
  onUserMenuClick?: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Referral Management',
  userInitials = 'ET',
  userName = 'Dr. Taylor',
  onSearch,
  onUserMenuClick,
  isLoading = false
}) => {
  if (isLoading) {
    return <HeaderSkeleton />;
  }

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-lg font-bold">{title}</h1>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search referrals..." 
            className="pl-10 w-64"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        
        <button 
          className="flex items-center gap-2"
          onClick={onUserMenuClick}
        >
          <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-medium">
            {userInitials}
          </div>
          <span>{userName}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Header; 
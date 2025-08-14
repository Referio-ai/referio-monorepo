import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Clock, Calendar, Image, Search, ChevronDown, AlertTriangle } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { 
  Referral, 
  ReferralStatus, 
  ReferralSortOption, 
  ReferralSearchFilter,
  SORT_OPTIONS, 
  SEARCH_FILTER_OPTIONS,
  PRIORITY_BADGE_STYLES, 
  PRIORITY_LABELS 
} from '@/constants/referral';
import { ReferralListSkeleton } from '../skeletons/ReferralSkeletons';
import { useUser } from '@propelauth/nextjs/client';
import { useMarkCommunicationAsRead, useMarkFileUpdateAsRead } from '@/lib/hooks/referrals';

interface ReferralListProps {
  referrals: Referral[];
  selectedReferralId?: string;
  activeTab: ReferralStatus | 'all';
  searchFilter: ReferralSearchFilter;
  sortBy: ReferralSortOption;
  searchQuery: string;
  onReferralSelect: (referral: Referral) => void;
  onTabChange: (tab: ReferralStatus | 'all') => void;
  onSearchFilterChange: (filter: ReferralSearchFilter) => void;
  onSortChange: (sort: ReferralSortOption) => void;
  onSearchChange: (search: string) => void;
  onNewReferralClick: () => void;
  getStatusBadge: (status: ReferralStatus) => React.ReactNode;
  isLoading?: boolean;
  isOutbound?: boolean;
}

export const ReferralList: React.FC<ReferralListProps> = ({
  referrals,
  selectedReferralId,
  activeTab,
  searchFilter,
  sortBy,
  searchQuery,
  onReferralSelect,
  onTabChange,
  onSearchFilterChange,
  onSortChange,
  onSearchChange,
  onNewReferralClick,
  getStatusBadge,
  isOutbound,
  isLoading = false
}) => {

  console.log('referrals', referrals,'222');

  // User and update tracking hooks
  const { user } = useUser();
  const markCommunicationAsRead = useMarkCommunicationAsRead();
  const markFileUpdateAsRead = useMarkFileUpdateAsRead();

  // Function to check if a referral has unread updates for the current user
  const hasUnreadUpdates = (referral: Referral): boolean => {
    if (!user?.userId) return false;
    
    const hasUnreadCommunication = !(referral.has_com_update_users ?? []).includes(user.userId);
    
    const hasUnreadFiles = !(referral.has_update_users ?? []).includes(user.userId);
    
    return hasUnreadCommunication || hasUnreadFiles;
  };

  // Function to mark updates as read when a referral is selected
  const handleReferralSelect = (referral: Referral) => {
    if (user?.userId) {
      // Mark communication updates as read if they exist

        markCommunicationAsRead.mutate({
          referralId: referral.referral_id,
          userId: user.userId
        });
   
      
      // Mark file updates as read if they exist
      if (!(referral.has_update_users ?? []).includes(user.userId)) {
        markFileUpdateAsRead.mutate({
          referralId: referral.referral_id,
          userId: user.userId
        });
      }
    }
    
    // Call the original onReferralSelect
    onReferralSelect(referral);
  };

  // Utility function to check if a referral is overdue (more than 2 days old)
  const isReferralOverdue = (dateReceived: string): boolean => {
    try {
      const receivedDate = new Date(dateReceived);
      const currentDate = new Date();
      const diffTime = currentDate.getTime() - receivedDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays > 2;
    } catch (error) {
      return false; // Return false if date parsing fails
    }
  };

  // Human-readable date formatting function
  const formatHumanReadableDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      
      // Show relative time for recent dates
      if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
      } else if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'h:mm a')}`;
      } else {
        // For older dates, show full date and time
        return format(date, 'MMM dd, yyyy \'at\' h:mm a');
      }
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  const getPriorityBadge = (priority: string, isUrgent?: boolean) => {
    // Show badge for urgent priority or if isUrgent flag is true
    if ((priority !== 'urgent' && !isUrgent ) || activeTab == 'archive') {
      return null;
    }
    
    return (
      <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-1 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Urgent
      </Badge>
    );
  };

  const getPlaceholderText = (filter: ReferralSearchFilter) => {
    switch (filter) {
      case 'patient':
        return 'Search patients...';
      case 'dob':
        return 'Search DOB...';
      case 'phone':
        return 'Search phone...';
      case 'doctor':
        return 'Search doctors...';
      case 'practice':
        return 'Search practices...';
      default:
        return 'Search...';
    }
  };

  // if (isLoading) {
  //   return <ReferralListSkeleton />;
  // }

  return (
    <div className="w-96 border-r flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
        </div>
        
        <Tabs defaultValue={activeTab} className="w-full mb-6">
          <TabsList className="grid grid-cols-3 w-full bg-gray-100">
            <TabsTrigger 
              value="new" 
              onClick={() => onTabChange('new')} 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
            >
              New
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              onClick={() => onTabChange('active')} 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-500"
            >
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="archive" 
              onClick={() => onTabChange('archive')} 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-500"
            >
              Archive
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">{referrals.length} referrals</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="relative">
              <select 
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as ReferralSortOption)}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* <div className="relative flex-shrink-0">
            <select 
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={searchFilter}
              onChange={(e) => onSearchFilterChange(e.target.value as ReferralSearchFilter)}
            >
              {SEARCH_FILTER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div> */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={getPlaceholderText(searchFilter)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
      
      {isLoading ? <ReferralListSkeleton /> : (
    <div className="flex-1 overflow-y-scroll max-h-[calc(80vh-230px)]">
        {referrals.map(referral => (
          <button
            key={referral.referral_id}
            className={`w-full text-left p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              selectedReferralId === referral.referral_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => handleReferralSelect(referral)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-lg">{referral.patientName}</h3>
                {hasUnreadUpdates(referral) && (
                  <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0" title="New updates available" />
                )}
              </div>
              <div className="flex gap-2">
                {getPriorityBadge(referral.priority, referral.isUrgent)}
                {!isReferralOverdue(referral.dateReceived)  && activeTab !== 'archive' && (
                  <Badge className="bg-red-100 text-red-700 text-xs px-2 py-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-3">{referral.reason}</p>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatHumanReadableDate(referral.dateReceived)}</span>
              {referral.status === 'active' && referral.appointmentDate && (
                <>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatHumanReadableDate(referral.appointmentDate)}</span>
                </>
              )}
            </div>
            {referral.hasXrays && (
              <div className="flex">
                <Badge variant="outline" className="flex items-center text-xs">
                  <Image className="h-3 w-3 mr-1" />
                  X-rays
                </Badge>
              </div>
            )}
          </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferralList; 
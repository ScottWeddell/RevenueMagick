import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiClient } from '../lib/api';
import { useDashboardSync } from '../hooks/useDashboardSync';

// Business info for display purposes
const BUSINESS_INFO = {
  demo: { 
    name: 'Demo', 
    industry: 'Demo Data',
    description: 'Uses dummy data for demonstration purposes',
    color: 'bg-blue-500'
  },
  idta: { 
    name: 'IDTA', 
    industry: 'Trading Academy',
    description: 'International Day Trading Academy - Real data from integrations',
    color: 'bg-green-500'
  }
};

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard sync functionality
  const {
    isLoading: isSyncing,
    isSyncAvailable,
    cooldownInfo,
    error: syncError,
    triggerSync,
    clearError: clearSyncError,
    lastSyncResult,
    taskProgress
  } = useDashboardSync();

  // Fetch user info from backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user) {
        try {
          const response = await apiClient.getCurrentUser() as any;
          setUserInfo(response.user);
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Find current business info - use actual business name from user context first
  const actualBusinessName = userInfo?.business_name;
  const currentBusiness = BUSINESS_INFO[userInfo?.business_id as keyof typeof BUSINESS_INFO];
  const currentBusinessName = actualBusinessName || currentBusiness?.name || 'Business';
  const currentBusinessIndustry = userInfo?.business_industry || currentBusiness?.industry || '';
  const businessColor = currentBusiness?.color || 'bg-blue-500'; // Default to blue for new businesses
  
  // Get user display info
  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}`
    : userInfo?.first_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'user@example.com';
  const userInitial = userName.charAt(0).toUpperCase();
  
  // Handle dashboard sync
  const handleDashboardSync = async () => {
    try {
      clearSyncError();
      const result = await triggerSync();
      
      if (result) {
        // Show success message briefly
        setTimeout(() => {
          // The sync will automatically refresh data in the background
          console.log('✅ Dashboard sync completed successfully');
        }, 2000);
      }
    } catch (error) {
      // Error is already handled by the hook
      console.error('❌ Dashboard sync failed:', error);
    }
  };

  // Get sync button state
  const getSyncButtonState = () => {
    if (isSyncing) {
      const progress = taskProgress?.progress;
      const percentage = progress?.percentage || 0;
      const step = progress?.current_step || 'Processing...';
      
      return {
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        text: `${Math.round(percentage)}%`,
        className: 'btn-secondary opacity-75 cursor-not-allowed',
        disabled: true,
        tooltip: `${step} (${progress?.completed_endpoints || 0}/${progress?.total_endpoints || 14} endpoints)`
      };
    }
    
    if (!isSyncAvailable) {
      const remainingMinutes = Math.ceil(cooldownInfo?.remainingMinutes || 0);
      return {
        icon: <Clock className="h-4 w-4" />,
        text: `${remainingMinutes}m`,
        className: 'btn-secondary opacity-75 cursor-not-allowed',
        disabled: true,
        tooltip: `Sync available in ${remainingMinutes} minutes`
      };
    }
    
    if (lastSyncResult?.status === 'completed') {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: 'Sync',
        className: 'btn-primary hover:bg-brand-blue-dark',
        disabled: false,
        tooltip: 'Recalculate all dashboard metrics with fresh data'
      };
    }
    
    return {
      icon: <RefreshCw className="h-4 w-4" />,
      text: 'Sync',
      className: 'btn-primary hover:bg-brand-blue-dark',
      disabled: false,
      tooltip: 'Recalculate all dashboard metrics with fresh data'
    };
  };

  const syncButtonState = getSyncButtonState();

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-40">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          </div>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-40">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
        {/* Left side - Mobile menu button and Business Info */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {/* Business Info Display */}
          <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${businessColor}`}></div>
            <div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{currentBusinessName}</div>
                <div className="text-xs text-gray-500">{currentBusinessIndustry}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center - Dashboard Sync Button */}
        <div className="flex items-center space-x-4">
          {/* Sync Error Display */}
          {syncError && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-700">Sync failed</span>
              <button
                onClick={clearSyncError}
                className="text-yellow-500 hover:text-yellow-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Success Message */}
          {lastSyncResult && !syncError && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">Dashboard synced</span>
            </div>
          )}

          {/* Sync Button */}
          <div className="relative group">
            <button 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${syncButtonState.className}`}
              onClick={handleDashboardSync}
              disabled={syncButtonState.disabled}
              title={syncButtonState.tooltip}
            >
              {syncButtonState.icon}
              <span className="hidden sm:inline">{syncButtonState.text}</span>
            </button>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {syncButtonState.tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-4">
          {/* User Avatar and Info */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {userInitial}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {userName}
                </div>
                <div className="text-xs text-gray-500">
                  {userEmail}
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[70]">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{userName}</div>
                    <div className="text-xs text-gray-500">{userEmail}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {currentBusinessName}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg mt-1"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
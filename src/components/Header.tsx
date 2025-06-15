import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { LogOut } from 'lucide-react';

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

const businessProfiles = {
  demo: {
    name: 'Demo Business',
    type: 'E-commerce Demo',
    color: 'bg-blue-500'
  }
};

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentUser, logout } = useUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };
  
  // Find current business info - use actual business name from user context first
  const actualBusinessName = currentUser?.business_name;
  const currentBusiness = BUSINESS_INFO[currentUser?.business_id as keyof typeof BUSINESS_INFO];
  const currentBusinessName = actualBusinessName || currentBusiness?.name || 'Business';
  const currentBusinessIndustry = currentUser?.business_industry || currentBusiness?.industry || '';
  const businessColor = currentBusiness?.color || 'bg-blue-500'; // Default to blue for new businesses
  
  console.log('Current user:', currentUser); // Debug log
  console.log('Business ID:', currentUser?.business_id); // Debug log
  console.log('Current business info:', currentBusiness); // Debug log
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
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
                  {currentUser?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {currentUser?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500">
                  {currentUser?.email || 'user@example.com'}
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{currentUser?.name}</div>
                    <div className="text-xs text-gray-500">{currentUser?.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {currentBusinessName} • {currentUser?.role}
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
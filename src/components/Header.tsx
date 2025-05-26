import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

// Mock businesses for testing
const MOCK_BUSINESSES = [
  { id: 'business-1', name: 'Acme Corp', industry: 'E-commerce' },
  { id: 'business-2', name: 'Globex Industries', industry: 'SaaS' },
  { id: 'business-3', name: 'Stark Enterprises', industry: 'Technology' }
];

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentUser, setCurrentUser } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleBusinessChange = (businessId: string) => {
    if (currentUser) {
      // Switch to the selected business
      setCurrentUser({
        ...currentUser,
        business_id: businessId
      });
    }
    setIsDropdownOpen(false);
  };
  
  // Find current business
  const currentBusiness = MOCK_BUSINESSES.find(b => b.id === currentUser?.business_id);
  const currentBusinessName = currentBusiness?.name || 'Unknown Business';
  const currentBusinessIndustry = currentBusiness?.industry || '';
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
        {/* Left side - Mobile menu button and Business Selector */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 transition-colors"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Business Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded-lg px-3 py-2 transition-all duration-200"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {currentBusinessName.charAt(0)}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold">{currentBusinessName}</div>
                  {currentBusinessIndustry && (
                    <div className="text-xs text-gray-500">{currentBusinessIndustry}</div>
                  )}
                </div>
              </div>
              <svg className="h-4 w-4 text-gray-400 hidden sm:block" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 border border-gray-100">
                <div className="py-2" role="menu" aria-orientation="vertical">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Switch Business
                  </div>
                  {MOCK_BUSINESSES.map(business => (
                    <button
                      key={business.id}
                      onClick={() => handleBusinessChange(business.id)}
                      className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                        business.id === currentUser?.business_id 
                          ? 'bg-brand-ice text-brand-blue font-medium' 
                          : 'text-gray-700'
                      }`}
                      role="menuitem"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                          business.id === currentUser?.business_id 
                            ? 'bg-brand-blue text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {business.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{business.name}</div>
                          <div className="text-xs text-gray-500">{business.industry}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* AI Status Indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-brand-blue animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="hidden md:inline">AI Processing</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">
                {currentUser?.name || 'Revenue Strategist'}
              </div>
              <div className="text-xs text-gray-500">
                Strategic Intelligence
              </div>
            </div>
            
            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-indigo rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {(currentUser?.name || 'RS').charAt(0)}
          </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              className="btn-ghost p-2"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z" />
              </svg>
            </button>
            
          <button
            type="button"
              className="btn-secondary hidden sm:flex"
          >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            Settings
          </button>

          {/* Mobile Settings Button */}
          <button
            type="button"
            className="btn-ghost p-2 sm:hidden"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
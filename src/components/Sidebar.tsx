import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import RevenueMagickLogo from './RevenueMagickLogo';

// Logo component with the brand's visual signature
const Logo: React.FC = () => (
  <div className="py-2">
    <RevenueMagickLogo size={200} variant="full" theme="dark" />
  </div>
);

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && onClose) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          onClose();
        }
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isOpen, onClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);
  
  const navItems = [
    { 
      name: 'Revenue Superintelligence', 
      path: '/', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      description: 'Six Intelligence Modules'
    },
    { 
      name: 'Conversion Spy Engine', 
      path: '/conversion-spy-engine', 
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      description: 'Digital Body Language™'
    },
    { 
      name: 'Behavioral Signals', 
      path: '/behavioral-signals', 
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      description: 'Signal Graph™ Analysis'
    },
    { 
      name: 'Ad Intelligence', 
      path: '/ad-intelligence', 
      icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
      description: 'Channel ROI & Creative Analysis'
    },
    { 
      name: 'Customer Intelligence', 
      path: '/customer-intelligence', 
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      description: 'Neuromind Profiles™'
    },
    { 
      name: 'Revenue Strategist', 
      path: '/revenue-strategist', 
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      description: 'Strategic Recommendations'
    },
    { 
      name: 'Integrations', 
      path: '/integrations', 
      icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
      description: 'Platform Connections'
    },
  ];

  const devNavItems = [
    { 
      name: 'Development Monitoring', 
      path: '/dev-monitoring', 
      icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
      description: 'System Health & Metrics',
      isSubItem: false
    },
    { 
      name: 'Data Map', 
      path: '/data-map', 
      icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
      description: 'Complete Data Flow Architecture',
      isSubItem: false
    },
    { 
      name: 'Prompts Editor', 
      path: '/prompts-editor', 
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      description: 'AI Prompt Testing & Experimentation',
      isSubItem: false
    },
    { 
      name: 'Session Tracking Admin', 
      path: '/admin', 
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      description: 'Live Session Monitoring & Analytics',
      isSubItem: false
    },
    { 
      name: 'Tracking Script Manager', 
      path: '/tracking-script', 
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      description: 'Generate & Manage Tracking Scripts',
      isSubItem: false
    },
  ];

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        id="sidebar"
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          w-72 bg-brand-indigo text-white flex flex-col z-50 min-h-screen
          transition-transform duration-300 ease-in-out
          ${isMobile ? 'top-0 left-0' : ''}
        `}
      >
        {/* Mobile Close Button */}
        {isMobile && (
          <div className="flex justify-end p-4 lg:hidden">
            <button
              onClick={onClose}
              className="text-white hover:text-brand-ice transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className={`p-6 border-b border-opacity-20 border-white flex-shrink-0 ${isMobile ? 'pt-2' : ''}`}>
          <Logo />
        </div>
        
        <nav className="flex-1 mt-6 px-3 overflow-y-auto scrollbar-hide">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    onClick={handleNavClick}
                    className={`group flex flex-col p-4 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-brand-blue text-white shadow-lg' 
                        : 'text-gray-100 hover:bg-brand-indigo hover:bg-opacity-80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                    <svg 
                      className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-brand-ice'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d={item.icon} 
                      />
                    </svg>
                    <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className={`text-xs mt-1 ml-8 ${
                      isActive ? 'text-brand-ice' : 'text-gray-400'
                    }`}>
                      {item.description}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Development Section */}
          <div className="mt-8 pt-4 border-t border-opacity-30 border-white">
            <div className="px-4 mb-3">
              <h3 className="text-xs font-medium text-brand-ice opacity-90 uppercase tracking-wider">
                Development
              </h3>
            </div>
            <ul className="space-y-2">
              {devNavItems.map((item) => {
                const isActive = location.pathname === item.path || 
                                (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <li key={item.name}>
                    <Link 
                      to={item.path}
                      onClick={handleNavClick}
                      className={`group flex flex-col rounded-xl transition-all duration-200 ${
                        item.isSubItem ? 'p-3 ml-4' : 'p-4'
                      } ${
                        isActive 
                          ? 'bg-brand-blue text-white shadow-lg' 
                          : 'text-gray-100 hover:bg-brand-indigo hover:bg-opacity-80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg 
                          className={`h-4 w-4 mr-3 ${isActive ? 'text-white' : 'text-brand-ice'} ${
                            item.isSubItem ? 'opacity-80' : ''
                          }`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d={item.icon} 
                          />
                        </svg>
                        <span className={`font-medium ${item.isSubItem ? 'text-xs' : 'text-sm'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className={`text-xs mt-1 ${item.isSubItem ? 'ml-7' : 'ml-8'} ${
                        isActive ? 'text-brand-ice' : 'text-gray-300'
                      }`}>
                        {item.description}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
        
        <div className="p-4 border-t border-opacity-20 border-white bg-brand-indigo bg-opacity-30 flex-shrink-0">
          <div className="text-center text-xs text-brand-ice opacity-50 font-medium">
            Revenue Magick • v1.0.0
          </div>
          <div className="text-center text-xs text-brand-ice opacity-30 mt-1 italic">
            "It just knows."
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 
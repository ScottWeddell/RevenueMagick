import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import ConversionSpyEngine from './views/ConversionSpyEngine';
import BehavioralSignals from './views/BehavioralSignals';
import AdIntelligence from './views/AdIntelligence';
import CustomerIntelligence from './views/CustomerIntelligence';
import RevenueStrategist from './views/RevenueStrategist';
import DevMonitoring from './views/DevMonitoring';
import Integrations from './views/Integrations';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { UserProvider } from './contexts/UserContext';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile and manage sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      // On desktop, sidebar should always be open
      // On mobile, sidebar should be closed by default
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <UserProvider>
    <Router>
        <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
          <div className={`flex-1 flex flex-col overflow-hidden relative z-10 ${
            isMobile ? 'w-full' : ''
          }`}>
          <Header onMenuClick={handleMenuClick} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-8">
              <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
                  <Route path="/conversion-spy-engine" element={<ConversionSpyEngine />} />
                  <Route path="/behavioral-signals" element={<BehavioralSignals />} />
                  <Route path="/ad-intelligence" element={<AdIntelligence />} />
                  <Route path="/customer-intelligence" element={<CustomerIntelligence />} />
                  <Route path="/customer-intelligence/:id" element={<CustomerIntelligence />} />
                  <Route path="/revenue-strategist" element={<RevenueStrategist />} />
              <Route path="/integrations" element={<Integrations />} />
                  <Route path="/dev-monitoring" element={<DevMonitoring />} />
            </Routes>
              </div>
          </main>
        </div>
      </div>
    </Router>
    </UserProvider>
  );
}

export default App; 
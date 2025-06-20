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
import Admin from './views/Admin';
import SessionDetails from './views/SessionDetails';
import TrackingScript from './views/TrackingScript';
import PromptsEditor from './views/PromptsEditor';
import DataMap from './views/DataMap';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginForm from './components/LoginForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { apiClient } from './lib/api';

function AuthWrapper() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true);
    } else if (user) {
      setShowLogin(false);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return <LoginForm onSuccess={() => setShowLogin(false)} onError={(error) => console.error('Login error:', error)} />;
  }

  return (
    <Router>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        {/* Sidebar - Full height on the left */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Right side content - Header + Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
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
                  <Route path="/prompts-editor" element={<PromptsEditor />} />
                  <Route path="/data-map" element={<DataMap />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/sessions/:sessionId" element={<SessionDetails />} />
                  <Route path="/tracking-script" element={<TrackingScript />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

export default App; 
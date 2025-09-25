import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/landing';
import Dashboard from './pages/dashboard';
import Sidebar from './components/Sidebar';
import ProfileForm from './pages/profileform';
import Scheme from './pages/scheme';
import Eligibility from './pages/eligibility';

function App() {
  const location = useLocation();

  // Show sidebar only on dashboard (exclude landing and profileform)
  const shouldShowSidebar = location.pathname !== '/' && location.pathname !== '/profileform';

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {shouldShowSidebar && (
        <div className="w-72 flex-shrink-0">
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profileform" element={<ProfileForm />} />
          <Route path="/scheme" element={<Scheme />} />
          <Route path="/eligibility" element={<Eligibility/>} />
        </Routes>
      </div>

      {/* AccessibilityDialog & Chatbot can go here if needed */}
    </div>
  );
}

export default App;
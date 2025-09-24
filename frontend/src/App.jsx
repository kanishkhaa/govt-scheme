import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/landing';
import Dashboard from './pages/dashboard';
import Sidebar from './components/Sidebar'; // <-- import your real Sidebar

function App() {
  const location = useLocation();

  // Show sidebar on all pages except landing
  const shouldShowSidebar = location.pathname !== '/';
  const isLandingPage = location.pathname === '/';

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
        </Routes>
      </div>

      {/* AccessibilityDialog & Chatbot can go here if needed */}
    </div>
  );
}

export default App;

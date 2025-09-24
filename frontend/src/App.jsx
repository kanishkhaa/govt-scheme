import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
 
import Landing from './pages/landing';
 
function App() {
  const location = useLocation();

  const shouldShowSidebar = !['/', '/login', '/signup'].includes(location.pathname);
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
           
        </Routes>
      </div>

      {/* Accessibility Dialog - exclude landing */}
      {!isLandingPage && <AccessibilityDialog />}

      {/* Chatbot - exclude landing */}
      {!isLandingPage && <Chatbot />}
    </div>
  );
}
export default App;
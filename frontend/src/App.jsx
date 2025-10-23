import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/landing';
import Dashboard from './pages/dashboard';
import Sidebar from './components/sidebar';
import ProfileForm from './pages/profileform';
import { SchemeDisplay, SchemeDetail } from './pages/scheme';
import Eligibility from './pages/eligibility';
import Profile from './pages/profile';
import Application from './pages/application';
import Chatbot from './components/Chatbot';
import LoginPage from './pages/loginpage';
import SignupPage from './pages/signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  const location = useLocation();

  const shouldShowSidebar = location.pathname !== '/' && location.pathname !== '/profileform' && location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/forgot-password' && location.pathname !== '/reset-password';  
  const isLandingPage = location.pathname === '/';
  const isSignUpPage = location.pathname === '/signup';
  const isLoginPage = location.pathname === '/login';
  const isProfileFormPage = location.pathname === '/profileform';
  const isForgotPasswordPage = location.pathname === '/forgot-password';

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
          <Route path="/profile" element={<Profile />} />
          <Route path="/scheme" element={<SchemeDisplay />} />
          <Route path="/scheme/:id" element={<SchemeDetail />} />
          <Route path="/eligibility" element={<Eligibility/>} />
          <Route path="/application" element={<Application/>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* New route */}
          <Route path="*" element={<div>404 - Page Not Found</div>} /> {/* Basic catch-all */}
          
        </Routes>
      </div>

      {/* Chatbot - exclude landing */}
      {!isLandingPage && !isSignUpPage && !isLoginPage && !isProfileFormPage && !isForgotPasswordPage && <Chatbot />}
      
      {/* AccessibilityDialog can go here if needed */}
    </div>
  );
}

export default App;
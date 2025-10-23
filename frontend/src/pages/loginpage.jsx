import React, { useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import Login from '../assets/login.json';
import axios from 'axios';
import CryptoJS from 'crypto-js'; // npm i crypto-js

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const navigate = useNavigate();

  // Encryption key (must match backend; use VITE_ prefix for Vite)
  const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'AvpsUT9vnOL5t2L19Kkhis1p5kUaTyGcSHW2yKBKYoU';

  // Validation patterns
  const validators = {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    password: {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: 'Password must be at least 8 characters long and include a letter, number, and special character'
    }
  };

  const encryptPayload = (payload) => {
    try {
      const jsonPayload = JSON.stringify(payload);
      return CryptoJS.AES.encrypt(jsonPayload, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption error');
    }
  };

  const validateForm = () => {
    if (!formData.email || !validators.email.pattern.test(formData.email.trim())) {
      setMessage(validators.email.message);
      return false;
    }
    if (!formData.password || !validators.password.pattern.test(formData.password)) {
      setMessage(validators.password.message);
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const value = e.target.value.trim(); // Sanitize
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Encrypt payload
      const encryptedPayload = encryptPayload({
        email: formData.email,
        password: formData.password
      });

      const res = await axios.post("http://localhost:3000/auth/login", {
        encryptedData: encryptedPayload
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true  // For httpOnly cookies
      });

      if (res.status === 200) {
        // Fetch user profile to check completeness
        const profileRes = await axios.get("http://localhost:3000/auth/profile", { withCredentials: true });
        const userProfile = profileRes.data;

        // Check if profile is complete (required fields from ProfileForm)
        const isProfileComplete = userProfile &&
          userProfile.name && userProfile.age_group && userProfile.gender &&
          userProfile.occupation && userProfile.income_level && userProfile.state;

        setMessage(isProfileComplete ? 'Welcome back!' : 'Login successful!');

        setTimeout(() => {
          if (isProfileComplete) {
            navigate('/dashboard');
          } else {
            navigate('/profileform');
          }
        }, 2000);
      } else {
        setMessage(res.data.error || 'Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.response?.data?.error || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    const trimmedEmail = forgotEmail.trim();
    try {
      const res = await axios.post("http://localhost:3000/auth/forgot-password", {
        email: trimmedEmail
      }, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200) {
        setForgotMessage('Password reset link sent! Check your email.');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotEmail('');
        }, 3000);
      } else {
        setForgotMessage(res.data.error || 'Failed to send reset link');
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setForgotMessage(error.response?.data?.error || 'Failed to connect to server');
    } finally {
      setForgotLoading(false);
    }
  };

  const toggleForgotModal = () => {
    setShowForgotModal(!showForgotModal);
    if (!showForgotModal) {
      setForgotEmail(formData.email); // Pre-fill with login email if available
      setForgotMessage('');
    }
  };

  const handleForgotInputChange = (e) => {
    setForgotEmail(e.target.value.trim());
    setForgotMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl w-full mx-4 flex flex-col md:flex-row items-center gap-8">
        {/* Lottie Animation */}
        <div className="md:w-1/2 w-full">
          <Lottie animationData={Login} loop={true} className="w-full max-w-md mx-auto" />
        </div>

        {/* Login Form */}
        <div className="md:w-1/2 w-full">
          <h2 className="text-3xl font-bold text-sky-700 mb-6 text-center">Sign In to Your Account</h2>

          {message && (
            <p className={`mb-4 text-center font-medium ${message.includes('successful') || message.includes('Welcome') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200 pl-10"
              />
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-sky-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition duration-200 font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={toggleForgotModal}
              className="text-sky-600 hover:text-sky-800 font-medium transition duration-200 bg-transparent border-none cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="mt-2 text-center">
            <Link
              to="/signup"
              className="text-sky-600 hover:text-sky-800 font-medium transition duration-200"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-sky-700 mb-4 text-center">Reset Your Password</h3>
            <p className="text-center text-gray-600 mb-6">Enter your email to receive a reset link.</p>

            {forgotMessage && (
              <p className={`mb-4 text-center font-medium ${forgotMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                {forgotMessage}
              </p>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={handleForgotInputChange}
                  required
                  className="w-full p-3 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200 pl-10"
                />
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition duration-200 font-semibold disabled:opacity-50"
              >
                {forgotLoading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={toggleForgotModal}
                className="text-sky-600 hover:text-sky-800 font-medium transition duration-200 bg-transparent border-none cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
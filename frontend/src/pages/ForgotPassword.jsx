import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import Login from '../assets/login.json'; // Adjust path if your assets are elsewhere
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const res = await axios.post("http://localhost:3000/auth/forgot-password", {
        email: email
      }, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200) {
        setMessage('Password reset link sent! Check your email.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage(res.data.error || 'Failed to send reset link');
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setMessage(error.response?.data?.error || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl w-full mx-4 flex flex-col md:flex-row items-center gap-8">
        {/* Lottie Animation - Reuse from login for consistency */}
        <div className="md:w-1/2 w-full">
          <Lottie animationData={Login} loop={true} className="w-full max-w-md mx-auto" />
        </div>

        {/* Forgot Password Form */}
        <div className="md:w-1/2 w-full">
          <h2 className="text-3xl font-bold text-sky-700 mb-6 text-center">Forgot Password?</h2>
          <p className="text-center text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {message && (
            <p className={`mb-4 text-center font-medium ${message.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200 pl-10"
              />
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition duration-200 font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sky-600 hover:text-sky-800 font-medium transition duration-200"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
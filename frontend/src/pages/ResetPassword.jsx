import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await axios.post(
        `http://localhost:3000/auth/reset-password/${token}`, // token in URL
        { newPassword }, // new password in body
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.status === 200) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage(res.data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage(error.response?.data?.error || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-sky-700 mb-6 text-center">Reset Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your new password below.
        </p>

        {message && (
          <p className={`mb-4 text-center font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full p-3 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200 pl-10"
            />
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition duration-200 pl-10"
            />
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition duration-200 font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sky-600 hover:text-sky-800 font-medium transition duration-200"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
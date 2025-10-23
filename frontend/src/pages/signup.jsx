import React, { useState } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';
import SignupAnimation from '../assets/login.json';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js'; // npm i crypto-js

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Encryption key (must match backend; use VITE_ prefix for Vite)
  const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'AvpsUT9vnOL5t2L19Kkhis1p5kUaTyGcSHW2yKBKYoU';

  // Validation patterns
  const validators = {
    name: {
      pattern: /^[A-Za-z\s]{2,50}$/,
      message: 'Name must be 2-50 characters long and contain only letters and spaces'
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      pattern: /^\+?[\d\s-]{10,15}$/,
      message: 'Phone number must be 10-15 digits (may include +, spaces, or dashes)'
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
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const value = form[key].trim();
      if (!value) {
        newErrors[key] = 'This field is required';
      } else if (validators[key] && !validators[key].pattern.test(value)) {
        newErrors[key] = validators[key].message;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.trim(); // Sanitize on change
    setForm({ ...form, [name]: sanitizedValue });
    
    // Clear error when valid
    if (sanitizedValue && validators[name]?.pattern.test(sanitizedValue)) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      setMessage('Please fix the form errors before submitting');
      return;
    }

    try {
      // Encrypt payload
      const encryptedPayload = encryptPayload({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password
      });

      const res = await axios.post('http://localhost:3000/auth/signup', {
        encryptedData: encryptedPayload
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true  // For httpOnly cookies
      });

      if (res.status === 201) {
        setMessage('Signup successful! Redirecting...');
        setTimeout(() => {
          navigate('/profileform');
        }, 2000);
      } else {
        throw new Error(res.data.error || 'Signup failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Signup failed. Please try again.';
      setMessage(errorMessage);
      console.error('Signup error:', err);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl w-full mx-4 flex flex-col md:flex-row items-center gap-8">
        {/* Lottie Animation */}
        <div className="md:w-1/2 w-full">
          <Lottie animationData={SignupAnimation} loop={true} className="w-full max-w-md mx-auto" />
        </div>

        {/* Signup Form */}
        <div className="md:w-1/2 w-full">
          <h2 className="text-3xl font-bold text-sky-700 mb-6 text-center">Create Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-sky-200 focus:ring-sky-500'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-sky-200 focus:ring-sky-500'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                  errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-sky-200 focus:ring-sky-500'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-sky-200 focus:ring-sky-500'
                }`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition duration-200 font-semibold"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleLoginRedirect}
              className="text-sky-600 hover:text-sky-800 font-medium transition duration-200"
            >
              Already have an account? Login
            </button>
          </div>

          {message && (
            <p
              className={`mt-4 text-center font-medium ${
                message.includes('successful') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;
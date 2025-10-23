import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, User, Briefcase, MapPin, DollarSign, Calendar, Users, Heart, School, Home } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    age_group: '',
    gender: '',
    custom_gender: '',
    occupation: '',
    custom_occupation: '',
    income_level: '',
    state: '',
    customState: '',
    marital_status: '',
    education_level: '',
    custom_education: '',
    residential_status: '',
    family_size: '',
    disability: '',
    disability_type: '',
    custom_disability: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      // Automatically set income_level to 'low' if occupation is student
      if (field === 'occupation' && value === 'student') {
        newFormData.income_level = 'low';
      } else if (field === 'occupation' && value !== 'student') {
        newFormData.income_level = ''; // Reset income_level for non-student selections
      }
      return newFormData;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.age_group) newErrors.age_group = 'Age group is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (formData.gender === 'other' && !formData.custom_gender) newErrors.custom_gender = 'Custom gender is required';
      if (!formData.occupation) newErrors.occupation = 'Occupation is required';
      if (formData.occupation === 'other' && !formData.custom_occupation) newErrors.custom_occupation = 'Custom occupation is required';
      if (formData.occupation !== 'student' && !formData.income_level) newErrors.income_level = 'Income level is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (formData.state === 'Other' && !formData.customState) newErrors.customState = 'Custom state is required';
      if (!formData.marital_status) newErrors.marital_status = 'Marital status is required';
      if (!formData.education_level) newErrors.education_level = 'Education level is required';
      if (formData.education_level === 'other' && !formData.custom_education) newErrors.custom_education = 'Custom education level is required';
      if (!formData.residential_status) newErrors.residential_status = 'Residential status is required';
      if (!formData.family_size) newErrors.family_size = 'Family size is required';
      if (!formData.disability) newErrors.disability = 'Disability status is required';
      if (formData.disability === 'yes' && !formData.disability_type) newErrors.disability_type = 'Disability type is required';
      if (formData.disability_type === 'other' && !formData.custom_disability) newErrors.custom_disability = 'Custom disability is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep()) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        gender: formData.gender === 'other' ? formData.custom_gender : formData.gender,
        occupation: formData.occupation === 'other' ? formData.custom_occupation : formData.occupation,
        state: formData.state === 'Other' ? formData.customState : formData.state,
        education_level: formData.education_level === 'other' ? formData.custom_education : formData.education_level,
        disability_status: formData.disability === 'no' ? 'none' : formData.disability_type === 'other' ? formData.custom_disability : formData.disability_type
      };
      delete submitData.custom_gender;
      delete submitData.custom_occupation;
      delete submitData.customState;
      delete submitData.custom_education;
      delete submitData.custom_disability;
      delete submitData.disability;
      delete submitData.disability_type;
      
      // Save to localStorage for persistence
      localStorage.setItem('userProfile', JSON.stringify(submitData));
      
      // Call the API to get recommendations
      const response = await axios.post('http://localhost:5000/recommend', submitData);
      
      // Store the recommendations and profile data in localStorage
      const recommendationData = {
        profile: submitData,
        recommendations: response.data.recommendations,
        query: response.data.query,
        message: response.data.message
      };
      
      localStorage.setItem('recommendationData', JSON.stringify(recommendationData));
      
      // Navigate to scheme display page
      navigate('/scheme', { state: recommendationData });
      
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to fetch recommendations. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 1, title: 'Profile Details', description: 'Basic information' },
      { id: 2, title: 'Review', description: 'Verify details' },
      { id: 3, title: 'Complete', description: 'All done!' }
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-center items-center mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center group">
                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 transform group-hover:scale-105 ${
                  currentStep > step.id 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-200' 
                    : currentStep === step.id 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100' 
                      : 'bg-white text-gray-400 border-2 border-gray-200 shadow-sm'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-8 h-8" /> : step.id}
                  {currentStep === step.id && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-30 animate-pulse"></div>
                  )}
                </div>
                <div className="text-center mt-2">
                  <span className={`block text-sm font-semibold transition-colors ${
                    currentStep > step.id ? 'text-emerald-600' : 
                    currentStep === step.id ? 'text-indigo-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    {step.description}
                  </span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-32 h-1 mx-12 mt-8 rounded-full transition-all duration-500 ${
                  currentStep > step.id ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderProfileDetails = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg shadow-blue-200">
          <User className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Tell us about yourself
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We'll use this information to provide personalized recommendations tailored just for you
        </p>
      </div>
      
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-100 border border-gray-100 p-8">
        <div className="grid gap-6">
          <div className="group">
            <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <User className="w-6 h-6 mr-3 text-indigo-500" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white group-hover:border-gray-300"
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Calendar className="w-6 h-6 mr-3 text-indigo-500" />
                Age Group
              </label>
              <select
                value={formData.age_group}
                onChange={(e) => handleInputChange('age_group', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none"
              >
                <option value="">Select Age Group</option>
                <option value="below_18">Below 18</option>
                <option value="18_25">18-25</option>
                <option value="25_35">25-35</option>
                <option value="35_plus">35+</option>
              </select>
              {errors.age_group && <p className="text-red-500 text-sm mt-1">{errors.age_group}</p>}
            </div>
            
            <div className="group">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Users className="w-6 h-6 mr-3 text-indigo-500" />
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none"
              >
                <option value="">Select Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
          </div>

          {formData.gender === 'other' && (
            <div className="group animate-fadeIn">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Users className="w-6 h-6 mr-3 text-indigo-500" />
                Custom Gender
              </label>
              <input
                type="text"
                value={formData.custom_gender}
                onChange={(e) => handleInputChange('custom_gender', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Enter your gender"
              />
              {errors.custom_gender && <p className="text-red-500 text-sm mt-1">{errors.custom_gender}</p>}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Briefcase className="w-6 h-6 mr-3 text-indigo-500" />
                Occupation
              </label>
              <select
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none"
              >
                <option value="">Select Occupation</option>
                <option value="student">Student</option>
                <option value="farmer">Farmer</option>
                <option value="employed">Employed</option>
                <option value="other">Other</option>
              </select>
              {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
            </div>

            <div className="group">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <DollarSign className="w-6 h-6 mr-3 text-indigo-500" />
                Income Level
              </label>
              <select
                value={formData.occupation === 'student' ? '' : formData.income_level}
                onChange={(e) => handleInputChange('income_level', e.target.value)}
                disabled={formData.occupation === 'student'}
                className={`w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none ${formData.occupation === 'student' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Income Level</option>
                <option value="low">Low</option>
                <option value="middle">Middle</option>
                <option value="high">High</option>
              </select>
              {errors.income_level && <p className="text-red-500 text-sm mt-1">{errors.income_level}</p>}
            </div>
          </div>

          {formData.occupation === 'other' && (
            <div className="group animate-fadeIn">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Briefcase className="w-6 h-6 mr-3 text-indigo-500" />
                Custom Occupation
              </label>
              <input
                type="text"
                value={formData.custom_occupation}
                onChange={(e) => handleInputChange('custom_occupation', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Enter your occupation"
              />
              {errors.custom_occupation && <p className="text-red-500 text-sm mt-1">{errors.custom_occupation}</p>}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Heart className="w-6 h-6 mr-3 text-indigo-500" />
                Marital Status
              </label>
              <select
                value={formData.marital_status}
                onChange={(e) => handleInputChange('marital_status', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none"
              >
                <option value="">Select Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
              {errors.marital_status && <p className="text-red-500 text-sm mt-1">{errors.marital_status}</p>}
            </div>
            
            <div className="group">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <School className="w-6 h-6 mr-3 text-indigo-500" />
                Education Level
              </label>
              <select
                value={formData.education_level}
                onChange={(e) => handleInputChange('education_level', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none"
              >
                <option value="">Select Education Level</option>
                <option value="secondary">Secondary</option>
                <option value="higher_secondary">Higher Secondary</option>
                <option value="ug">UG</option>
                <option value="pg">PG</option>
                <option value="other">Other</option>
              </select>
              {errors.education_level && <p className="text-red-500 text-sm mt-1">{errors.education_level}</p>}
            </div>
          </div>

          {formData.education_level === 'other' && (
            <div className="group animate-fadeIn">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <School className="w-6 h-6 mr-3 text-indigo-500" />
                Custom Education Level
              </label>
              <input
                type="text"
                value={formData.custom_education}
                onChange={(e) => handleInputChange('custom_education', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Enter your education level"
              />
              {errors.custom_education && <p className="text-red-500 text-sm mt-1">{errors.custom_education}</p>}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Home className="w-6 h-6 mr-3 text-indigo-500" />
                Residential Status
              </label>
              <select
                value={formData.residential_status}
                onChange={(e) => handleInputChange('residential_status', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none"
              >
                <option value="">Select Residential Status</option>
                <option value="urban">Urban</option>
                <option value="rural">Rural</option>
              </select>
              {errors.residential_status && <p className="text-red-500 text-sm mt-1">{errors.residential_status}</p>}
            </div>
            
            <div className="group">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Users className="w-6 h-6 mr-3 text-indigo-500" />
                Family Size
              </label>
              <input
                type="number"
                min="1"
                value={formData.family_size}
                onChange={(e) => handleInputChange('family_size', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Enter family size"
              />
              {errors.family_size && <p className="text-red-500 text-sm mt-1">{errors.family_size}</p>}
            </div>
          </div>
          
          <div className="group">
            <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <Heart className="w-6 h-6 mr-3 text-indigo-500" />
              Disability
            </label>
            <select
              value={formData.disability}
              onChange={(e) => handleInputChange('disability', e.target.value)}
              className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none"
            >
              <option value="">Select Disability</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.disability && <p className="text-red-500 text-sm mt-1">{errors.disability}</p>}
          </div>

          {formData.disability === 'yes' && (
            <div className="group animate-fadeIn">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Heart className="w-6 h-6 mr-3 text-indigo-500" />
                Disability Type
              </label>
              <select
                value={formData.disability_type}
                onChange={(e) => handleInputChange('disability_type', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none"
              >
                <option value="">Select Disability Type</option>
                <option value="visual">Visual</option>
                <option value="hearing">Hearing</option>
                <option value="other">Other</option>
              </select>
              {errors.disability_type && <p className="text-red-500 text-sm mt-1">{errors.disability_type}</p>}
            </div>
          )}

          {formData.disability_type === 'other' && (
            <div className="group animate-fadeIn">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <Heart className="w-6 h-6 mr-3 text-indigo-500" />
                Custom Disability
              </label>
              <input
                type="text"
                value={formData.custom_disability}
                onChange={(e) => handleInputChange('custom_disability', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Enter disability type"
              />
              {errors.custom_disability && <p className="text-red-500 text-sm mt-1">{errors.custom_disability}</p>}
            </div>
          )}
          
          <div className="group">
            <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <MapPin className="w-6 h-6 mr-3 text-indigo-500" />
              State
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 bg-gray-50 focus:bg-white group-hover:border-gray-300 appearance-none"
            >
              <option value="">Select State</option>
              <option value="tamil nadu">Tamil Nadu</option>
              <option value="kerala">Kerala</option>
              <option value="karnataka">Karnataka</option>
              <option value="andhra pradesh">Andhra Pradesh</option>
              <option value="telangana">Telangana</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="gujarat">Gujarat</option>
              <option value="rajasthan">Rajasthan</option>
              <option value="uttar pradesh">Uttar Pradesh</option>
              <option value="madhya pradesh">Madhya Pradesh</option>
              <option value="bihar">Bihar</option>
              <option value="west bengal">West Bengal</option>
              <option value="odisha">Odisha</option>
              <option value="jharkhand">Jharkhand</option>
              <option value="chhattisgarh">Chhattisgarh</option>
              <option value="haryana">Haryana</option>
              <option value="punjab">Punjab</option>
              <option value="himachal pradesh">Himachal Pradesh</option>
              <option value="uttarakhand">Uttarakhand</option>
              <option value="assam">Assam</option>
              <option value="Other">Other</option>
            </select>
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>

          {formData.state === 'Other' && (
            <div className="group animate-fadeIn">
              <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <MapPin className="w-6 h-6 mr-3 text-indigo-500" />
                Custom State Name
              </label>
              <input
                type="text"
                value={formData.customState}
                onChange={(e) => handleInputChange('customState', e.target.value)}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-lg text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="Enter your state name"
              />
              {errors.customState && <p className="text-red-500 text-sm mt-1">{errors.customState}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4 shadow-lg shadow-emerald-200">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Review Your Information
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Please verify your details before we create your personalized profile
        </p>
      </div>
      
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-100 border border-gray-100 p-8">
        <div className="space-y-5">
          {[
            { icon: User, label: 'Name', value: formData.name },
            { icon: Calendar, label: 'Age Group', value: {
              'below_18': 'Below 18',
              '18_25': '18-25',
              '25_35': '25-35',
              '35_plus': '35+'
            }[formData.age_group] || formData.age_group },
            { icon: Users, label: 'Gender', value: formData.gender === 'other' ? formData.custom_gender : formData.gender },
            { icon: Briefcase, label: 'Occupation', value: formData.occupation === 'other' ? formData.custom_occupation : formData.occupation },
            { icon: DollarSign, label: 'Income Level', value: formData.income_level },
            { icon: Heart, label: 'Marital Status', value: formData.marital_status },
            { icon: School, label: 'Education Level', value: formData.education_level === 'other' ? formData.custom_education : formData.education_level },
            { icon: Home, label: 'Residential Status', value: formData.residential_status },
            { icon: Users, label: 'Family Size', value: formData.family_size },
            { icon: Heart, label: 'Disability Status', value: formData.disability === 'no' ? 'No' : formData.disability_type === 'other' ? formData.custom_disability : formData.disability_type },
            { icon: MapPin, label: 'State', value: formData.state === 'Other' ? formData.customState : formData.state }
          ].map(({ icon: Icon, label, value }, index) => (
            <div key={label} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mr-5 shadow-lg shadow-blue-200">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">{label}</span>
              </div>
              <span className="text-xl text-gray-700 font-medium">
                {value || <span className="text-gray-400 italic">Not provided</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="max-w-lg mx-auto text-center">
      <div className="mb-10">
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200 animate-bounce">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <div className="absolute inset-0 w-28 h-28 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full mx-auto opacity-20 animate-ping"></div>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
          Profile Created!
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          Your profile has been saved successfully. Redirecting to your personalized recommendations...
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center justify-center space-x-4 text-indigo-600">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium">Loading recommendations...</span>
        </div>
      </div>
      
      {errors.submit && (
        <div className="mt-8 p-8 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl">
          <p className="text-red-700 font-medium text-lg">{errors.submit}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="w-full py-12 px-6">
        {renderStepIndicator()}
        
        <div className="min-h-[500px]">
          {currentStep === 1 && renderProfileDetails()}
          {currentStep === 2 && renderReview()}
          {currentStep === 3 && renderComplete()}
        </div>

        {currentStep < 3 && (
          <div className="max-w-4xl mx-auto mt-12 flex justify-between items-center">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="group inline-flex items-center px-10 py-5 border-2 border-gray-300 rounded-2xl text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 shadow-lg shadow-gray-100"
              >
                <ChevronLeft className="mr-3 h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                Previous
              </button>
            ) : <div></div>}
            
            {currentStep < 2 ? (
              <button
                onClick={nextStep}
                className="group inline-flex items-center px-10 py-5 border-2 border-transparent rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5"
              >
                Continue
                <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : currentStep === 2 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`group inline-flex items-center px-10 py-5 border-2 border-transparent rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:-translate-y-0.5 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <CheckCircle className="mr-3 h-6 w-6" />
                {loading ? 'Submitting...' : 'Save & View Recommendations'}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
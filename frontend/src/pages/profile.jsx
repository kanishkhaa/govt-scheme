import React, { useState, useEffect } from 'react';
import { User, Calendar, Users, Briefcase, DollarSign, MapPin, Edit3, CheckCircle, ChevronLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age_group: '',
    gender: '',
    occupation: '',
    income_level: '',
    state: '',
    customState: ''
  });

  const predefinedStates = [
    '', 'tamil nadu', 'kerala', 'karnataka', 'andhra pradesh', 'telangana', 'maharashtra', 
    'gujarat', 'rajasthan', 'uttar pradesh', 'madhya pradesh', 'bihar', 'west bengal', 
    'odisha', 'jharkhand', 'chhattisgarh', 'haryana', 'punjab', 'himachal pradesh', 
    'uttarakhand', 'assam', 'Other'
  ];

  const formatDisplayValue = (value, field) => {
    if (!value) return 'Not provided';
    if (field === 'state') {
      return value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    if (field === 'age_group') {
      const map = {
        student: 'Student (18-25)',
        'young adult': 'Young Adult (25-35)',
        adult: 'Adult (35+)'
      };
      return map[value] || value;
    }
    if (field === 'gender') {
      const map = {
        female: 'Female',
        male: 'Male',
        other: 'Other'
      };
      return map[value] || value;
    }
    if (field === 'occupation') {
      const map = {
        student: 'Student',
        farmer: 'Farmer',
        employed: 'Employed'
      };
      return map[value] || value;
    }
    if (field === 'income_level') {
      const map = {
        low: 'Low',
        middle: 'Middle',
        high: 'High'
      };
      return map[value] || value;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);

      // Handle custom state for formData
      let stateVal = parsed.state;
      let customStateVal = '';
      if (!predefinedStates.includes(stateVal)) {
        stateVal = 'Other';
        customStateVal = parsed.state;
      }
      setFormData({
        ...parsed,
        state: stateVal,
        customState: customStateVal
      });
    }
    setLoading(false);
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reload from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      let stateVal = parsed.state;
      let customStateVal = '';
      if (!predefinedStates.includes(stateVal)) {
        stateVal = 'Other';
        customStateVal = parsed.state;
      }
      setFormData({
        ...parsed,
        state: stateVal,
        customState: customStateVal
      });
    }
  };

  const handleSave = async () => {
    const submitData = {
      ...formData,
      state: formData.state === 'Other' ? formData.customState : formData.state
    };
    delete submitData.customState;
    localStorage.setItem('userProfile', JSON.stringify(submitData));
    setProfile(submitData);

    // Update formData for consistency
    let stateVal = submitData.state;
    let customStateVal = '';
    if (!predefinedStates.includes(stateVal)) {
      stateVal = 'Other';
      customStateVal = submitData.state;
    }
    setFormData({
      ...submitData,
      state: stateVal,
      customState: customStateVal
    });

    // Re-fetch recommendations with updated profile and save to localStorage
    try {
      const response = await axios.post('http://localhost:5000/recommend', submitData);
      const recommendationData = {
        profile: submitData,
        recommendations: response.data.recommendations,
        query: response.data.query,
        message: response.data.message
      };
      localStorage.setItem('recommendationData', JSON.stringify(recommendationData));
      // Dispatch custom event to notify other components (e.g., Schemes page) of update
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (err) {
      console.error('Failed to update recommendations:', err);
    }

    setEditMode(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-sky-300/20 to-sky-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        <div className="text-center relative z-10 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-sky-300/20 to-sky-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        <div className="text-center max-w-sm relative z-10 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">Please complete your profile to view details and get personalized recommendations.</p>
          <button
            onClick={() => navigate('/profile-form')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm font-medium inline-flex items-center"
          >
            <User className="w-4 h-4 mr-2" />
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const profileFields = [
    { icon: User, label: 'Full Name', value: profile.name, field: 'name', type: 'text' },
    { icon: Calendar, label: 'Age Group', value: profile.age_group, field: 'age_group', type: 'select', options: [
      { value: '', label: 'Select Age Group' },
      { value: 'student', label: 'Student (18-25)' },
      { value: 'young adult', label: 'Young Adult (25-35)' },
      { value: 'adult', label: 'Adult (35+)' }
    ] },
    { icon: Users, label: 'Gender', value: profile.gender, field: 'gender', type: 'select', options: [
      { value: '', label: 'Select Gender' },
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Other' }
    ] },
    { icon: Briefcase, label: 'Occupation', value: profile.occupation, field: 'occupation', type: 'select', options: [
      { value: '', label: 'Select Occupation' },
      { value: 'student', label: 'Student' },
      { value: 'farmer', label: 'Farmer' },
      { value: 'employed', label: 'Employed' }
    ] },
    { icon: DollarSign, label: 'Income Level', value: profile.income_level, field: 'income_level', type: 'select', options: [
      { value: '', label: 'Select Income Level' },
      { value: 'low', label: 'Low' },
      { value: 'middle', label: 'Middle' },
      { value: 'high', label: 'High' }
    ] },
    { icon: MapPin, label: 'State', value: profile.state, field: 'state', type: 'select', options: predefinedStates.map(s => ({
      value: s,
      label: s ? s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : 'Select State'
    })) }
  ];

  return (
    <div className="min-h-screen transition-all duration-1000 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 text-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-sky-300/20 to-sky-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-cyan-300/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 py-8 px-4">
        {/* Header */}
        <header className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-2xl shadow-blue-200 animate-pulse">
            <User className="w-12 h-12 text-white" />
            <Sparkles className="absolute -top-2 -right-8 w-6 h-6 text-blue-300 animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-slate-600 bg-clip-text text-transparent mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Personal information used for personalized recommendations
          </p>
        </header>

        {/* Edit/Save Buttons */}
        <div className="flex justify-center mb-6">
          {editMode ? (
            <div className="flex space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
              <button
                onClick={handleSave}
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-sm"
              >
                <CheckCircle className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="group inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-sm relative overflow-hidden"
            >
              <Edit3 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              Edit Profile
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl"></div>
            </button>
          )}
        </div>

        {/* Profile Details Grid */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200/50 border border-white/50 overflow-hidden">
          <div className="p-6 lg:p-8 bg-gradient-to-r from-indigo-50 to-blue-50/50 border-b border-indigo-100/50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <User className="w-6 h-6 mr-3 text-indigo-600" />
              Personal Information
            </h2>
          </div>
          <div className="p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileFields.map(({ icon: Icon, label, value, field, type, options }, index) => (
              <div 
                key={field} 
                className={`group relative transition-all duration-300 hover:shadow-lg hover:shadow-gray-300/50 ${
                  editMode ? 'ring-2 ring-blue-200/50' : ''
                }`}
              >
                <div className={`bg-white rounded-2xl p-4 lg:p-6 transition-all duration-300 ${
                  editMode 
                    ? 'border-2 border-blue-200/50 shadow-md' 
                    : 'hover:border-blue-100/50 border border-gray-100/50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center mr-3 lg:mr-4 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                        editMode ? 'opacity-80' : ''
                      }`}>
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-2 truncate">{label}</label>
                        {editMode ? (
                          type === 'select' ? (
                            <select
                              value={formData[field]}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm bg-white shadow-sm"
                            >
                              {options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={type}
                              value={formData[field]}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm bg-white shadow-sm"
                            />
                          )
                        ) : (
                          <span className="text-sm lg:text-base font-medium text-gray-900 block leading-tight truncate">{formatDisplayValue(value, field)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {field === 'state' && editMode && formData.state === 'Other' && (
                    <div className="mt-4 p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-2">Custom State</label>
                      <input
                        type="text"
                        value={formData.customState}
                        onChange={(e) => handleInputChange('customState', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm bg-white shadow-sm"
                        placeholder="Enter your state name"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-sm relative overflow-hidden"
          >
            <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
            <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl"></div>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
};

export default Profile;
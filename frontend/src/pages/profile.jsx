import React, { useState, useEffect } from 'react';
import { User, Calendar, Users, Briefcase, DollarSign, MapPin, Edit3, CheckCircle, ChevronLeft, Sparkles, Heart, School, Home } from 'lucide-react';
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
        below_18: 'Below 18',
        '18_25': '18-25',
        '25_35': '25-35',
        '35_plus': '35+'
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
        employed: 'Employed',
        other: 'Other'
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
    if (field === 'marital_status') {
      const map = {
        single: 'Single',
        married: 'Married',
        divorced: 'Divorced',
        widowed: 'Widowed'
      };
      return map[value] || value;
    }
    if (field === 'education_level') {
      const map = {
        secondary: 'Secondary',
        higher_secondary: 'Higher Secondary',
        ug: 'UG',
        pg: 'PG',
        other: 'Other'
      };
      return map[value] || value;
    }
    if (field === 'residential_status') {
      const map = {
        urban: 'Urban',
        rural: 'Rural'
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

      let stateVal = parsed.state;
      let customStateVal = '';
      if (!predefinedStates.includes(stateVal)) {
        stateVal = 'Other';
        customStateVal = parsed.state;
      }

      let genderVal = parsed.gender;
      let customGenderVal = '';
      if (!['female', 'male'].includes(genderVal)) {
        genderVal = 'other';
        customGenderVal = parsed.gender;
      }

      let occupationVal = parsed.occupation;
      let customOccupationVal = '';
      if (!['student', 'farmer', 'employed'].includes(occupationVal)) {
        occupationVal = 'other';
        customOccupationVal = parsed.occupation;
      }

      let educationVal = parsed.education_level;
      let customEducationVal = '';
      if (!['secondary', 'higher_secondary', 'ug', 'pg'].includes(educationVal)) {
        educationVal = 'other';
        customEducationVal = parsed.education_level;
      }

      let disabilityVal = parsed.disability_status === 'none' ? 'no' : 'yes';
      let disabilityTypeVal = parsed.disability_status === 'none' ? '' : parsed.disability_status;
      let customDisabilityVal = '';
      if (disabilityVal === 'yes' && !['visual', 'hearing'].includes(disabilityTypeVal)) {
        disabilityTypeVal = 'other';
        customDisabilityVal = parsed.disability_status;
      }

      setFormData({
        ...parsed,
        state: stateVal,
        customState: customStateVal,
        gender: genderVal,
        custom_gender: customGenderVal,
        occupation: occupationVal,
        custom_occupation: customOccupationVal,
        education_level: educationVal,
        custom_education: customEducationVal,
        disability: disabilityVal,
        disability_type: disabilityTypeVal,
        custom_disability: customDisabilityVal
      });
    }
    setLoading(false);
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      let stateVal = parsed.state;
      let customStateVal = '';
      if (!predefinedStates.includes(stateVal)) {
        stateVal = 'Other';
        customStateVal = parsed.state;
      }

      let genderVal = parsed.gender;
      let customGenderVal = '';
      if (!['female', 'male'].includes(genderVal)) {
        genderVal = 'other';
        customGenderVal = parsed.gender;
      }

      let occupationVal = parsed.occupation;
      let customOccupationVal = '';
      if (!['student', 'farmer', 'employed'].includes(occupationVal)) {
        occupationVal = 'other';
        customOccupationVal = parsed.occupation;
      }

      let educationVal = parsed.education_level;
      let customEducationVal = '';
      if (!['secondary', 'higher_secondary', 'ug', 'pg'].includes(educationVal)) {
        educationVal = 'other';
        customEducationVal = parsed.education_level;
      }

      let disabilityVal = parsed.disability_status === 'none' ? 'no' : 'yes';
      let disabilityTypeVal = parsed.disability_status === 'none' ? '' : parsed.disability_status;
      let customDisabilityVal = '';
      if (disabilityVal === 'yes' && !['visual', 'hearing'].includes(disabilityTypeVal)) {
        disabilityTypeVal = 'other';
        customDisabilityVal = parsed.disability_status;
      }

      setFormData({
        ...parsed,
        state: stateVal,
        customState: customStateVal,
        gender: genderVal,
        custom_gender: customGenderVal,
        occupation: occupationVal,
        custom_occupation: customOccupationVal,
        education_level: educationVal,
        custom_education: customEducationVal,
        disability: disabilityVal,
        disability_type: disabilityTypeVal,
        custom_disability: customDisabilityVal
      });
    }
  };

  const handleSave = async () => {
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
    delete submitData.disability;
    delete submitData.disability_type;
    delete submitData.custom_disability;

    localStorage.setItem('userProfile', JSON.stringify(submitData));
    setProfile(submitData);

    let stateVal = submitData.state;
    let customStateVal = '';
    if (!predefinedStates.includes(stateVal)) {
      stateVal = 'Other';
      customStateVal = submitData.state;
    }

    let genderVal = submitData.gender;
    let customGenderVal = '';
    if (!['female', 'male'].includes(genderVal)) {
      genderVal = 'other';
      customGenderVal = submitData.gender;
    }

    let occupationVal = submitData.occupation;
    let customOccupationVal = '';
    if (!['student', 'farmer', 'employed'].includes(occupationVal)) {
      occupationVal = 'other';
      customOccupationVal = submitData.occupation;
    }

    let educationVal = submitData.education_level;
    let customEducationVal = '';
    if (!['secondary', 'higher_secondary', 'ug', 'pg'].includes(educationVal)) {
      educationVal = 'other';
      customEducationVal = submitData.education_level;
    }

    let disabilityVal = submitData.disability_status === 'none' ? 'no' : 'yes';
    let disabilityTypeVal = submitData.disability_status === 'none' ? '' : submitData.disability_status;
    let customDisabilityVal = '';
    if (disabilityVal === 'yes' && !['visual', 'hearing'].includes(disabilityTypeVal)) {
      disabilityTypeVal = 'other';
      customDisabilityVal = submitData.disability_status;
    }

    setFormData({
      ...submitData,
      state: stateVal,
      customState: customStateVal,
      gender: genderVal,
      custom_gender: customGenderVal,
      occupation: occupationVal,
      custom_occupation: customOccupationVal,
      education_level: educationVal,
      custom_education: customEducationVal,
      disability: disabilityVal,
      disability_type: disabilityTypeVal,
      custom_disability: customDisabilityVal
    });

    try {
      const response = await axios.post('http://localhost:5000/recommend', submitData);
      const recommendationData = {
        profile: submitData,
        recommendations: response.data.recommendations,
        query: response.data.query,
        message: response.data.message
      };
      localStorage.setItem('recommendationData', JSON.stringify(recommendationData));
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (err) {
      console.error('Failed to update recommendations:', err);
    }

    setEditMode(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'occupation' && value === 'student' ? { income_level: 'low' } : {}),
      ...(field === 'occupation' && value !== 'student' ? { income_level: '' } : {})
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-4xl animate-float"></div>
          <div className="absolute -bottom-48 -left-48 w-112 h-112 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-4xl animate-float-delayed"></div>
        </div>
        <div className="text-center relative z-10 bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-blue-200/30">
          <div className="w-10 h-10 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base text-gray-700 font-semibold tracking-wide">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-4xl animate-float"></div>
          <div className="absolute -bottom-48 -left-48 w-112 h-112 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-4xl animate-float-delayed"></div>
        </div>
        <div className="text-center max-w-md relative z-10 bg-white/95 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-blue-200/30">
          <User className="w-20 h-20 text-blue-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">No Profile Found</h2>
          <p className="text-gray-600 mb-8 text-base leading-relaxed tracking-wide">Create your profile to unlock personalized recommendations.</p>
          <button
            onClick={() => navigate('/profile-form')}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base font-semibold relative overflow-hidden"
          >
            <User className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Create Profile
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
          </button>
        </div>
      </div>
    );
  }

  const profileFields = [
    { icon: User, label: 'Full Name', value: profile.name, field: 'name', type: 'text' },
    { icon: Calendar, label: 'Age Group', value: profile.age_group, field: 'age_group', type: 'select', options: [
      { value: '', label: 'Select Age Group' },
      { value: 'below_18', label: 'Below 18' },
      { value: '18_25', label: '18-25' },
      { value: '25_35', label: '25-35' },
      { value: '35_plus', label: '35+' }
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
      { value: 'employed', label: 'Employed' },
      { value: 'other', label: 'Other' }
    ] },
    { icon: DollarSign, label: 'Income Level', value: profile.income_level, field: 'income_level', type: 'select', options: [
      { value: '', label: 'Select Income Level' },
      { value: 'low', label: 'Low' },
      { value: 'middle', label: 'Middle' },
      { value: 'high', label: 'High' }
    ], disabled: formData.occupation === 'student' },
    { icon: Heart, label: 'Marital Status', value: profile.marital_status, field: 'marital_status', type: 'select', options: [
      { value: '', label: 'Select Marital Status' },
      { value: 'single', label: 'Single' },
      { value: 'married', label: 'Married' },
      { value: 'divorced', label: 'Divorced' },
      { value: 'widowed', label: 'Widowed' }
    ] },
    { icon: School, label: 'Education Level', value: profile.education_level, field: 'education_level', type: 'select', options: [
      { value: '', label: 'Select Education Level' },
      { value: 'secondary', label: 'Secondary' },
      { value: 'higher_secondary', label: 'Higher Secondary' },
      { value: 'ug', label: 'UG' },
      { value: 'pg', label: 'PG' },
      { value: 'other', label: 'Other' }
    ] },
    { icon: Home, label: 'Residential Status', value: profile.residential_status, field: 'residential_status', type: 'select', options: [
      { value: '', label: 'Select Residential Status' },
      { value: 'urban', label: 'Urban' },
      { value: 'rural', label: 'Rural' }
    ] },
    { icon: Users, label: 'Family Size', value: profile.family_size, field: 'family_size', type: 'number', min: 1 },
    { icon: Heart, label: 'Disability Status', value: profile.disability_status, field: 'disability', type: 'select', options: [
      { value: '', label: 'Select Disability' },
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ] },
    { icon: MapPin, label: 'State', value: profile.state, field: 'state', type: 'select', options: predefinedStates.map(s => ({
      value: s,
      label: s ? s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : 'Select State'
    })) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 text-gray-900 relative overflow-hidden font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-4xl animate-float"></div>
        <div className="absolute -bottom-48 -left-48 w-112 h-112 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-4xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-cyan-300/15 to-blue-400/15 rounded-full blur-4xl animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 py-16 px-6">
        <header className="text-center mb-12 relative">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mb-6 shadow-2xl shadow-blue-300/40 animate-pulse">
            <User className="w-16 h-16 text-white" />
            <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-blue-200 animate-spin-slow" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-800 bg-clip-text text-transparent mb-4 tracking-tight">
            Your Profile
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium tracking-wide">
            Customize your details for tailored recommendations
          </p>
        </header>

        <div className="flex justify-center mb-12">
          {editMode ? (
            <div className="flex space-x-6 bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-blue-200/30">
              <button
                onClick={handleSave}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-base relative overflow-hidden"
              >
                <CheckCircle className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                Save Changes
                <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
              </button>
              <button
                onClick={handleCancel}
                className="group inline-flex items-center px-8 py-4 border-2 border-blue-200 text-gray-700 rounded-2xl hover:bg-blue-50/50 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-base relative overflow-hidden"
              >
                <ChevronLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                Cancel
                <div className="absolute inset-0 bg-blue-100/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-base relative overflow-hidden"
            >
              <Edit3 className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
              Edit Profile
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
            </button>
          )}
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl shadow-blue-200/30 border border-blue-200/30 overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border-b border-blue-100/30">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <User className="w-8 h-8 mr-4 text-blue-600 animate-pulse" />
              Personal Information
            </h2>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {profileFields.map(({ icon: Icon, label, value, field, type, options, min, disabled }, index) => (
              <div 
                key={field} 
                className={`group relative transition-all duration-500 hover:shadow-xl hover:shadow-blue-200/20 transform hover:-translate-y-1 animate-fadeIn delay-${index * 100}`}
              >
                <div className={`bg-white/95 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 border border-blue-100/30 hover:border-blue-200/50 ${
                  editMode ? 'shadow-md border-blue-200/50' : ''
                }`}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center flex-1">
                      <div className={`w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                        editMode ? 'opacity-80' : ''
                      }`}>
                        <Icon className="w-6 h-6 text-blue-600 group-hover:animate-wiggle" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide">{label}</label>
                        {editMode ? (
                          type === 'select' ? (
                            <select
                              value={formData[field]}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              disabled={disabled}
                              className={`w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                              min={min}
                              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                            />
                          )
                        ) : (
                          <span className="text-base font-medium text-gray-900 block leading-tight truncate">{formatDisplayValue(value, field)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {field === 'state' && editMode && formData.state === 'Other' && (
                    <div className="mt-5 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-blue-100/50 animate-fadeIn">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Custom State</label>
                      <input
                        type="text"
                        value={formData.customState}
                        onChange={(e) => handleInputChange('customState', e.target.value)}
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                        placeholder="Enter your state name"
                      />
                    </div>
                  )}
                  {field === 'gender' && editMode && formData.gender === 'other' && (
                    <div className="mt-5 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-blue-100/50 animate-fadeIn">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Custom Gender</label>
                      <input
                        type="text"
                        value={formData.custom_gender}
                        onChange={(e) => handleInputChange('custom_gender', e.target.value)}
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                        placeholder="Enter your gender"
                      />
                    </div>
                  )}
                  {field === 'occupation' && editMode && formData.occupation === 'other' && (
                    <div className="mt-5 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-blue-100/50 animate-fadeIn">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Custom Occupation</label>
                      <input
                        type="text"
                        value={formData.custom_occupation}
                        onChange={(e) => handleInputChange('custom_occupation', e.target.value)}
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                        placeholder="Enter your occupation"
                      />
                    </div>
                  )}
                  {field === 'education_level' && editMode && formData.education_level === 'other' && (
                    <div className="mt-5 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-blue-100/50 animate-fadeIn">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Custom Education Level</label>
                      <input
                        type="text"
                        value={formData.custom_education}
                        onChange={(e) => handleInputChange('custom_education', e.target.value)}
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                        placeholder="Enter your education level"
                      />
                    </div>
                  )}
                  {field === 'disability' && editMode && formData.disability === 'yes' && (
                    <div className="mt-5 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-blue-100/50 animate-fadeIn">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Disability Type</label>
                      <select
                        value={formData.disability_type}
                        onChange={(e) => handleInputChange('disability_type', e.target.value)}
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                      >
                        <option value="">Select Disability Type</option>
                        <option value="visual">Visual</option>
                        <option value="hearing">Hearing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}
                  {field === 'disability' && editMode && formData.disability_type === 'other' && (
                    <div className="mt-5 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-blue-100/50 animate-fadeIn">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Custom Disability</label>
                      <input
                        type="text"
                        value={formData.custom_disability}
                        onChange={(e) => handleInputChange('custom_disability', e.target.value)}
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                        placeholder="Enter disability type"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-800 to-blue-900 text-white rounded-2xl hover:from-gray-900 hover:to-blue-950 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-base relative overflow-hidden"
          >
            <ChevronLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
            <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
          </button>
        </div>
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'Inter';
          src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(-180deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 18s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 22s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-wiggle { animation: wiggle 0.3s ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
        .delay-700 { animation-delay: 700ms; }
        .delay-800 { animation-delay: 800ms; }
        .delay-900 { animation-delay: 900ms; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  );
};

export default Profile;
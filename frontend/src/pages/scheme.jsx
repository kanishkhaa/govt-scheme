import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MapPin, 
  Award, 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Bookmark, 
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw
} from 'lucide-react';
import { useLocation } from 'react-router-dom'; // Add this import
import axios from 'axios';

const SchemeDisplay = () => {
  const location = useLocation(); // Add this hook
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [sortBy, setSortBy] = useState('similarity');
  const [bookmarked, setBookmarked] = useState(new Set());
  const [userProfile, setUserProfile] = useState(null); // Change to state

  // Extract clean scheme name from the format "scheme_state_doc_1"
  const extractSchemeName = (rawName) => {
    if (!rawName) return 'Unknown Scheme';
    
    let cleanName = rawName
      .replace(/^scheme_/i, '')
      .replace(/_doc_\d+$/i, '')
      .replace(/_\d+$/i, '')
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return cleanName || 'Government Scheme';
  };

  // Process schemes data
  const processSchemes = (recommendations) => {
    return recommendations.map((scheme, index) => ({
      ...scheme,
      id: index + 1,
      cleanName: extractSchemeName(scheme.scheme_name),
      rating: Math.min(5, Math.max(1, Math.round(scheme.similarity * 5))),
      category: getCategoryFromDescription(scheme.description),
      benefits: extractBenefits(scheme.description),
      eligibility: extractEligibility(scheme.description)
    }));
  };

  // Fetch recommendations from the API
  const fetchRecommendations = async (profileData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/recommend', profileData);
      
      setQuery(response.data.query);
      setMessage(response.data.message);
      
      const processedSchemes = processSchemes(response.data.recommendations);
      setSchemes(processedSchemes);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions remain the same
  const getCategoryFromDescription = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('education') || desc.includes('scholarship') || desc.includes('student')) return 'Education';
    if (desc.includes('health') || desc.includes('medical') || desc.includes('insurance')) return 'Healthcare';
    if (desc.includes('agriculture') || desc.includes('farmer') || desc.includes('crop')) return 'Agriculture';
    if (desc.includes('employment') || desc.includes('skill') || desc.includes('job')) return 'Employment';
    if (desc.includes('housing') || desc.includes('home') || desc.includes('shelter')) return 'Housing';
    if (desc.includes('women') || desc.includes('girl') || desc.includes('mother')) return 'Women Welfare';
    return 'General Welfare';
  };

  const extractBenefits = (description) => {
    const benefits = [];
    if (description.includes('free')) benefits.push('Free of Cost');
    if (description.includes('subsidy')) benefits.push('Subsidized');
    if (description.includes('loan')) benefits.push('Financial Support');
    if (description.includes('insurance')) benefits.push('Insurance Coverage');
    return benefits.length > 0 ? benefits : ['Government Support'];
  };

  const extractEligibility = (description) => {
    if (description.includes('women') || description.includes('girl')) return 'For Women';
    if (description.includes('student')) return 'For Students';
    if (description.includes('farmer')) return 'For Farmers';
    if (description.includes('poor') || description.includes('bpl')) return 'For BPL Families';
    return 'Check Eligibility';
  };

  // Filter and sort logic remains the same
  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.cleanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === '' || scheme.state.toLowerCase().includes(selectedState.toLowerCase());
    return matchesSearch && matchesState;
  });

  const sortedSchemes = [...filteredSchemes].sort((a, b) => {
    if (sortBy === 'similarity') return b.similarity - a.similarity;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'name') return a.cleanName.localeCompare(b.cleanName);
    return 0;
  });

  const toggleBookmark = (schemeId) => {
    setBookmarked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schemeId)) {
        newSet.delete(schemeId);
      } else {
        newSet.add(schemeId);
      }
      return newSet;
    });
  };

  // Check for data passed from profile form on component mount
  useEffect(() => {
    const recommendationData = sessionStorage.getItem('recommendationData');
    if (recommendationData) {
      const data = JSON.parse(recommendationData);
      setUserProfile(data.profile);
      setQuery(data.query);
      setMessage(data.message);
      const processedSchemes = processSchemes(data.recommendations);
      setSchemes(processedSchemes);
      sessionStorage.removeItem('recommendationData'); // Clean up
    } else if (location.state && location.state.recommendations) {
      // Fallback for data passed via navigation state
      setUserProfile(location.state.profile);
      setQuery(location.state.query);
      setMessage(location.state.message);
      const processedSchemes = processSchemes(location.state.recommendations);
      setSchemes(processedSchemes);
    } else {
      // Default sample profile if no data available
      const defaultProfile = {
        name: 'John Doe',
        age_group: 'student',
        gender: 'male',
        occupation: 'student',
        income_level: 'low',
        state: 'tamil nadu'
      };
      setUserProfile(defaultProfile);
      fetchRecommendations(defaultProfile);
    }
  }, [location.state]);

  const getCategoryColor = (category) => {
    const colors = {
      'Education': 'bg-blue-100 text-blue-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Agriculture': 'bg-yellow-100 text-yellow-800',
      'Employment': 'bg-purple-100 text-purple-800',
      'Housing': 'bg-indigo-100 text-indigo-800',
      'Women Welfare': 'bg-pink-100 text-pink-800',
      'General Welfare': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['General Welfare'];
  };

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg shadow-blue-200">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Personalized Government Schemes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover government schemes tailored specifically for your profile and needs
          </p>
          {userProfile && (
            <p className="text-lg font-bold text-blue-600 mt-2">Welcome, {userProfile.name}!</p>
          )}
          
        </div>

        {/* Rest of your existing JSX remains the same */}
        {/* ... (Controls Section, Loading State, Error State, etc.) */}
        
        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white min-w-[200px]"
              >
                <option value="">All States</option>
                <option value="tamil nadu">Tamil Nadu</option>
                <option value="kerala">Kerala</option>
                <option value="karnataka">Karnataka</option>
                <option value="maharashtra">Maharashtra</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white min-w-[150px]"
              >
                <option value="similarity">By Relevance</option>
                <option value="rating">By Rating</option>
                <option value="name">By Name</option>
              </select>
            </div>

            <button
              onClick={() => userProfile && fetchRecommendations(userProfile)}
              disabled={loading || !userProfile}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xl text-gray-600">Loading your personalized recommendations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && sortedSchemes.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                <p className="text-emerald-800 font-medium">
                  Found {sortedSchemes.length} schemes matching your profile
                </p>
              </div>
              {message && (
                <span className="text-emerald-600 text-sm">{message}</span>
              )}
            </div>
          </div>
        )}

        {/* Schemes Grid */}
        {!loading && sortedSchemes.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedSchemes.map((scheme) => (
              <div key={scheme.id} className="group bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-8 -translate-y-8"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {[...Array(scheme.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                          ))}
                          <span className="ml-2 text-sm font-medium">({scheme.similarity.toFixed(2)})</span>
                        </div>
                        <h3 className="text-xl font-bold leading-tight mb-2">{scheme.cleanName}</h3>
                        <div className="flex items-center text-blue-100">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm capitalize">{scheme.state}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBookmark(scheme.id)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <Bookmark className={`w-5 h-5 ${bookmarked.has(scheme.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(scheme.category)}`}>
                      {scheme.category}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {scheme.description.length > 150 
                      ? `${scheme.description.substring(0, 150)}...` 
                      : scheme.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Key Benefits:</h4>
                    <div className="flex flex-wrap gap-1">
                      {scheme.benefits.map((benefit, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{scheme.eligibility}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 text-sm font-medium">
                      Learn More
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                    <button className="p-2 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results and other states remain the same */}
        {!loading && sortedSchemes.length === 0 && schemes.length > 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No schemes found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedState('');
              }}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && schemes.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No recommendations available</h3>
            <p className="text-gray-600 mb-6">Please complete your profile to get personalized recommendations</p>
            <button
              onClick={() => userProfile && fetchRecommendations(userProfile)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemeDisplay;
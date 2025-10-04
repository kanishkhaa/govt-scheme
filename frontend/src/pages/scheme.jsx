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
  RefreshCw,
  User,
  X,
  Info,
  FileText,
  GraduationCap,
  Heart,
  Shield,
  Home,
  Briefcase,
  Leaf
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SchemeDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [sortBy, setSortBy] = useState('similarity');
  const [bookmarked, setBookmarked] = useState(new Set());
  const [userProfile, setUserProfile] = useState(null);

  // Enhanced extraction - parses desc if rawName is "Doc"-style
  const extractSchemeName = (rawName, desc) => {
    if (!rawName) return 'Unknown Scheme';
    
    const lowerRaw = rawName.toLowerCase();
    if (lowerRaw.includes('state') || lowerRaw.includes('doc')) {
      const lowerDesc = desc.toLowerCase();
      const schemeRegex = /(?:free|new|tn|muft)\s+([a-z\s]+?scheme(?:\s+\d{4})?)/i;
      const match = lowerDesc.match(schemeRegex);
      if (match && match[1]) {
        let clean = match[1]
          .trim()
          .replace(/\s+/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        if (!clean.toLowerCase().endsWith('scheme')) {
          clean += ' Scheme';
        }
        return clean;
      }
      return 'Government Education Scheme';
    }
    
    let cleanName = rawName
      .replace(/^AP\s+|YSR\s+/i, '')
      .replace(/\s+(?:2020|Phase\s+\d+)$/i, '')
      .replace(/Apply Online Form|Download/i, '')
      .replace(/[_-]/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return cleanName || 'Government Scheme';
  };

  const processSchemes = (recommendations) => {
    return recommendations.map((scheme, index) => ({
      ...scheme,
      id: index + 1,
      cleanName: extractSchemeName(scheme.scheme_name, scheme.description),
      rating: Math.min(5, Math.max(1, Math.round(scheme.similarity * 5))),
      category: getCategoryFromDescription(scheme.description),
      benefits: extractBenefits(scheme.description),
      eligibility: extractEligibility(scheme.description)
    }));
  };

  const loadFromLocalStorage = () => {
    const savedRecData = localStorage.getItem('recommendationData');
    if (savedRecData) {
      const data = JSON.parse(savedRecData);
      setUserProfile(data.profile);
      setQuery(data.query);
      setMessage(data.message);
      const processedSchemes = processSchemes(data.recommendations);
      setSchemes(processedSchemes);
      return true;
    }
    return false;
  };

  const fetchRecommendations = async (profileData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/recommend', profileData);
      
      setQuery(response.data.query);
      setMessage(response.data.message);
      
      const processedSchemes = processSchemes(response.data.recommendations);
      setSchemes(processedSchemes);

      // Save to localStorage for persistence
      const recommendationData = {
        profile: profileData,
        recommendations: response.data.recommendations,
        query: response.data.query,
        message: response.data.message
      };
      localStorage.setItem('recommendationData', JSON.stringify(recommendationData));
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  // Split into top 3 and suggestions
  const topRecommendations = sortedSchemes.slice(0, 3);
  const suggestedSchemes = sortedSchemes.slice(3);

  const toggleBookmark = (schemeId) => {
    setBookmarked(prev => {
      const newSet = new Set(prev);
      const wasBookmarked = newSet.has(schemeId);
      if (wasBookmarked) {
        newSet.delete(schemeId);
      } else {
        newSet.add(schemeId);
      }
      localStorage.setItem('bookmarkedSchemes', JSON.stringify(Array.from(newSet)));
      localStorage.setItem(`bookmark_${schemeId}`, (!wasBookmarked).toString());
      return newSet;
    });
  };

  // Initial load on mount
  useEffect(() => {
    let loaded = false;
    if (loadFromLocalStorage()) {
      loaded = true;
    } else if (location.state && location.state.recommendations) {
      setUserProfile(location.state.profile);
      setQuery(location.state.query);
      setMessage(location.state.message);
      const processedSchemes = processSchemes(location.state.recommendations);
      setSchemes(processedSchemes);
      // Save to localStorage for future refreshes
      localStorage.setItem('recommendationData', JSON.stringify(location.state));
      loaded = true;
    } 

    if (!loaded) {
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

    const storedBook = localStorage.getItem('bookmarkedSchemes');
    if (storedBook) {
      setBookmarked(new Set(JSON.parse(storedBook)));
    }
  }, [location.state]);

  // Listen for profile updates (e.g., from Profile component save)
  useEffect(() => {
    const handleProfileUpdate = () => {
      loadFromLocalStorage();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      'Education': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
      'Healthcare': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800',
      'Agriculture': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800',
      'Employment': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800',
      'Housing': 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800',
      'Women Welfare': 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800',
      'General Welfare': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
    };
    return colors[category] || colors['General Welfare'];
  };

  const formatState = (state) => {
    return state.replace(/\b\w/g, l => l.toUpperCase()).replace(/ Nadu$/, ' Nadu');
  };

  // Render a scheme card with compact, uniform sizing
  const renderSchemeCard = (scheme, isTop = false) => (
    <div 
      key={scheme.id} 
      className="group bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 overflow-visible hover:shadow-xl hover:shadow-gray-200 transition-all duration-300 transform hover:-translate-y-1 h-[480px] flex flex-col relative" // overflow-visible for badge
    >
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white relative overflow-hidden flex-shrink-0"> {/* Reduced padding */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-6 -translate-y-6 blur-lg"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {[...Array(scheme.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                ))}
                <span className="ml-2 text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">({(scheme.similarity * 100).toFixed(0)}%)</span>
              </div>
              <h3 className="text-lg font-bold leading-tight mb-1 drop-shadow-sm line-clamp-2">{scheme.cleanName}</h3> {/* Reduced font size */}
              <div className="flex items-center text-blue-100 text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="font-medium">{formatState(scheme.state)}</span>
              </div>
            </div>
            <button
              onClick={() => toggleBookmark(scheme.id)}
              className="p-1.5 hover:bg-white/30 rounded-full transition-all duration-200 transform hover:scale-110"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked.has(scheme.id) ? 'fill-current text-yellow-300' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col relative z-10"> {/* Reduced padding, flex to fill space */}
        {isTop && (
          <div className="absolute -top-4 left-2 z-20"> {/* Adjusted position for better alignment, z-index for stacking */}
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">Top Pick</div>
          </div>
        )}
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(scheme.category)}`}>
            {scheme.category}
          </span>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-2 flex-1"> {/* Reduced lines, flex to push buttons down */}
          {scheme.description.length > 120 
            ? `${scheme.description.substring(0, 120)}...` 
            : scheme.description}
        </p>

        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
            Key Benefits:
          </h4>
          <div className="flex flex-wrap gap-1">
            {scheme.benefits.map((benefit, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-md text-xs font-medium border border-green-200">
                <CheckCircle className="w-2 h-2 mr-1" />
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-md">
            <Users className="w-3 h-3 mr-1 text-blue-500" />
            <span className="font-medium">{scheme.eligibility}</span>
          </div>
        </div>

        {/* Buttons fixed at bottom */}
        <div className="flex gap-2 mt-auto"> {/* mt-auto to push to bottom */}
          <button 
            onClick={() => {
              // Record view in localStorage for dashboard
              let viewed = JSON.parse(localStorage.getItem('viewedSchemes') || '[]');
              const newView = { id: scheme.id, timestamp: Date.now() };
              const existsIndex = viewed.findIndex(v => v.id === scheme.id);
              if (existsIndex > -1) {
                viewed[existsIndex] = newView;
              } else {
                viewed.push(newView);
              }
              localStorage.setItem('viewedSchemes', JSON.stringify(viewed));
              navigate(`/scheme/${scheme.id}`, { state: { scheme } });
            }}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-xs font-semibold shadow-md hover:shadow-lg"
          >
            Learn More
            <ChevronRight className="w-3 h-3 ml-1" />
          </button>
          <button className="p-2 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
            <Share2 className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/30">
      {/* Enhanced Header with Profile Summary */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-2xl shadow-blue-200 animate-pulse">
              <Award className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-slate-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
              Personalized Government Schemes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Discover government schemes tailored specifically for your profile and needs
            </p>
            {userProfile && (
              <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 max-w-md mx-auto">
                <div className="flex items-center justify-center mb-3">
                  <User className="w-8 h-8 text-blue-600 mr-3" />
                  <span className="text-lg font-bold text-blue-600">Welcome, {userProfile.name}!</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div><span className="font-medium">Age:</span> {userProfile.age_group}</div>
                  <div><span className="font-medium">Occupation:</span> {userProfile.occupation}</div>
                  <div><span className="font-medium">State:</span> {formatState(userProfile.state)}</div>
                  <div><span className="font-medium">Income:</span> {userProfile.income_level}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative -mt-8 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Controls Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200 border border-white/50 p-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search schemes by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-lg text-gray-900 placeholder-gray-400 bg-white/50 shadow-inner"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="pl-12 pr-8 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 appearance-none bg-white/50 min-w-[220px] text-lg"
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
                className="px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 appearance-none bg-white/50 min-w-[180px] text-lg"
              >
                <option value="similarity">By Relevance</option>
                <option value="rating">By Rating</option>
                <option value="name">By Name</option>
              </select>
            </div>

            <button
              onClick={() => userProfile && fetchRecommendations(userProfile)}
              disabled={loading || !userProfile}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 transform hover:-translate-y-0.5"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-semibold text-lg">Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6 shadow-xl"></div>
            <p className="text-2xl text-gray-600 font-medium">Loading your personalized recommendations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-8 mb-12 shadow-xl">
            <div className="flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 mr-4" />
              <p className="text-red-800 font-semibold text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && sortedSchemes.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-3xl p-8 mb-12 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-ping"></div>
                <CheckCircle className="w-8 h-8 text-emerald-600 mr-3" />
                <p className="text-emerald-800 font-bold text-xl">
                  Found {sortedSchemes.length} schemes matching your profile
                </p>
              </div>
              {message && (
                <span className="text-emerald-600 text-sm font-medium bg-emerald-100 px-3 py-1 rounded-full">{message}</span>
              )}
            </div>
          </div>
        )}

        {/* Top Recommendations Section */}
        {!loading && topRecommendations.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center mb-8">
              <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-indigo-600 mr-4 rounded-full shadow-lg"></div>
              <h2 className="text-4xl font-bold text-gray-900 drop-shadow-md">Top 3 Recommendations</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Reduced gap */}
              {topRecommendations.map(scheme => renderSchemeCard(scheme, true))}
            </div>
          </section>
        )}

        {/* Suggested Schemes Section */}
        {!loading && suggestedSchemes.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center mb-8">
              <div className="w-3 h-12 bg-gradient-to-b from-emerald-500 to-green-600 mr-4 rounded-full shadow-lg"></div>
              <h2 className="text-4xl font-bold text-gray-900 drop-shadow-md">Various Suggested Schemes</h2>
              <p className="text-gray-600 ml-16 text-lg font-medium">You may also be eligible for these based on your profile</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Reduced gap */}
              {suggestedSchemes.map(renderSchemeCard)}
            </div>
          </section>
        )}

        {/* No Results */}
        {!loading && sortedSchemes.length === 0 && schemes.length > 0 && (
          <div className="text-center py-32">
            <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Search className="w-14 h-14 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No schemes found</h3>
            <p className="text-gray-600 text-lg mb-8">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedState('');
              }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold text-lg"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && schemes.length === 0 && !error && (
          <div className="text-center py-32">
            <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <AlertCircle className="w-14 h-14 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No recommendations available</h3>
            <p className="text-gray-600 text-lg mb-8">Please complete your profile to get personalized recommendations</p>
            <button
              onClick={() => userProfile && fetchRecommendations(userProfile)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold text-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SchemeDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const scheme = location.state?.scheme;
  const [appliedStatus, setAppliedStatus] = useState(null); // Default to null
  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // For tabbed navigation

  useEffect(() => {
    if (scheme) {
      // Check if already applied from localStorage
      const savedStatus = localStorage.getItem(`applied_${scheme.id}`);
      if (savedStatus) {
        setAppliedStatus(savedStatus === 'yes' ? 'Yes' : 'No');
      }
      // Check bookmark from localStorage
      const savedBookmark = localStorage.getItem(`bookmark_${scheme.id}`);
      setBookmarked(savedBookmark === 'true');
    }
  }, [scheme]);

  const handleAppliedResponse = (response) => {
    setAppliedStatus(response);
    localStorage.setItem(`applied_${scheme.id}`, response.toLowerCase());
  };

  const toggleBookmark = () => {
    const current = localStorage.getItem(`bookmark_${scheme.id}`) === 'true';
    const newStatus = !current;
    localStorage.setItem(`bookmark_${scheme.id}`, newStatus.toString());

    // Update the array for dashboard
    let bookmarkedArr = JSON.parse(localStorage.getItem('bookmarkedSchemes') || '[]');
    if (newStatus) {
      if (!bookmarkedArr.includes(scheme.id)) {
        bookmarkedArr.push(scheme.id);
      }
    } else {
      bookmarkedArr = bookmarkedArr.filter(id => id !== scheme.id);
    }
    localStorage.setItem('bookmarkedSchemes', JSON.stringify(bookmarkedArr));

    setBookmarked(newStatus);
  };

  const formatState = (state) => {
    return state.replace(/\b\w/g, l => l.toUpperCase()).replace(/ Nadu$/, ' Nadu');
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Education': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
      'Healthcare': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800',
      'Agriculture': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800',
      'Employment': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800',
      'Housing': 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800',
      'Women Welfare': 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800',
      'General Welfare': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
    };
    return colors[category] || colors['General Welfare'];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Education': <GraduationCap className="w-6 h-6" />,
      'Healthcare': <Heart className="w-6 h-6" />,
      'Agriculture': <Leaf className="w-6 h-6" />,
      'Employment': <Briefcase className="w-6 h-6" />,
      'Housing': <Home className="w-6 h-6" />,
      'Women Welfare': <Shield className="w-6 h-6" />,
      'General Welfare': <Info className="w-6 h-6" />
    };
    return icons[category] || icons['General Welfare'];
  };

  // Improved sentence splitting with better handling for abbreviations, newlines, and short texts
  const splitIntoSentences = (text) => {
    // Normalize whitespace and replace newlines with spaces
    let normalized = text.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
    // Remove trailing artifacts like "save as pdf"
    normalized = normalized.replace(/save as pdf\.$/i, '').trim();
    // Enhanced regex: split on .!? followed by space and capital, or force split on common abbreviations
    const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?][a-z]{1,3}\.)\s+(?=[A-Z])/g; // Handles e.g., "U.S.A."
    const sentences = normalized.split(sentenceRegex).map(s => s.trim()).filter(s => s.length > 0);
    // If no splits, treat as single sentence or split on commas for long texts
    if (sentences.length === 1 && sentences[0].length > 100) {
      return sentences[0].split(/[;,]/).map(s => s.trim()).filter(s => s.length > 5);
    }
    // Filter short sentences
    return sentences.filter(s => s.length > 10);
  };

  // Enhanced extraction for key points with fallback categorization, improved for scheme texts
  const extractKeyPoints = (description) => {
    // Preprocess: normalize and split into sentences
    let sentences = splitIntoSentences(description);

    // If sentences are still too long, chunk them further (max 20 words per point)
    const chunkSentences = (sents) => {
      const chunks = [];
      let currentChunk = '';
      sents.forEach(sent => {
        if ((currentChunk + ' ' + sent).split(/\s+/).length > 20) { // ~100 chars approx
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = sent;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sent;
        }
      });
      if (currentChunk) chunks.push(currentChunk.trim());
      return chunks;
    };

    sentences = chunkSentences(sentences);

    const keyPoints = [];
    const sections = {
      objective: /(objective|aim|purpose|goal|target|focus|improve|encourage)/i,
      features: /(features?|benefits?|provides|offers|includes|key|main|upgrade|change|instead)/i,
      eligibility: /(eligibility|criteria|who can|target|beneficiaries|apply|eligible|class|students|studying)/i,
      application: /(apply|how to|process|procedure|application|form|submit|orders|issued|proposal)/i,
      background: /(background|history|launched|introduced|since|already|distributing|running)/i,
      budget: /(outlay|budget|allocated|cost|rs|crore|expenses)/i,
      uniforms: /(uniforms|dress code|new uniforms|trousers|shirts|skirts|kameez)/i
    };

    let currentSection = 'Overview';

    sentences.forEach(sentence => {
      const cleanSentence = sentence.toLowerCase();
      let matchedSection = false;
      let matchedSectionName = null;

      for (const [sectionName, regex] of Object.entries(sections)) {
        if (regex.test(cleanSentence)) {
          const displayName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('features', 'Key Features').replace('eligibility', 'Eligibility').replace('budget', 'Budget').replace('uniforms', 'New Uniforms');
          currentSection = displayName;
          matchedSection = true;
          matchedSectionName = currentSection;
          // Ensure section exists
          let currentKp = keyPoints.find(kp => kp.section === currentSection);
          if (!currentKp) {
            currentKp = { section: currentSection, points: [] };
            keyPoints.push(currentKp);
          }
          break; // Match only the first section
        }
      }

      // Always add the sentence to the appropriate section's points
      let targetKp;
      if (matchedSection) {
        // Add to the newly matched section
        targetKp = keyPoints.find(kp => kp.section === matchedSectionName);
      } else {
        // Add to current section
        targetKp = keyPoints.find(kp => kp.section === currentSection) || 
          (keyPoints.push({ section: currentSection, points: [] }), keyPoints[keyPoints.length - 1]);
      }

      // Skip adding if it's a pure header (e.g., "Features:")
      const trimmedLower = sentence.trim().toLowerCase();
      const pureHeaderRegex = /^(objective|aim|purpose|goal|target|features?|benefits?|eligibility|criteria|who can|target|beneficiaries|apply|eligible|application|how to|process|procedure|form|submit|background|history|launched|introduced|since):\s*$/i;
      if (!pureHeaderRegex.test(trimmedLower)) {
        // If there's a colon, add only the content after it
        if (trimmedLower.includes(':')) {
          const content = sentence.split(':')[1]?.trim();
          if (content) {
            targetKp.points.push(content);
          } else {
            targetKp.points.push(sentence);
          }
        } else {
          targetKp.points.push(sentence);
        }
      }
    });

    // Fallback: If only Overview, auto-categorize into standard sections
    if (keyPoints.length === 1 && keyPoints[0].section === 'Overview') {
      const overviewPoints = keyPoints[0].points;
      const sectionsMap = {
        'Key Benefits': [],
        'Eligibility': [],
        'Budget': [],
        'Implementation': [],
        'New Uniforms': []
      };

      overviewPoints.forEach(point => {
        const lower = point.toLowerCase();
        if (lower.includes('free') || lower.includes('provide') || lower.includes('benefit') || lower.includes('support') || lower.includes('shoes') || lower.includes('sock') || lower.includes('instead')) {
          sectionsMap['Key Benefits'].push(point);
        } else if (lower.includes('eligible') || lower.includes('criteria') || lower.includes('student') || lower.includes('women') || lower.includes('girl') || lower.includes('who') || lower.includes('class') || lower.includes('studying')) {
          sectionsMap['Eligibility'].push(point);
        } else if (lower.includes('rs') || lower.includes('crore') || lower.includes('budget') || lower.includes('outlay') || lower.includes('allocated')) {
          sectionsMap['Budget'].push(point);
        } else if (lower.includes('implemented') || lower.includes('launched') || lower.includes('year') || lower.includes('orders') || lower.includes('proposal')) {
          sectionsMap['Implementation'].push(point);
        } else if (lower.includes('uniform') || lower.includes('dress') || lower.includes('trousers') || lower.includes('shirts') || lower.includes('skirts')) {
          sectionsMap['New Uniforms'].push(point);
        } else {
          sectionsMap['Key Benefits'].push(point);
        }
      });

      keyPoints = Object.entries(sectionsMap)
        .filter(([, points]) => points.length > 0)
        .map(([section, points]) => ({ section, points }));
    }

    // If still empty, use full description as Overview
    if (keyPoints.length === 0) {
      keyPoints.push({ section: 'Overview', points: [description.trim()] });
    }

    // Limit points per section to 5-6 for brevity and filter empty
    return keyPoints
      .map(kp => ({
        ...kp,
        points: kp.points.length > 6 ? kp.points.slice(0, 6) : kp.points
      }))
      .filter(kp => kp.points.length > 0);
  };

  // Enhanced rendering for key points with icons and better styling
  const renderKeyPoints = (keyPoints) => (
    <div className="space-y-8">
      {keyPoints.map(({ section, points }, sectionIdx) => (
        <div key={sectionIdx} className="group">
          <h3 className="text-xl font-bold flex items-center text-gray-800 mb-4 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border-l-4 border-blue-500">
            {section !== 'Overview' && <CheckCircle className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0" />}
            <span className="flex-1">{section}</span>
          </h3>
          <div className="space-y-3">
            {points.map((point, pointIdx) => {
              const formattedPoint = point.charAt(0).toUpperCase() + point.slice(1).trim();
              return (
                <div 
                  key={pointIdx} 
                  className="p-4 rounded-xl bg-white/70 border border-gray-200 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 text-gray-700 leading-relaxed text-sm break-words backdrop-blur-sm"
                >
                  <div className="flex">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>{formattedPoint}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  if (!scheme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Scheme not found</h2>
          <button
            onClick={() => navigate('/scheme')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          >
            Back to Schemes
          </button>
        </div>
      </div>
    );
  }

  const keyPoints = extractKeyPoints(scheme.description);

  // Fallback for hero overview if no Overview section
  const overviewText = keyPoints.find(kp => kp.section === 'Overview')?.points?.slice(0, 2).join('. ') || 
                       scheme.description.substring(0, 150) + '...';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'details', label: 'Details', icon: FileText }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Enhanced Hero Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{scheme.cleanName}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">{overviewText}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div className="flex items-center mb-2">
                    {[...Array(scheme.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-gray-700">({(scheme.similarity * 100).toFixed(0)}% Match)</span>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(scheme.category)}`}>
                    {getCategoryIcon(scheme.category)}
                    <span className="ml-1">{scheme.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="font-medium">{formatState(scheme.state)}</span>
              </div>
            </div>

            {/* Quick Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold flex items-center text-gray-800 mb-4">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Key Benefits
                </h3>
                <ul className="space-y-3">
                  {scheme.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 transition-all duration-200">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold flex items-center text-gray-800 mb-4">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  Eligibility
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed bg-blue-50 p-3 rounded-xl">{scheme.eligibility}</p>
                  {appliedStatus === 'Yes' ? (
                    <div className="flex items-center justify-center gap-4 p-3 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-semibold">Applied</span>
                      <button 
                        onClick={() => handleAppliedResponse('No')}
                        className="ml-auto px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleAppliedResponse('Yes')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-md ${
                          appliedStatus === 'Yes' 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700'
                        }`}
                      >
                        Yes, Applied
                      </button>
                      <button
                        onClick={() => handleAppliedResponse('No')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-md border-2 ${
                          appliedStatus === 'No' 
                            ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Not Yet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'details':
        return (
          <div className="space-y-8">
            {renderKeyPoints(keyPoints)}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/30">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/scheme')}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5 rotate-180 mr-2" />
              Back to Recommendations
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  alert(`Sharing ${scheme.cleanName}... (Demo)`);
                }}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
                  bookmarked ? 'bg-yellow-50 text-yellow-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-slate-600 bg-clip-text text-transparent">
                {scheme.cleanName}
              </h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="font-medium">{formatState(scheme.state)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-8 px-6 py-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {renderTabContent()}
          </div>

          {/* Enhanced Action Buttons - Fixed at bottom on mobile, integrated on desktop */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-t border-gray-200 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  handleAppliedResponse('Yes');
                  alert(`Application for ${scheme.cleanName} submitted successfully! (Demo - In production, this would redirect to official portal or process form.)`);
                }}
                className="flex-1 max-w-md inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold transform hover:-translate-y-0.5 text-base"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Apply Now
              </button>
              <button 
                onClick={() => {
                  alert(`Download form for ${scheme.cleanName}. Please visit the official Tamil Nadu Education Department website (tn.gov.in) for the latest forms and guidelines. (Demo)`);
                }}
                className="flex-1 max-w-md inline-flex items-center justify-center px-6 py-4 border-2 border-blue-600 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SchemeDisplay, SchemeDetail };
export default SchemeDisplay;
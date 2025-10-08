import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  Star, 
  Users, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ChevronLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ApplicationPage = () => {
  const navigate = useNavigate();
  const [allSchemes, setAllSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedState, setSelectedState] = useState('All States');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [amountRange, setAmountRange] = useState([0, 500000]); // Min/Max amount filter
  const [sortBy, setSortBy] = useState('name'); // name, amount-desc, amount-asc

  // Derived states
  const categories = ['All Categories', 'Education', 'Healthcare', 'Agriculture', 'Employment', 'Housing', 'Women Welfare', 'General Welfare'];
  const uniqueStates = ['All States', ...Array.from(new Set(allSchemes.map(s => s.state_formatted || s.state)))];

  // Category display and colors
  const catDisplay = {
    'Education': 'Edu',
    'Healthcare': 'Health',
    'Agriculture': 'Agri',
    'Employment': 'Employ',
    'Housing': 'Housing',
    'Women Welfare': 'Women',
    'General Welfare': 'General'
  };

  const getCatColor = (category) => {
    switch (category) {
      case 'Education': return 'bg-blue-100 text-blue-800';
      case 'Healthcare': return 'bg-green-100 text-green-800';
      case 'Agriculture': return 'bg-yellow-100 text-yellow-800';
      case 'Employment': return 'bg-purple-100 text-purple-800';
      case 'Housing': return 'bg-orange-100 text-orange-800';
      case 'Women Welfare': return 'bg-pink-100 text-pink-800';
      case 'General Welfare': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to title case
  const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  // Extract scheme names from text
  const extractSchemeNamesFromText = (rawText) => {
    const cleanText = (text) => {
      let cleaned = text.replace(/\(adsbygoogle=window\.adsbygoogle\|\|\[\]\)\.push\(\{\}\);/g, '');
      cleaned = cleaned.replace(/Table of Contents/g, '');
      cleaned = cleaned.replace(/\n+/g, ' ');
      cleaned = cleaned.replace(/\s+/g, ' ');
      cleaned = cleaned.replace(/[^\w\s]/g, '');
      cleaned = cleaned.toLowerCase().trim();
      return cleaned;
    };

    const cleaned = cleanText(rawText);
    const fullNames = [];

    const prefixes = ['ysr', 'jagananna', 'ap', 'amma', 'raithu', 'arogya', 'asara', 'vidya', 'deevena', 'gorumudda', 'kanuka', 'saswatha', 'indiramma', 'ntr', 'manabadi', 'matsyakara'];
    prefixes.forEach(prefix => {
      const pattern = new RegExp(`(?:${prefix})\\s+([a-z\\s]+?)\\s*scheme`, 'gi');
      let match;
      while ((match = pattern.exec(cleaned)) !== null) {
        const middle = toTitleCase(match[1].trim());
        fullNames.push(`${prefix.toUpperCase()} ${middle} Scheme`);
      }
    });

    const schemePattern = /\b([a-z]+(?:\s+[a-z]+)+?)\s+scheme\b/gi;
    let match;
    while ((match = schemePattern.exec(cleaned)) !== null) {
      const name = toTitleCase(match[1].trim()) + ' Scheme';
      if (name.length > 10 && !fullNames.some(n => n.toLowerCase() === name.toLowerCase())) {
        fullNames.push(name);
      }
    }

    const uniqueNames = [...new Set(fullNames)].filter(name => name && name.length > 5);
    uniqueNames.sort((a, b) => b.length - a.length);
    return uniqueNames;
  };

  useEffect(() => {
    fetchAllSchemes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedState, searchTerm, selectedCategory, amountRange, sortBy, allSchemes]);

  const fetchAllSchemes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/all-schemes');
      const schemes = response.data.schemes || [];
      
      const processed = schemes.map((scheme, index) => {
        let cleanSchemeName = scheme.scheme_name;
        if (!cleanSchemeName || cleanSchemeName.trim() === '' || cleanSchemeName.toLowerCase().includes('doc')) {
          const extracted = extractSchemeNamesFromText(scheme.description || '');
          let fallback = '';
          if (scheme.doc_name) {
            fallback = scheme.doc_name.replace(/\.pdf$/i, '').replace(/-/g, ' ').trim();
            if (fallback) {
              fallback = toTitleCase(fallback) + ' Scheme';
            }
          }
          cleanSchemeName = extracted[0] || fallback || 'Unknown Scheme';
        }

        return {
          ...scheme,
          id: scheme.id || index + 1,
          cleanName: cleanSchemeName,
          state_formatted: scheme.state ? scheme.state.replace(/\b\w/g, l => l.toUpperCase()).replace(/ Nadu$/, ' Nadu') : 'National',
          rating: Math.floor(Math.random() * 5) + 1,
          category: scheme.category || 'General Welfare',
          benefits: scheme.benefits || ['Government Support'],
          eligibility: scheme.eligibility || 'Check Eligibility',
          amount: scheme.amount || Math.floor(Math.random() * 100000) + 1000
        };
      });
      
      setAllSchemes(processed);
      setFilteredSchemes(processed);
    } catch (err) {
      setError('Failed to fetch schemes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allSchemes];

    if (selectedState !== 'All States') {
      filtered = filtered.filter(s => (s.state_formatted || s.state) === selectedState);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.cleanName.toLowerCase().includes(term) || 
        s.description.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    filtered = filtered.filter(s => s.amount >= amountRange[0] && s.amount <= amountRange[1]);

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.cleanName.localeCompare(b.cleanName);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    setFilteredSchemes(filtered);
  };

  const groupedSchemes = useMemo(() => {
    return filteredSchemes.reduce((acc, scheme) => {
      const stateKey = scheme.state_formatted || scheme.state || 'Unknown';
      const catKey = scheme.category || 'General Welfare';
      if (!acc[stateKey]) acc[stateKey] = {};
      if (!acc[stateKey][catKey]) acc[stateKey][catKey] = [];
      acc[stateKey][catKey].push(scheme);
      return acc;
    }, {});
  }, [filteredSchemes]);

  const renderSchemeCard = (scheme) => (
    <div 
      key={scheme.id} 
      className="group bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200 transition-all duration-300 transform hover:-translate-y-1 h-[420px] flex flex-col relative cursor-pointer"
      onClick={() => navigate(`/scheme/${scheme.id}`, { state: { scheme } })}
    >
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-6 -translate-y-6 blur-lg"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center mb-2 text-blue-100 text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="font-medium">{scheme.state_formatted || scheme.state}</span>
              </div>
              <h3 className="text-lg font-bold leading-tight line-clamp-2">{scheme.cleanName}</h3>
              <div className="flex items-center mt-2">
                {[...Array(scheme.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getCatColor(scheme.category)}`}>
            {scheme.category}
          </span>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-3 flex-1">
          {scheme.description.substring(0, 150)}...
        </p>

        <div className="mb-3 space-y-1">
          <h4 className="text-xs font-semibold text-gray-800 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
            Key Benefits:
          </h4>
          <div className="flex flex-wrap gap-1">
            {scheme.benefits.slice(0, 2).map((benefit, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
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

        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm font-semibold text-green-600">₹{scheme.amount?.toLocaleString()}</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading schemes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">{error}</p>
          <button 
            onClick={fetchAllSchemes}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/30">
      {/* Header */}
      <div className="relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-400 via-gray-500 to-slate-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">🏛️</h1>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-slate-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            All Government Schemes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Explore schemes across all states with advanced filters
          </p>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Filters Section */}
 <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200 border border-white/50 p-6 mb-8">
  <div className="flex flex-wrap items-center gap-4">
    {/* Search */}
    <div className="relative flex-1 min-w-[1000px]">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
      <input
        type="text"
        placeholder="Search schemes by name or description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm text-gray-900 placeholder-gray-400 bg-white/50"
      />
    </div>
    {/* State */}
    <select
      value={selectedState}
      onChange={(e) => setSelectedState(e.target.value)}
      className="min-w-[120px] px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 appearance-none bg-white/50 text-sm"
    >
      {uniqueStates.map(state => (
        <option key={state} value={state}>{state}</option>
      ))}
    </select>
    {/* Category */}
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="min-w-[140px] px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 appearance-none bg-white/50 text-sm"
    >
      {categories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
    {/* Amount Range */}
    <div className="flex items-center min-w-[180px] space-x-2">
      <input
        type="number"
        placeholder="Min Amount"
        value={amountRange[0]}
        onChange={(e) => setAmountRange([parseInt(e.target.value) || 0, amountRange[1]])}
        className="flex-1 px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
      <span className="text-gray-500">-</span>
      <input
        type="number"
        placeholder="Max Amount"
        value={amountRange[1]}
        onChange={(e) => setAmountRange([amountRange[0], parseInt(e.target.value) || 500000])}
        className="flex-1 px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
    </div>
    {/* Sort By */}
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="min-w-[160px] px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 appearance-none bg-white/50 text-sm"
    >
      <option value="name">🔤Sort by Name</option>
      <option value="amount-asc">⬆️Amount (Low to High)</option>
      <option value="amount-desc">⬇️Amount (High to Low)</option>
    </select>
  </div>
</div>

        {/* Results Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 shadow-xl border border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-gray-800">
                Showing {filteredSchemes.length} of {allSchemes.length} schemes
              </span>
            </div>
            <button 
              onClick={() => {
                setSelectedState('All States');
                setSearchTerm('');
                setSelectedCategory('All Categories');
                setAmountRange([0, 500000]);
                setSortBy('name');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Grouped Schemes */}
        {Object.entries(groupedSchemes)
          .sort(([stateA], [stateB]) => stateA.localeCompare(stateB))
          .map(([state, stateCategories]) => (
            <section key={state} className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b-2 border-blue-500 pb-2">
                {state}
              </h2>
              {Object.entries(stateCategories)
                .sort(([catA], [catB]) => catA.localeCompare(catB))
                .map(([cat, catSchemes]) => (
                  <div key={cat} className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center pl-4 border-l-4 border-blue-500">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold mr-3 ${getCatColor(cat)}`}>
                        {catDisplay[cat] || cat}
                      </span>
                      {cat} ({catSchemes.length} schemes)
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {catSchemes.map(renderSchemeCard)}
                    </div>
                  </div>
                ))}
            </section>
          ))}

        {/* No Results */}
        {filteredSchemes.length === 0 && !loading && (
          <div className="text-center py-32">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No schemes found</h3>
            <p className="text-gray-600 text-lg mb-8">Try adjusting your filters</p>
            <button
              onClick={() => {
                setSelectedState('All States');
                setSearchTerm('');
                setSelectedCategory('All Categories');
                setAmountRange([0, 500000]);
                setSortBy('name');
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationPage;
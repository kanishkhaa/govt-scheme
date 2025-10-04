import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  Bell, 
  User,
  FileText,
  TrendingUp,
  Gift,
  XCircle,
  Clock,
  Eye,
  ArrowRight,
  Calendar,
  Sparkles,
  Award,
  Target
} from 'lucide-react';

const Dashboard = () => {
  const [username, setUsername] = useState('John Doe');
  const [profile, setProfile] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Functions copied from SchemeDisplay
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

  const fetchRecommendations = async (profileData) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/recommend', profileData);
      const processedSchemes = processSchemes(response.data.recommendations);
      setSchemes(processedSchemes);
      localStorage.setItem('userSchemes', JSON.stringify(processedSchemes));
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
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

  // Updated function for amounts based on real benefits
  const getAmount = (scheme) => {
    const lowerDesc = scheme.description.toLowerCase();
    if (lowerDesc.includes('1000 monthly')) return 12000; // 1000*12
    if (lowerDesc.includes('tuition waiver') || lowerDesc.includes('full tuition')) return 50000;
    if (lowerDesc.includes('6000 per annum')) return 6000;
    if (lowerDesc.includes('breakfast')) return 5000;
    if (lowerDesc.includes('skill development')) return 15000;
    const amounts = {
      'Education': 15000,
      'Healthcare': 500000,
      'Agriculture': 6000,
      'Employment': 10000,
      'Housing': 250000,
      'Women Welfare': 50000,
      'General Welfare': 20000
    };
    return amounts[scheme.category] || 10000;
  };

  useEffect(() => {
    const loadData = async () => {
      const recDataStr = localStorage.getItem('recommendationData');
      if (recDataStr) {
        const data = JSON.parse(recDataStr);
        setProfile(data.profile);
        setUsername(data.profile.name);
        const processed = processSchemes(data.recommendations);
        setSchemes(processed);
        localStorage.setItem('userSchemes', JSON.stringify(processed));
      } else {
        const stored = localStorage.getItem('userSchemes');
        if (stored) {
          const processed = JSON.parse(stored);
          setSchemes(processed);
        } else {
          const defaultProfile = {
            name: 'John Doe',
            age_group: 'student',
            gender: 'male',
            occupation: 'student',
            income_level: 'low',
            state: 'tamil nadu'
          };
          setProfile(defaultProfile);
          setUsername(defaultProfile.name);
          await fetchRecommendations(defaultProfile);
        }
      }

      const storedBook = localStorage.getItem('bookmarkedSchemes');
      if (storedBook) {
        setBookmarked(new Set(JSON.parse(storedBook)));
      }
    };

    loadData();
    setIsLoaded(true);
  }, []);

  const appliedCount = schemes.filter(s => localStorage.getItem(`applied_${s.id}`) === 'yes').length;
  const bookmarkedCount = bookmarked.size;
  const totalDiscovered = schemes.length;
  const ongoingCount = bookmarkedCount;
  const benefitsSum = schemes.reduce((sum, s) => sum + getAmount(s), 0);
  const benefitsValue = `₹${benefitsSum.toLocaleString()}`;
  const rejectedCount = 0;
  const incompleteCount = totalDiscovered - appliedCount - bookmarkedCount;

  const statsCards = [
    {
      title: 'Total Schemes Discovered',
      value: totalDiscovered.toString(),
      icon: <FileText className="w-8 h-8" />,
      gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      sparkle: true
    },
    {
      title: 'Schemes Applied',
      value: appliedCount.toString(),
      icon: <TrendingUp className="w-8 h-8" />,
      gradient: 'from-purple-400 via-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
      sparkle: false
    },
    {
      title: 'Ongoing Schemes',
      value: ongoingCount.toString(),
      icon: <Clock className="w-8 h-8" />,
      gradient: 'from-orange-400 via-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600',
      sparkle: false
    },
    {
      title: 'Benefits Available',
      value: benefitsValue,
      icon: <Gift className="w-8 h-8" />,
      gradient: 'from-rose-400 via-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600',
      sparkle: true
    },
    {
      title: 'Rejected/Expired',
      value: rejectedCount.toString(),
      icon: <XCircle className="w-8 h-8" />,
      gradient: 'from-slate-400 via-slate-500 to-slate-600',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-600',
      iconBg: 'bg-gradient-to-br from-slate-400 to-slate-600',
      sparkle: false
    },
    {
      title: 'Incomplete',
      value: incompleteCount.toString(),
      icon: <Clock className="w-8 h-8" />,
      gradient: 'from-amber-400 via-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
      sparkle: false
    }
  ];

  // Compute recentSchemes based on viewed - no static fallback
  const viewedStr = localStorage.getItem('viewedSchemes') || '[]';
  const viewed = JSON.parse(viewedStr);
  const viewedRecent = viewed
    .filter(v => schemes.some(s => s.id === v.id))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4)
    .map(v => {
      const s = schemes.find(ss => ss.id === v.id);
      if (!s) return null;
      return {
        id: s.id,
        name: s.cleanName,
        category: s.category,
        status: localStorage.getItem(`applied_${s.id}`) === 'yes' ? 'Applied' : bookmarked.has(s.id) ? 'Bookmarked' : 'Viewed',
        date: new Date(v.timestamp).toISOString().split('T')[0],
        amount: `₹${getAmount(s).toLocaleString()}`,
        priority: s.similarity > 0.8 ? 'high' : s.similarity > 0.6 ? 'medium' : 'low'
      };
    }).filter(Boolean);

  const recentSchemes = viewedRecent;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-emerald-100';
      case 'Under Review': return 'bg-amber-100 text-amber-800 border-amber-200 shadow-amber-100';
      case 'Eligible': return 'bg-blue-100 text-blue-800 border-blue-200 shadow-blue-100';
      case 'Ongoing': return 'bg-purple-100 text-purple-800 border-purple-200 shadow-purple-100';
      case 'Bookmarked': return 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-indigo-100';
      case 'Viewed': return 'bg-teal-100 text-teal-800 border-teal-200 shadow-teal-100';
      case 'Suggested': return 'bg-gray-100 text-gray-800 border-gray-200 shadow-gray-100';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 shadow-gray-100';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <Award className="w-4 h-4 text-rose-600" />;
      case 'medium': return <Target className="w-4 h-4 text-amber-600" />;
      case 'low': return null;
      default: return null;
    }
  };

  if (loading && schemes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6 mx-auto"></div>
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-1000 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 text-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-sky-300/20 to-sky-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-cyan-300/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="flex items-center justify-between px-6 py-8">
          {/* Left side */}
          <div className={`transition-all duration-1000 ${isLoaded ? 'animate-slide-in-left' : 'opacity-0 translate-x-[-50px]'} ml-2`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
                  Hello {username}!
                </h1>
                <Sparkles className="absolute -top-2 -right-8 w-6 h-6 text-blue-400 animate-spin-slow" />
              </div>
            </div>
            <p className="text-base text-gray-600 font-medium">
              Welcome to your Dashboard
            </p>
            <div className="mt-2 h-1 w-32 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-gradient-x"></div>
          </div>

          {/* Right side */}
          <div className={`flex items-center space-x-4 transition-all duration-1000 ${isLoaded ? 'animate-slide-in-right' : 'opacity-0 translate-x-[50px]'}`}>
            <button className="relative p-4 rounded-2xl transition-all duration-500 hover:scale-110 hover:rotate-3 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-2xl border border-white/50 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-500"></div>
              <MapPin className="w-6 h-6 transition-all duration-500 group-hover:text-blue-600 relative z-10" />
            </button>
            <button className="relative p-4 rounded-2xl transition-all duration-500 hover:scale-110 hover:rotate-3 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-2xl border border-white/50 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 to-blue-500/0 group-hover:from-sky-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
              <Bell className="w-6 h-6 transition-all duration-500 group-hover:animate-wiggle relative z-10" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full animate-pulse shadow-lg"></span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-sky-400 rounded-full animate-ping"></span>
            </button>
            <button className="relative p-4 rounded-2xl transition-all duration-500 hover:scale-110 hover:rotate-3 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-2xl border border-white/50 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
              <User className="w-6 h-6 transition-all duration-500 group-hover:text-cyan-600 relative z-10" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12 max-w-7xl mx-auto relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {statsCards.map((card, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-3xl transition-all duration-700 hover:scale-105 hover:-translate-y-3 cursor-pointer group bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl hover:shadow-2xl overflow-hidden ${isLoaded ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
              style={{
                animationDelay: `${index * 0.15}s`
              }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Sparkle Effect */}
              {card.sparkle && (
                <div className="absolute top-4 right-4">
                  <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                </div>
              )}

              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <p className="text-lg font-semibold mb-4 text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    {card.title}
                  </p>
                  <p className="text-4xl font-bold transition-all duration-500 group-hover:scale-110 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {card.value}
                  </p>
                </div>
                <div className={`p-5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 ${card.iconBg} shadow-lg`}>
                  <div className="text-white transition-all duration-300">
                    {card.icon}
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className={`mt-6 h-2 rounded-full bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 shadow-lg`}></div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Recently Viewed Schemes */}
        <div className={`rounded-3xl transition-all duration-1000 hover:shadow-2xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl relative overflow-hidden ${isLoaded ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.9s'}}>
          {/* Header Section */}
          <div className="relative">
            {/* Header Gradient Background */}
            <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-cyan-500/10 rounded-t-3xl"></div>
            
            <div className="p-8 border-b border-gray-200/50 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                    <Eye className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
                      Recently Viewed Schemes
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Track your application progress</p>
                  </div>
                </div>
                <button className="relative flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-500 hover:scale-105 group shadow-lg hover:shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-500"></div>
                  <span className="font-semibold relative z-10">View All</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-2 relative z-10" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Schemes List */}
          <div className="p-8">
            {recentSchemes.length > 0 ? (
              <div className="space-y-6">
                {recentSchemes.map((scheme, index) => (
                  <div
                    key={scheme.id}
                    className={`relative p-6 rounded-2xl border transition-all duration-700 hover:scale-105 hover:-translate-y-2 cursor-pointer group border-gray-200/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-white/80 hover:border-blue-300/50 shadow-sm hover:shadow-xl overflow-hidden ${isLoaded ? 'animate-slide-in-left' : 'opacity-0 translate-x-[-50px]'}`}
                    style={{
                      animationDelay: `${1.2 + index * 0.1}s`
                    }}
                  >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-500"></div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="font-bold text-xl transition-all duration-300 group-hover:text-blue-600">
                            {scheme.name}
                          </h3>
                          {getPriorityIcon(scheme.priority)}
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 shadow-sm ${getStatusColor(scheme.status)}`}>
                            {scheme.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-8 text-sm text-gray-600">
                          <span className="flex items-center space-x-2 group-hover:text-blue-600 transition-colors duration-300">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">{scheme.category}</span>
                          </span>
                          <span className="flex items-center space-x-2 group-hover:text-blue-600 transition-colors duration-300">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{scheme.date}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-110">
                          {scheme.amount}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No recent viewed schemes. Start exploring recommendations!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(-180deg);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-3deg);
          }
          75% {
            transform: rotate(3deg);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out both;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out both;
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
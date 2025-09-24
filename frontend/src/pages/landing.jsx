import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { CheckCircle, Bot, Languages, FileCheck, Users, Target, Brain, Zap, Database, Search, UserCheck, FileText, Award, Sparkles, Shield, Rocket, ArrowRight } from 'lucide-react';

import Top from '../assets/top.json';
import AIscheme from '../assets/AI-scheme.json';
import eligibility from '../assets/eligibility.json';
import chatbot from '../assets/chatbot.json';
import application from '../assets/application.json';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animationPhase, setAnimationPhase] = useState(0);
  const [roadmapInView, setRoadmapInView] = useState(false);
  const [featuresInView, setFeaturesInView] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const phaseInterval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 3000);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === 'roadmap-section' && entry.isIntersecting) {
            setRoadmapInView(true);
          }
          if (entry.target.id === 'features-section' && entry.isIntersecting) {
            setFeaturesInView(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    const roadmapElement = document.getElementById('roadmap-section');
    const featuresElement = document.getElementById('features-section');
    
    if (roadmapElement) observer.observe(roadmapElement);
    if (featuresElement) observer.observe(featuresElement);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(phaseInterval);
      if (roadmapElement) observer.unobserve(roadmapElement);
      if (featuresElement) observer.unobserve(featuresElement);
    };
  }, []);

  const roadmapSteps = [
    {
      id: 1,
      title: "Profile Assessment",
      description: "AI analyzes your demographics, location, and requirements with advanced data processing.",
      icon: <UserCheck className="w-10 h-10" />,
      gradient: "from-emerald-400 to-teal-400",
      bgGradient: "from-emerald-400/10 to-teal-400/10",
      delay: "0ms",
      details: ["Demographics Analysis", "Location Mapping", "Income Assessment", "Family Structure"]
    },
    {
      id: 2,
      title: "Intelligent Matching",
      description: "Machine learning algorithms match schemes to your profile with 95% accuracy.",
      icon: <Brain className="w-10 h-10" />,
      gradient: "from-blue-400 to-cyan-400",
      bgGradient: "from-blue-400/10 to-cyan-400/10",
      delay: "200ms",
      details: ["ML Algorithms", "Pattern Recognition", "Profile Scoring", "Similarity Matching"]
    },
    {
      id: 3,
      title: "Eligibility Verification",
      description: "Real-time validation of eligibility criteria and requirements across all schemes.",
      icon: <FileCheck className="w-10 h-10" />,
      gradient: "from-orange-400 to-amber-400",
      bgGradient: "from-orange-400/10 to-amber-400/10",
      delay: "400ms",
      details: ["Document Verification", "Criteria Checking", "Real-time Updates", "Compliance Validation"]
    },
    {
      id: 4,
      title: "Personalized Recommendations",
      description: "Curated list of schemes with priority ranking and benefits tailored for you.",
      icon: <Award className="w-10 h-10" />,
      gradient: "from-purple-400 to-indigo-400",
      bgGradient: "from-purple-400/10 to-indigo-400/10",
      delay: "600ms",
      details: ["Priority Ranking", "Benefit Analysis", "Application Timeline", "Success Probability"]
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">
            AI Scheme
          </div>
          <div className="flex space-x-4">
            <Link to="/signup" className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-all duration-300">
              Sign Up
            </Link>
            <Link to="/login" className="px-4 py-2 bg-transparent border-2 border-blue-500 text-blue-500 font-semibold rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-100/30 to-cyan-100/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-lg rotate-45 animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full animate-float-slow" />
        <div className="absolute top-1/2 left-10 w-8 h-8 bg-gradient-to-br from-orange-100/40 to-amber-100/40 rounded-full animate-bounce" />
        <div className="absolute bottom-10 right-10 w-14 h-14 bg-gradient-to-br from-pink-100/30 to-rose-100/30 rounded-lg animate-pulse" />
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-blue-200/10 via-transparent to-transparent rounded-full transition-all duration-700 ease-out pointer-events-none"
          style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
        />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 py-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen">
          <div className={`lg:w-1/2 lg:pr-12 mb-12 lg:mb-0 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="overflow-hidden">
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-800 animate-slide-up-stagger">
                    <span className="inline-block transform transition-all duration-700 delay-100">AI-Powered</span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent inline-block transform transition-all duration-700 delay-300 animate-gradient-x bg-300%">
                      Scheme
                    </span>
                    <br />
                    <span className="inline-block transform transition-all duration-700 delay-500">
                      Recommendation
                    </span>
                  </h1>
                </div>
                <p className={`text-lg leading-relaxed text-gray-600 transform transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  Discover government schemes tailored for you with an integrated AI platform that understands your unique needs and circumstances.
                </p>
              </div>
              <div className={`flex space-x-4 transform transition-all duration-700 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <Link to="/signup" className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full shadow-lg shadow-blue-400/25 hover:shadow-xl hover:shadow-blue-400/40 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Check Eligibility</span>
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                </Link>
                <Link to="/schemes" className="group relative px-8 py-4 bg-transparent border-2 border-blue-400 text-blue-400 font-semibold rounded-full hover:bg-blue-400 hover:text-white transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Explore Schemes</span>
                    <span className="transform group-hover:rotate-45 transition-transform duration-300">✨</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div className={`lg:w-1/2 flex items-center justify-center relative transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`} style={{ marginLeft: '-80px', marginTop: '-100px' }}>
            <div className="relative w-[36rem] h-[36rem]">
              <Lottie animationData={Top} loop={true} autoplay={true} style={{ width: '120%', height: '120%', background: 'transparent', filter: 'brightness(1) saturate(1)' }} />
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div id="features-section" className="mt-24 mb-16">
          <div className={`text-center mb-12 transform transition-all duration-1000 ${featuresInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-800 relative">
              <span className="relative z-10 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Powerful AI Features
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" />
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Experience cutting-edge AI technology designed to revolutionize how you discover and access government schemes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`group relative p-6 rounded-3xl shadow-xl backdrop-blur-sm bg-white/90 border border-gray-100 hover:shadow-2xl hover:shadow-blue-400/25 transform hover:scale-105 transition-all duration-700 ${featuresInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ animationDelay: '100ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
              <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                <Lottie animationData={AIscheme} loop={true} autoplay={true} style={{ width: '90%', height: '90%' }} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-center text-gray-800 relative z-10 group-hover:text-blue-600 transition-colors duration-300">
                AI Scheme Recommendations
              </h3>
              <p className="text-xs leading-relaxed text-center text-gray-500 relative z-10 group-hover:text-gray-600 transition-colors duration-300 mb-3">
                Advanced AI matches you with central/state schemes across healthcare, education, and welfare sectors.
              </p>
              <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">Smart Matching</span>
                <span className="px-2 py-1 bg-cyan-50 text-cyan-600 text-xs rounded-full">ML Powered</span>
              </div>
            </div>
            <div className={`group relative p-6 rounded-3xl shadow-xl backdrop-blur-sm bg-white/90 border border-gray-100 hover:shadow-2xl hover:shadow-emerald-400/25 transform hover:scale-105 transition-all duration-700 ${featuresInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                <Lottie animationData={eligibility} loop={true} autoplay={true} style={{ width: '130%', height: '130%' }} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-center text-gray-800 relative z-10 group-hover:text-emerald-600 transition-colors duration-300">
                Instant Eligibility Checker
              </h3>
              <p className="text-xs leading-relaxed text-center text-gray-500 relative z-10 group-hover:text-gray-600 transition-colors duration-300 mb-3">
                Lightning-fast eligibility verification with region-aware logic and real-time validation systems.
              </p>
              <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full">Real-time</span>
                <span className="px-2 py-1 bg-teal-50 text-teal-600 text-xs rounded-full">Accurate</span>
              </div>
            </div>
            <div className={`group relative p-6 rounded-3xl shadow-xl backdrop-blur-sm bg-white/90 border border-gray-100 hover:shadow-2xl hover:shadow-orange-400/25 transform hover:scale-105 transition-all duration-700 ${featuresInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ animationDelay: '300ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Languages className="w-5 h-5 text-orange-400 animate-pulse" />
              </div>
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                <Lottie animationData={chatbot} loop={true} autoplay={true} style={{ width: '180%', height: '180%' }} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-center text-gray-800 relative z-10 group-hover:text-orange-600 transition-colors duration-300">
                Multilingual Chatbot
              </h3>
              <p className="text-xs leading-relaxed text-center text-gray-500 relative z-10 group-hover:text-gray-600 transition-colors duration-300 mb-3">
                Intelligent AI chatbot supporting multiple Indian languages for seamless communication and guidance.
              </p>
              <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full">22+ Languages</span>
                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded-full">24/7 Support</span>
              </div>
            </div>
            <div className={`group relative p-6 rounded-3xl shadow-xl backdrop-blur-sm bg-white/90 border border-gray-100 hover:shadow-2xl hover:shadow-indigo-400/25 transform hover:scale-105 transition-all duration-700 ${featuresInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ animationDelay: '400ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/5 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Rocket className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                <Lottie animationData={application} loop={true} autoplay={true} style={{ width: '180%', height: '180%' }} />
              </div>
              <h3 className="text-lg font-bold mb-3 text-center text-gray-800 relative z-10 group-hover:text-indigo-600 transition-colors duration-300">
                Application Assistance
              </h3>
              <p className="text-xs leading-relaxed text-center text-gray-500 relative z-10 group-hover:text-gray-600 transition-colors duration-300 mb-3">
                Comprehensive step-by-step application guidance with intelligent auto-fill and document management.
              </p>
              <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">Auto-fill</span>
                <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">Guided</span>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Section */}
        <div id="roadmap-section" className="mt-32 mb-20 relative">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${roadmapInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-800 relative inline-block">
              <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Our AI-Powered Journey
              </span>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full animate-pulse" />
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4 leading-relaxed">
              Follow our seamless 4-step process to discover government schemes tailored to your needs.
            </p>
          </div>

          {/* Timeline Container */}
          <div className="relative max-w-5xl mx-auto px-4">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1.5 bg-gradient-to-b from-violet-100 to-indigo-100 h-full hidden md:block z-0 rounded-full">
              <div className="absolute inset-0 bg-gradient-to-b from-violet-400 to-indigo-400 animate-pulse opacity-50 rounded-full" />
            </div>

            <div className="space-y-12 md:space-y-0">
              {roadmapSteps.map((step, index) => (
                <div key={step.id} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} transform transition-all duration-1000 ${roadmapInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 md:block hidden z-10">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 transition-all duration-300">
                      {step.id}
                    </div>
                  </div>
                  <div className={`group relative w-full md:w-5/12 bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-violet-100 transition-all duration-500 ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-2xl`} />
                    <div className="relative z-10 flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-r ${step.gradient} flex items-center justify-center text-white shadow-md transform group-hover:scale-105 transition-all duration-300`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-violet-600 transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed mt-2 group-hover:text-gray-600 transition-colors duration-300">
                          {step.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          {step.details.map((detail, idx) => (
                            <span key={idx} className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${step.gradient} text-white`}>
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                  </div>
                  <div className="md:hidden flex items-center justify-center w-full mt-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {step.id}
                    </div>
                  </div>
                  {index < roadmapSteps.length - 1 && (
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-full mt-4 z-10">
                      <ArrowRight className="w-6 h-6 text-violet-400 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className={`text-center mt-16 transform transition-all duration-1000 delay-800 ${roadmapInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl p-8 text-white relative overflow-hidden max-w-xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">Start Your Scheme Discovery Journey</h3>
                  <p className="text-base mb-6">Unlock tailored government schemes with our AI-powered platform.</p>
                  <Link to="/signup" className="bg-white text-violet-500 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-md">
                    Get Started Now →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="py-6 text-gray-600 text-center">
          <p className="text-sm">
            © 2025 AI Scheme Recommendation. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7), 0 0 40px rgba(6, 182, 212, 0.3); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(59, 130, 246, 0), 0 0 60px rgba(6, 182, 212, 0.5); }
        }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px) rotate(45deg); } 50% { transform: translateY(-15px) rotate(50deg); } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes slide-up-stagger { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(0); } }

        .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .animate-slide-up-stagger { animation: slide-up-stagger 0.8s ease-out forwards; }
        .animate-progress { animation: progress 3s ease-in-out infinite; }
        .bg-300% { background-size: 300% 300%; }
      `}</style>
    </div>
  );
};

export default Landing;
import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react';
import Lottie from 'lottie-react';
import Checkmark from '../assets/checkmark.json';

const EligibilityChecker = () => {
  const [searchValue, setSearchValue] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [failedCriteria, setFailedCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Agriculture', 'Education', 'Healthcare', 'Social Welfare', 'Transport', 'Women Empowerment'];

  // Fetch schemes from backend based on selected category
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const endpoint = selectedCategory === 'All' 
          ? 'http://localhost:3000/api/all' 
          : `http://localhost:3000/api/${selectedCategory.toLowerCase().replace(' ', '-')}`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched schemes:', data.length, data.map(s => s.scheme_name));
        setSchemes(data);
        setFilteredSchemes(data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [selectedCategory]);

  // Filter schemes based on search input
  useEffect(() => {
    if (searchValue) {
      const filtered = schemes.filter((scheme) =>
        scheme.scheme_name?.toLowerCase().startsWith(searchValue.toLowerCase().trim())
      );
      console.log('Filtered schemes:', filtered.length, filtered.map(s => s.scheme_name));
      setFilteredSchemes(filtered);
    } else {
      setFilteredSchemes(schemes);
    }
  }, [searchValue, schemes]);

  // Generate questions dynamically from eligibility criteria
  const generateQuestions = (scheme) => {
    if (!scheme || !scheme.eligibility_criteria || scheme.eligibility_criteria.length === 0) {
      return [{ id: 'no_criteria', question: 'No eligibility criteria specified. Are you interested in this scheme?', required: 'yes' }];
    }
    return scheme.eligibility_criteria.map((criterion, index) => ({
      id: `criterion_${index}`,
      question: criterion,
      required: 'yes',
    }));
  };

  const handleSchemeSelect = (scheme) => {
    setSelectedScheme(scheme);
    setSearchValue('');
    setShowQuestions(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
    setFailedCriteria([]);
    setIsEligible(false);
    console.log('Selected scheme:', scheme.scheme_name);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    
    // Automatically move to next question if not the last one
    const questions = generateQuestions(selectedScheme);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    if (!selectedScheme) return;
    const questions = generateQuestions(selectedScheme);
    const failed = [];
    let eligible = true;

    questions.forEach((q) => {
      if (answers[q.id] !== q.required) {
        failed.push(q.question);
        eligible = false;
      }
    });

    setFailedCriteria(failed);
    setIsEligible(eligible);
    setShowResult(true);
  };

  const handleReset = () => {
    if (selectedScheme) {
      setAnswers({});
      setCurrentQuestionIndex(0);
      setShowResult(false);
    } else {
      setAnswers({});
      setCurrentQuestionIndex(0);
      setShowResult(false);
      setSelectedScheme(null);
      setShowQuestions(false);
      setSearchValue('');
    }
  };

  const handleOkay = () => {
    setShowResult(false);
    if (!isEligible) {
      setCurrentQuestionIndex(0);
      setAnswers({});
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    const questions = generateQuestions(selectedScheme);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  const currentQuestion =
    showQuestions && selectedScheme
      ? generateQuestions(selectedScheme)[currentQuestionIndex]
      : null;

  const totalQuestions =
    showQuestions && selectedScheme
      ? generateQuestions(selectedScheme).length
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="max-w-5xl mx-auto relative z-10">
        {loading && <p className="text-center text-gray-600 text-lg font-medium animate-pulse">Loading schemes...</p>}
        {error && <p className="text-center text-red-600 text-lg font-medium">Error: {error}</p>}

        {!showQuestions && (
          <div className="flex justify-center mt-1">
            <div className="w-32 h-32 relative transform transition-all duration-700 animate-float">
              <Lottie
                animationData={Checkmark}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: '100%', background: 'transparent' }}
              />
            </div>
          </div>
        )}

        {showQuestions && !showResult && (
          <div className="text-center mb-9 animate-fadeIn">
            <h1 className="text-4xl font-extrabold text-sky-600 mb-2 tracking-tight">
              Check Your Eligibility
            </h1>
            <div className="flex flex-wrap justify-center mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`mx-1 px-3 py-1 rounded-md transition-all duration-200 font-medium ${
                    selectedCategory === cat ? 'bg-sky-500 text-white' : 'bg-sky-200 text-sky-800 hover:bg-sky-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative mt-4 max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Search className="text-sky-500 group-hover:text-sky-800 transition-colors duration-300" size={20} />
                </div>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Switch to another scheme..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-sky-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all duration-300 bg-white shadow-lg hover:shadow-xl font-medium text-gray-800 placeholder-gray-400"
                />
              </div>
              {searchValue && filteredSchemes.length > 0 && !showResult && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 border-2 border-sky-200 rounded-xl shadow-2xl z-20 animate-slideUp backdrop-blur-sm max-h-100 overflow-y-auto scrollbar-custom">
                  {filteredSchemes.map((scheme, index) => (
                    <div
                      key={index}
                      onClick={() => handleSchemeSelect(scheme)}
                      className="px-4 py-3 hover:bg-sky-50 cursor-pointer border-b border-sky-100 last:border-b-0 transition-all duration-200 text-gray-800 font-medium text-left flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-sky-500 rounded-full animate-scaleIn"></div>
                      <span>{scheme.scheme_name || 'Unnamed Scheme'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`transition-all duration-700 ${showQuestions ? 'mb-16' : 'flex flex-col items-center justify-start min-h-[80vh]'}`}>
          {!showQuestions && (
            <div className="mt-8 mb-8 animate-fadeIn w-full max-w-2xl">
              <h2 className="text-4xl font-extrabold text-sky-700 mb-6 tracking-tight text-center">
                Find Your Ideal Scheme
              </h2>
              <p className="text-lg text-gray-600 mb-8 text-center font-medium animate-slideUp">
                Explore available schemes and check your eligibility with ease.
              </p>
              <div className="flex flex-wrap justify-center mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`mx-2 px-3 py-1 rounded-md transition-all duration-200 font-medium ${
                      selectedCategory === cat ? 'bg-sky-500 text-white' : 'bg-sky-200 text-sky-900 hover:bg-sky-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Search className="text-sky-500 group-hover:text-sky-800 transition-colors duration-300" size={20} />
                  </div>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search for schemes..."
                    className="w-full pl-12 pr-4 py-4 border-2 border-sky-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all duration-300 bg-white shadow-lg hover:shadow-xl font-medium text-gray-800 placeholder-gray-400"
                  />
                </div>
                {searchValue && filteredSchemes.length > 0 && !showResult && !showQuestions && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 border-2 border-sky-200 rounded-xl shadow-2xl z-50 animate-slideUp backdrop-blur-sm max-h-65 overflow-y-auto scrollbar-custom">
                    {filteredSchemes.map((scheme, index) => (
                      <div
                        key={index}
                        onClick={() => handleSchemeSelect(scheme)}
                        className="px-4 py-3 hover:bg-sky-50 cursor-pointer border-b border-sky-100 last:border-b-0 transition-all duration-200 text-gray-800 font-medium text-left flex items-center space-x-2"
                      >
                        <div className="w-2 h-2 bg-sky-500 rounded-full animate-scaleIn"></div>
                        <span>{scheme.scheme_name || 'Unnamed Scheme'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {showQuestions && !showResult && currentQuestion && (
            <div className="bg-gradient-to-br from-white to-sky-50 rounded-2xl shadow-2xl p-8 animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-sky-600 tracking-tight">
                  {selectedScheme.scheme_name || 'Selected Scheme'}
                </h3>
                <div className="flex items-center space-x-2 text-sky-600">
                  <span className="text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <div className="flex space-x-1">
                    {Array.from({ length: totalQuestions }, (_, i) => (
                      <div
                        key={i}
                        onClick={() => handleQuestionSelect(i)}
                        className={`h-2 w-8 rounded-full transition-all duration-300 cursor-pointer ${
                          i === currentQuestionIndex ? 'bg-sky-500' : 'bg-sky-200 hover:bg-sky-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-8" key={currentQuestionIndex}>
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold mr-3 animate-scaleIn">
                    {currentQuestionIndex + 1}
                  </div>
                  <p className="text-xl text-gray-800 font-medium animate-slideRight">
                    {currentQuestion.question}
                  </p>
                </div>

                <div className="space-y-4 animate-fadeIn">
                  <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg hover:bg-sky-50 transition-all duration-200 border-2 border-transparent hover:border-sky-200">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value="yes"
                      checked={answers[currentQuestion.id] === 'yes'}
                      onChange={() => handleAnswerChange(currentQuestion.id, 'yes')}
                      className="w-5 h-5 text-sky-500 border-2 border-sky-300 focus:ring-sky-400 transition-colors"
                    />
                    <span className="text-gray-800 font-medium">Yes</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg hover:bg-sky-50 transition-all duration-200 border-2 border-transparent hover:border-sky-200">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value="no"
                      checked={answers[currentQuestion.id] === 'no'}
                      onChange={() => handleAnswerChange(currentQuestion.id, 'no')}
                      className="w-5 h-5 text-sky-500 border-2 border-sky-300 focus:ring-sky-400 transition-colors"
                    />
                    <span className="text-gray-800 font-medium">No</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <ChevronLeft size={20} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={currentQuestionIndex === totalQuestions - 1 ? handleSubmit : handleNextQuestion}
                  disabled={!answers[currentQuestion.id]}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 px-6 rounded-xl hover:from-sky-600 hover:to-sky-700 disabled:bg-sky-300 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>{currentQuestionIndex === totalQuestions - 1 ? 'Check Eligibility' : 'Next Question'}</span>
                  {currentQuestionIndex < totalQuestions - 1 && <ChevronRight size={20} />}
                </button>

                <button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-1.5 px-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {showResult && (
            <div className="fixed inset-0 backdrop-blur-md bg-gray-900/20 flex items-center ml-60 justify-center p-4 z-50">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full animate-bounceIn border border-gray-200/50">
                <div className="text-center">
                  {isEligible ? (
                    <>
                      <div className="w-16 h-16 bg-green-100/50 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn">
                        <svg className="w-8 h-8 text-green-500 animate-drawCheck" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-green-600 mb-4 tracking-tight">
                        You're Eligible!
                      </h3>
                      <p className="text-gray-800 mb-6 font-medium">
                        Based on your inputs, you <strong>are eligible</strong> for {selectedScheme.scheme_name || 'the selected scheme'}.
                        <br /><br />
                        All eligibility criteria were fulfilled.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-red-600 mb-4 tracking-tight">
                        You're Not Eligible
                      </h3>
                      <p className="text-gray-800 mb-4 font-medium">
                        Based on your inputs, you <strong>may not be eligible</strong> for {selectedScheme.scheme_name || 'the selected scheme'}.
                        <br /><br />
                        Eligibility criteria not fulfilled for the following:
                      </p>
                      <ul className="text-left text-gray-700 mb-6 font-medium">
                        {failedCriteria.map((criteria, index) => (
                          <li key={index} className="mb-2">• {criteria}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  <button
                    onClick={handleOkay}
                    className="bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 px-10 rounded-xl hover:from-sky-600 hover:to-sky-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                  >
                    Okay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        @keyframes pulseIcon {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes drawCheck {
          0% {
            stroke-dasharray: 36;
            stroke-dashoffset: 36;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .animate-drawCheck {
          stroke-dasharray: 36;
          animation: drawCheck 0.6s ease-in-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }

        .animate-slideRight {
          animation: slideRight 0.6s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 0.6s ease-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #38bdf8;
          border-radius: 4px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #0ea5e9;
        }
      `}</style>
    </div>
  );
};

export default EligibilityChecker;
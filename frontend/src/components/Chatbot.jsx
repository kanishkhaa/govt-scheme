import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Minimize2, Bot, User, Copy, ExternalLink, Sparkles } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Government Schemes Assistant. I can help you find information about various government schemes, eligibility criteria, benefits, and application processes. How can I assist you today?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace(/<[^>]*>/g, ''));
  };

  const handleSend = async () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        isBot: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      setIsTyping(true);

      try {
        const response = await fetch('http://localhost:3000/api/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputValue }),
          credentials: 'include'
        });

        const data = await response.json();
        setIsTyping(false);
        
        if (response.ok) {
          const botResponse = {
            id: messages.length + 2,
            text: data.response,
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botResponse]);
        } else {
          const errorResponse = {
            id: messages.length + 2,
            text: 'Sorry, something went wrong. Please try again.',
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, errorResponse]);
        }
      } catch (error) {
        setIsTyping(false);
        const errorResponse = {
          id: messages.length + 2,
          text: 'Error connecting to the server. Please check your connection.',
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (message) => {
    setInputValue(message);
    setTimeout(() => handleSend(), 100);
  };

  const formatMessage = (text) => {
    return text
      .replace(/^##+\s?/gm, '')
      .replace(/🎓\s?Scheme Name: (.*)/g, '<div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-xl shadow-sm"><span class="block text-lg font-bold text-blue-900 mb-1 flex items-center gap-2">🎓 <span>$1</span></span></div>')
      .replace(/(🎯\s?Objectives)/g, '<div class="font-bold text-gray-900 mt-6 mb-3 pb-2 border-b-2 border-gradient-to-r from-blue-400 to-indigo-400 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">$1</div>')
      .replace(/(💰\s?Benefits)/g, '<div class="font-bold text-gray-900 mt-6 mb-3 pb-2 border-b-2 border-green-400 flex items-center gap-2 text-green-700">$1</div>')
      .replace(/(✅\s?Eligibility Criteria)/g, '<div class="font-bold text-gray-900 mt-6 mb-3 pb-2 border-b-2 border-purple-400 flex items-center gap-2 text-purple-700">$1</div>')
      .replace(/(📝\s?Application Process)/g, '<div class="font-bold text-gray-900 mt-6 mb-3 pb-2 border-b-2 border-orange-400 flex items-center gap-2 text-orange-700">$1</div>')
      .replace(/(📄\s?Documents Required)/g, '<div class="font-bold text-gray-900 mt-6 mb-3 pb-2 border-b-2 border-red-400 flex items-center gap-2 text-red-700">$1</div>')
      .replace(/(🔗\s?Official Links)/g, '<div class="font-bold text-gray-900 mt-6 mb-3 pb-2 border-b-2 border-teal-400 flex items-center gap-2 text-teal-700">$1</div>')
      .replace(/👉\s?(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline font-medium bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-all duration-200 transform hover:-translate-y-0.5"><span>$1</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/^-\s?(.*)/gm, '<div class="flex items-start gap-3 mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"><span class="w-3 h-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mt-1.5 flex-shrink-0 shadow-sm"></span><span class="text-sm text-gray-700 leading-relaxed">$1</span></div>')
      .replace(/\n\n/g, '<div class="mb-4"></div>');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white p-5 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl animate-pulse group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
          <MessageCircle size={32} className="relative z-10" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl border-0 transition-all duration-300 flex flex-col overflow-hidden backdrop-blur-lg ${
        isMinimized ? 'w-80 h-16' : 'w-[500px] h-[700px]'
      }`} style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-4 flex items-center justify-between flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-transparent to-indigo-400/20"></div>
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                Government Schemes Assistant
                <Sparkles size={16} className="text-yellow-300 animate-pulse" />
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-xs text-blue-100">Online • Ready to help</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 relative z-10">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <Minimize2 size={18} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
              {messages.length === 1 ? (
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Bot size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to Government Schemes Assistant</h3>
                    <p className="text-gray-600 mb-6">Discover government schemes tailored for you. Start by exploring these popular options:</p>
                    <div className="grid gap-3">
                      {[
                        "Tell me about the Prime Minister's Special Scholarship Scheme",
                        "What are the benefits of Swami Vivekananda Single Girl Child Fellowship?",
                        "How do I apply for the Scheme for OBC Students of Andaman and Nicobar Islands?",
                        "What are the eligibility criteria for CBSE Merit Scholarship?"
                      ].map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(question)}
                          className="px-5 py-4 rounded-xl text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/50 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 text-left group backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span>{question}</span>
                            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Send size={12} className="text-blue-600" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-4 ${message.isBot ? 'justify-start' : 'justify-end flex-row-reverse'} animate-fade-in group`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                        message.isBot 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-blue-200' 
                          : 'bg-gradient-to-br from-gray-500 to-gray-700 text-white border-2 border-gray-200'
                      }`}>
                        {message.isBot ? <Bot size={18} /> : <User size={18} />}
                      </div>

                      {/* Message Container */}
                      <div className={`flex flex-col ${message.isBot ? 'items-start' : 'items-end'} max-w-[85%]`}>
                        <div
                          className={`relative px-5 py-4 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:shadow-xl ${
                            message.isBot
                              ? 'bg-white/90 text-gray-800 border border-gray-100/50 rounded-bl-lg'
                              : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-br-lg shadow-blue-200/50'
                          }`}
                        >
                          {message.isBot && (
                            <button
                              onClick={() => copyToClipboard(message.text)}
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
                              title="Copy message"
                            >
                              <Copy size={14} />
                            </button>
                          )}
                          
                          <div
                            className={`prose prose-sm max-w-none ${message.isBot ? 'text-gray-800' : 'text-white'}`}
                            dangerouslySetInnerHTML={{
                              __html: message.isBot ? formatMessage(message.text) : message.text
                            }}
                          />
                        </div>
                        
                        {message.timestamp && (
                          <span className={`text-xs text-gray-400 mt-2 px-1 ${message.isBot ? 'text-left' : 'text-right'}`}>
                            {message.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-4 animate-fade-in">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-blue-200">
                        <Bot size={18} />
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm px-5 py-4 rounded-2xl rounded-bl-lg shadow-lg border border-gray-100/50">
                        <div className="flex space-x-2">
                          <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100/50 p-4 bg-white/80 backdrop-blur-sm flex-shrink-0">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about government schemes..."
                    className="w-full px-5 py-4 pr-12 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/70 hover:bg-white/90 transition-all duration-200 backdrop-blur-sm shadow-sm placeholder-gray-500"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Sparkles size={16} className={`transition-opacity duration-200 ${inputValue.trim() ? 'opacity-100 animate-pulse text-blue-500' : 'opacity-50'}`} />
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-5 py-4 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:hover:shadow-lg backdrop-blur-sm"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .prose a {
          text-decoration: none !important;
        }
        .prose strong {
          font-weight: 700 !important;
          color: inherit !important;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
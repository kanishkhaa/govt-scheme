import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  FileText,
  CheckCircle,
  MessageCircle,
  HelpCircle,
  User,
  Menu
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Schemes', path: '/scheme' },
    { icon: <CheckCircle className="w-5 h-5" />, label: 'Application', path: '/application' },
     
    { icon: <HelpCircle className="w-5 h-5" />, label: 'Eligibility Checker', path: '/eligibility' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/profile' }

  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-xl border-gray-200 shadow-2xl border-r z-30">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white">
            <Menu className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            Gov Schemes
          </h2>
        </div>
      </div>
      <div className="p-6 space-y-3">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 hover:scale-105 group ${
              location.pathname === item.path
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-sky-600'
            }`}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </div>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
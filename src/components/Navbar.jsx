import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CloudSun, LogIn, LogOut, Upload, User } from 'lucide-react';
import { isAuthenticated, isResearcher, getCurrentUser, logout } from '../services/authService';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
      ? 'bg-blue-100 text-blue-700'
      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
      }`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <CloudSun className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl tracking-tight text-gray-900">AtmosView</span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link to="/" className={getLinkClass('/')}>Home</Link>
            <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
            <Link to="/historical" className={getLinkClass('/historical')}>Historical</Link>
            <Link to="/compare" className={getLinkClass('/compare')}>Compare</Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{user.username}</span>
                  {user.role === 'researcher' && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Researcher
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

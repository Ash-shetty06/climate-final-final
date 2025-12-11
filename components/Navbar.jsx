import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloudSun, LogIn, LogOut, User, Shield } from 'lucide-react';
import AuthModal from './AuthModal';

const Navbar = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const API_BASE = 'http://10.13.130.39:4000';

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser({ email: data.email, role: data.role });
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      setCurrentUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-blue-100 text-blue-700' 
        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
    }`;
  };

  return (
    <>
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
              
              {currentUser?.role === 'admin' && (
                <Link to="/admin" className={getLinkClass('/admin')}>
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Admin
                  </span>
                </Link>
              )}
              
              {currentUser ? (
                <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-300">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{currentUser.email}</span>
                    {currentUser.role === 'admin' && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 ml-2 pl-3 border-l border-gray-300 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              )}
            </div>
            {/* Mobile menu */}
            <div className="flex items-center sm:hidden">
              {currentUser ? (
                <button onClick={handleLogout} className="text-red-600 font-medium text-sm">Logout</button>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="text-blue-600 font-medium text-sm">Login</button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;

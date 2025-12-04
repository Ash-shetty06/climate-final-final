import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloudSun } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

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
          {}
          <div className="flex items-center sm:hidden">
            <Link to="/dashboard" className="text-blue-600 font-medium text-sm">Open App</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubmitClick = (e) => {
    e.preventDefault();
    navigate('/submit');
    setMobileMenuOpen(false);
  };

  const handleStatusClick = (e) => {
    e.preventDefault();
    navigate('/status');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl">🚪</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900">Gate Pass System</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <button
              onClick={handleSubmitClick}
              className="text-gray-700 hover:text-blue-600 px-2 lg:px-4 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors"
            >
              Submit Gate Pass
            </button>
            
            <button
              onClick={handleStatusClick}
              className="text-gray-700 hover:text-green-600 px-2 lg:px-4 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors"
            >
              View Status
            </button>

            {user ? (
              <Link
                to={user.role === 'hod' ? '/hod' : user.role === 'principal' ? '/principal' : user.role === 'watchman' ? '/watchman' : '/login'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-md text-xs lg:text-sm font-medium transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 lg:px-4 py-2 rounded-md text-xs lg:text-sm font-medium transition"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <button
              onClick={handleSubmitClick}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium"
            >
              Submit Gate Pass
            </button>
            <button
              onClick={handleStatusClick}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium"
            >
              View Gate Pass Status
            </button>
            {user ? (
              <Link
                to={user.role === 'hod' ? '/hod' : user.role === 'principal' ? '/principal' : user.role === 'watchman' ? '/watchman' : '/login'}
                className="block w-full text-left px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="block w-full text-left px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;


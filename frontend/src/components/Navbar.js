import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'student':
        return '/student';
      case 'hod':
        return '/hod';
      case 'principal':
        return '/principal';
      case 'watchman':
        return '/watchman';
      default:
        return '/login';
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link to={getDashboardPath()} className="text-lg sm:text-xl font-bold">
              🚪 Gate Pass System
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <>
                <span className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                  {user.name} <span className="hidden sm:inline">({user.role.toUpperCase()})</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            🚪 Gate Pass Management System
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Digitalize your gate pass process with our streamlined management system
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 px-4">
          {/* Submit Gate Pass Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📝</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Submit Gate Pass</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Create a new gate pass request to leave campus
              </p>
              <Link
                to="/submit"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-md transition w-full text-sm sm:text-base"
              >
                Submit Request
              </Link>
            </div>
          </div>

          {/* View Status Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🔍</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">View Gate Pass Status</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Check the status of your gate pass request
              </p>
              <Link
                to="/status"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-md transition w-full text-sm sm:text-base"
              >
                Check Status
              </Link>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🔐</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Staff Login</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Access your dashboard (HOD, Principal, Watchman)
              </p>
              <Link
                to="/login"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-md transition w-full text-sm sm:text-base"
              >
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center px-4">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-3xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">1</div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Submit Request</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Fill out the gate pass form with your details and reason
                </p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">2</div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Get Approval</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Your request goes through HOD and Principal approval
                </p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">3</div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Check Status</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Track your gate pass status anytime using your Gate Pass ID
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;


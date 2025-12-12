import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ViewerPanel = () => {
  const [searchParams] = useSearchParams();
  const [gatePassId, setGatePassId] = useState('');
  const [gatePass, setGatePass] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setGatePassId(idFromUrl);
      handleSearchById(idFromUrl);
    }
  }, [searchParams]);

  const handleSearchById = async (id) => {
    if (!id || !id.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/viewer/${id.trim()}`);
      setGatePass(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gate pass not found');
      setGatePass(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!gatePassId.trim()) {
      toast.error('Please enter a gate pass ID');
      return;
    }
    await handleSearchById(gatePassId);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_hod: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending (HOD)' },
      rejected_hod: { color: 'bg-red-100 text-red-800', text: 'Rejected (HOD)' },
      pending_principal: { color: 'bg-blue-100 text-blue-800', text: 'Pending (Principal)' },
      rejected_principal: { color: 'bg-red-100 text-red-800', text: 'Rejected (Principal)' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      exit_confirmed: { color: 'bg-purple-100 text-purple-800', text: 'Exit Confirmed' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚪 Gate Pass Status Checker</h1>
          <p className="text-gray-600">Enter a Gate Pass ID to view its status</p>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium mt-4 inline-block"
          >
            Home →
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <input
              type="text"
              value={gatePassId}
              onChange={(e) => setGatePassId(e.target.value.toUpperCase())}
              placeholder="Enter Gate Pass ID (e.g., GP123ABC)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {gatePass && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gate Pass Details</h2>
              {getStatusBadge(gatePass.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Gate Pass ID</p>
                <p className="text-lg font-semibold text-blue-600">{gatePass.gatePassId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Student Name</p>
                <p className="text-lg font-semibold text-gray-900">{gatePass.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Department</p>
                <p className="text-lg font-semibold text-gray-900">{gatePass.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created At</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(gatePass.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Reason</p>
                <p className="text-lg font-semibold text-gray-900">{gatePass.reason}</p>
              </div>
              {gatePass.additionalPerson && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Additional Person</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {gatePass.additionalPerson.name}
                  </p>
                  {gatePass.additionalPerson.photo && (
                    <div className="mt-2">
                      <img 
                        src={gatePass.additionalPerson.photo.startsWith('http') ? gatePass.additionalPerson.photo : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${gatePass.additionalPerson.photo}`} 
                        alt="Additional Person" 
                        className="w-24 h-24 object-cover rounded-md border border-gray-300 mt-2"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewerPanel;


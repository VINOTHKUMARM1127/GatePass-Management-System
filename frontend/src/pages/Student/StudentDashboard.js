import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const StudentDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/gatepass/my-requests');
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
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
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Gate Pass Requests</h1>
          <Link
            to="/student/request"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
          >
            + New Request
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No gate pass requests yet.</p>
            <Link
              to="/student/request"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first request →
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li key={request._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600">
                          {request.gatePassId}
                        </p>
                        <div className="ml-4">
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Department:</span> {request.department}
                      </p>
                    </div>
                    {request.hodApproval?.approvedBy && (
                      <div className="mt-2 text-xs text-gray-500">
                        HOD: {request.hodApproval.approvedBy.name} - {request.hodApproval.approved ? 'Approved' : 'Rejected'}
                      </div>
                    )}
                    {request.principalApproval?.approvedBy && (
                      <div className="mt-1 text-xs text-gray-500">
                        Principal: {request.principalApproval.approvedBy.name} - {request.principalApproval.approved ? 'Approved' : 'Rejected'}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;


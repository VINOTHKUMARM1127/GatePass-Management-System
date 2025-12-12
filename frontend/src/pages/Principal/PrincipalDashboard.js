import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const PrincipalDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
    fetchAllRequests();
    fetchStats();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('/api/admin/principal/pending');
      setPendingRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRequests = async () => {
    try {
      const response = await axios.get('/api/admin/principal/all');
      setAllRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch all requests');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/principal/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleApprove = async (id, action, remarks = '') => {
    try {
      await axios.put(`/api/admin/principal/approve/${id}`, { action, remarks });
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchPendingRequests();
      fetchAllRequests();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gate pass request? This will also delete the associated photos from Cloudinary.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/principal/gatepass/${id}`);
      toast.success('Gate pass deleted successfully');
      fetchPendingRequests();
      fetchAllRequests();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete gate pass');
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

  const requests = activeTab === 'pending' ? pendingRequests : allRequests;

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
          <h1 className="text-3xl font-bold text-gray-900">Principal Dashboard</h1>
          <Link
            to="/principal/manage"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
          >
            Manage System
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Exit Confirmed</p>
              <p className="text-2xl font-bold text-purple-600">{stats.exitConfirmed}</p>
            </div>
          </div>
        )}

        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Requests
            </button>
          </nav>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No requests found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li key={request._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between mb-2">
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
                      <div className="flex items-start space-x-4">
                        {request.photo && (
                          <div className="flex-shrink-0">
                            <img 
                              src={request.photo.startsWith('http') ? request.photo : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${request.photo}`} 
                              alt="Student" 
                              className="w-24 h-24 object-cover rounded-md border border-gray-300"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Student: {request.student?.name || request.studentName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {request.student?.studentId && `ID: ${request.student.studentId} | `}
                            {request.studentId && `ID: ${request.studentId} | `}
                            Department: {request.department}
                          </p>
                          <p className="text-sm text-gray-900 mt-2">
                            <span className="font-medium">Reason:</span> {request.reason}
                          </p>
                          {request.additionalPerson && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                Additional Person: {request.additionalPerson.name}
                              </p>
                              {request.additionalPerson.photo && (
                                <img 
                                  src={request.additionalPerson.photo.startsWith('http') ? request.additionalPerson.photo : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${request.additionalPerson.photo}`} 
                                  alt="Additional Person" 
                                  className="w-20 h-20 object-cover rounded-md border border-gray-300 mt-1"
                                />
                              )}
                            </div>
                          )}
                          {request.hodApproval?.approvedBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              HOD: {request.hodApproval.approvedBy.name} - {request.hodApproval.approved ? 'Approved' : 'Rejected'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      {request.status === 'pending_principal' && (
                        <>
                          <button
                            onClick={() => handleApprove(request._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const remarks = prompt('Enter rejection remarks (optional):');
                              handleApprove(request._id, 'reject', remarks || '');
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(request._id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
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

export default PrincipalDashboard;


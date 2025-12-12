import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const WatchmanDashboard = () => {
  const [gatePassId, setGatePassId] = useState('');
  const [gatePass, setGatePass] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!gatePassId.trim()) {
      toast.error('Please enter a gate pass ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/watchman/verify/${gatePassId.trim()}`);
      setGatePass(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gate pass not found');
      setGatePass(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExit = async () => {
    if (!gatePass) return;

    if (gatePass.status !== 'approved') {
      toast.error('Gate pass must be fully approved before exit confirmation');
      return;
    }

    try {
      await axios.put(`/api/watchman/confirm-exit/${gatePass._id}`);
      toast.success('Exit confirmed successfully');
      setGatePass(null);
      setGatePassId('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm exit');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Watchman Verification</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <form onSubmit={handleVerify} className="flex space-x-4">
            <input
              type="text"
              value={gatePassId}
              onChange={(e) => setGatePassId(e.target.value.toUpperCase())}
              placeholder="Enter Gate Pass ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>

        {gatePass && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Gate Pass Details</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                gatePass.status === 'approved' 
                  ? 'bg-green-100 text-green-800'
                  : gatePass.status === 'exit_confirmed'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {gatePass.status === 'approved' ? 'Approved' : 
                 gatePass.status === 'exit_confirmed' ? 'Exit Confirmed' : 'Not Approved'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Gate Pass ID</p>
                <p className="font-medium text-gray-900">{gatePass.gatePassId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student Name</p>
                <p className="font-medium text-gray-900">{gatePass.student?.name || gatePass.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-medium text-gray-900">{gatePass.student?.studentId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900">{gatePass.department}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Reason</p>
                <p className="font-medium text-gray-900">{gatePass.reason}</p>
              </div>
            </div>

            {gatePass.photo && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Student Photo</p>
                <img 
                  src={gatePass.photo.startsWith('http') ? gatePass.photo : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${gatePass.photo}`} 
                  alt="Student" 
                  className="w-32 h-32 object-cover rounded-md border border-gray-300"
                />
              </div>
            )}

            {gatePass.additionalPerson && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Additional Person: {gatePass.additionalPerson.name}</p>
                {gatePass.additionalPerson.photo && (
                  <img 
                    src={gatePass.additionalPerson.photo.startsWith('http') ? gatePass.additionalPerson.photo : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${gatePass.additionalPerson.photo}`} 
                    alt="Additional Person" 
                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                  />
                )}
              </div>
            )}

            <div className="border-t pt-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Approval Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    gatePass.hodApproval?.approved ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  <span>HOD: {gatePass.hodApproval?.approved ? 'Approved' : 'Pending/Rejected'}</span>
                  {gatePass.hodApproval?.approvedBy && (
                    <span className="text-gray-500 ml-2">({gatePass.hodApproval.approvedBy.name})</span>
                  )}
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    gatePass.principalApproval?.approved ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  <span>Principal: {gatePass.principalApproval?.approved ? 'Approved' : 'Pending/Rejected'}</span>
                  {gatePass.principalApproval?.approvedBy && (
                    <span className="text-gray-500 ml-2">({gatePass.principalApproval.approvedBy.name})</span>
                  )}
                </div>
              </div>
            </div>

            {gatePass.status === 'approved' && (
              <button
                onClick={handleConfirmExit}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md font-medium transition"
              >
                Confirm Exit
              </button>
            )}

            {gatePass.status === 'exit_confirmed' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                <p className="text-green-800 font-medium">Exit already confirmed</p>
                <p className="text-sm text-green-600 mt-1">
                  Confirmed at: {new Date(gatePass.watchmanVerification?.verifiedAt).toLocaleString()}
                </p>
              </div>
            )}

            {gatePass.status !== 'approved' && gatePass.status !== 'exit_confirmed' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                <p className="text-red-800 font-medium">Gate pass not approved for exit</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchmanDashboard;


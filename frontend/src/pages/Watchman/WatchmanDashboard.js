import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const WatchmanDashboard = () => {
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGatePass, setSelectedGatePass] = useState(null);

  useEffect(() => {
    fetchTodayApproved();
    updateNotExitedStatus();
  }, []);

  const updateNotExitedStatus = async () => {
    try {
      await axios.put('/api/watchman/update-not-exited');
    } catch (error) {
      console.error('Failed to update not exited status:', error);
    }
  };

  const fetchTodayApproved = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/watchman/today');
      setGatePasses(response.data);
    } catch (error) {
      toast.error('Failed to fetch today\'s approved gate passes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExit = async (gatePassId) => {
    try {
      await axios.put(`/api/watchman/confirm-exit/${gatePassId}`);
      toast.success('Exit confirmed successfully');
      fetchTodayApproved();
      setSelectedGatePass(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm exit');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'exit_confirmed') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Exit Confirmed</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Approved</span>;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Watchman Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Today's Approved Gate Passes - Confirm Student Exits</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {gatePasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
            <p className="text-gray-600 text-base sm:text-lg">No approved gate passes for today</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Approved requests will appear here automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* List of Gate Passes */}
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Today's Approved Requests ({gatePasses.length})</h2>
              <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                {gatePasses.map((gatePass) => (
                  <div
                    key={gatePass._id}
                    onClick={() => setSelectedGatePass(gatePass)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedGatePass?._id === gatePass._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">{gatePass.gatePassId}</p>
                      {getStatusBadge(gatePass.status)}
                    </div>
                    <p className="text-sm text-gray-700">
                      {gatePass.student?.name || gatePass.studentName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {gatePass.department} • {new Date(gatePass.principalApproval?.approvedAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gate Pass Details */}
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
              {selectedGatePass ? (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Gate Pass Details</h2>
                    {getStatusBadge(selectedGatePass.status)}
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Gate Pass ID</p>
                        <p className="font-medium text-gray-900">{selectedGatePass.gatePassId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student Name</p>
                        <p className="font-medium text-gray-900">
                          {selectedGatePass.student?.name || selectedGatePass.studentName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student ID</p>
                        <p className="font-medium text-gray-900">
                          {selectedGatePass.student?.studentId || selectedGatePass.studentId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-medium text-gray-900">{selectedGatePass.department}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Reason</p>
                      <p className="font-medium text-gray-900">{selectedGatePass.reason}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {selectedGatePass.photo && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">Student Photo</p>
                          <img 
                            src={selectedGatePass.photo.startsWith('http') ? selectedGatePass.photo : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedGatePass.photo}`} 
                            alt="Student" 
                            className="w-full h-40 sm:h-48 object-cover rounded-md border border-gray-300"
                          />
                        </div>
                      )}

                      {selectedGatePass.additionalPerson && selectedGatePass.additionalPerson.photo && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            Additional Person: {selectedGatePass.additionalPerson.name}
                          </p>
                          <img 
                            src={selectedGatePass.additionalPerson.photo.startsWith('http') ? selectedGatePass.additionalPerson.photo : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedGatePass.additionalPerson.photo}`} 
                            alt="Additional Person" 
                            className="w-full h-40 sm:h-48 object-cover rounded-md border border-gray-300"
                          />
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-medium text-gray-900 mb-2">Approval Status</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full mr-2 bg-green-500"></span>
                          <span>HOD: Approved</span>
                          {selectedGatePass.hodApproval?.approvedBy && (
                            <span className="text-gray-500 ml-2">({selectedGatePass.hodApproval.approvedBy.name})</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full mr-2 bg-green-500"></span>
                          <span>Principal: Approved</span>
                          {selectedGatePass.principalApproval?.approvedBy && (
                            <span className="text-gray-500 ml-2">({selectedGatePass.principalApproval.approvedBy.name})</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Approved at: {new Date(selectedGatePass.principalApproval?.approvedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {selectedGatePass.status === 'approved' && (
                      <button
                        onClick={() => handleConfirmExit(selectedGatePass._id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md font-medium transition mt-4"
                      >
                        Confirm Exit
                      </button>
                    )}

                    {selectedGatePass.status === 'exit_confirmed' && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center mt-4">
                        <p className="text-green-800 font-medium">Exit Confirmed</p>
                        <p className="text-sm text-green-600 mt-1">
                          Confirmed at: {new Date(selectedGatePass.watchmanVerification?.verifiedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Select a gate pass from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchmanDashboard;

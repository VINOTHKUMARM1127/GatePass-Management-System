import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentRequestForm = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    reason: '',
    department: '',
    additionalPersonName: ''
  });
  const [photo, setPhoto] = useState(null);
  const [additionalPersonPhoto, setAdditionalPersonPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gatePassId, setGatePassId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/admin/principal/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleAdditionalPersonPhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAdditionalPersonPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      toast.error('Please upload your photo');
      return;
    }

    if (formData.additionalPersonName && !additionalPersonPhoto) {
      toast.error('Photo is required for additional person');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('studentName', formData.studentName);
      formDataToSend.append('studentId', formData.studentId);
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('photo', photo);
      
      if (formData.additionalPersonName && additionalPersonPhoto) {
        formDataToSend.append('additionalPersonName', formData.additionalPersonName);
        formDataToSend.append('additionalPersonPhoto', additionalPersonPhoto);
      }

      const response = await axios.post('/api/gatepass/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setGatePassId(response.data.gatePass.gatePassId);
      toast.success(`Gate pass created! Your ID: ${response.data.gatePass.gatePassId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create gate pass');
    } finally {
      setLoading(false);
    }
  };

  if (gatePassId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully!</h2>
            <p className="text-gray-600 mb-4">Your gate pass request has been submitted.</p>
          </div>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Gate Pass ID:</p>
            <p className="text-2xl font-bold text-blue-600 font-mono">{gatePassId}</p>
            <p className="text-xs text-gray-500 mt-2">Save this ID to check your request status</p>
          </div>

          <div className="space-y-3">
            <Link
              to={`/viewer?id=${gatePassId}`}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
            >
              Check Status Now
            </Link>
            <Link
              to="/request"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition"
              onClick={() => {
                setGatePassId(null);
                setFormData({
                  studentName: '',
                  studentId: '',
                  reason: '',
                  department: '',
                  additionalPersonName: ''
                });
                setPhoto(null);
                setAdditionalPersonPhoto(null);
              }}
            >
              Submit Another Request
            </Link>
            <Link
              to="/viewer"
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              Go to Status Checker
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gate Pass Request</h1>
          <p className="text-gray-600">Submit your request to leave campus</p>
          <div className="mt-4 space-x-4">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700">
              Staff Login
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/viewer" className="text-sm text-blue-600 hover:text-blue-700">
              Check Status
            </Link>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your full name"
                  value={formData.studentName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  id="department"
                  name="department"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID (Optional)
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Student ID number"
                  value={formData.studentId}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leaving *
            </label>
            <textarea
              id="reason"
              name="reason"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide a detailed reason for leaving campus..."
              value={formData.reason}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo *
            </label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              required
              onChange={handlePhotoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {photo && (
              <p className="mt-2 text-sm text-gray-600">Selected: {photo.name}</p>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Person (Group Pass - Optional)</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="additionalPersonName" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="additionalPersonName"
                  name="additionalPersonName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name of additional person"
                  value={formData.additionalPersonName}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500">If adding another person, their photo is required</p>
              </div>
              {formData.additionalPersonName && (
                <div>
                  <label htmlFor="additionalPersonPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Person Photo *
                  </label>
                  <input
                    type="file"
                    id="additionalPersonPhoto"
                    name="additionalPersonPhoto"
                    accept="image/*"
                    required={!!formData.additionalPersonName}
                    onChange={handleAdditionalPersonPhotoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {additionalPersonPhoto && (
                    <p className="mt-2 text-sm text-gray-600">Selected: {additionalPersonPhoto.name}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <Link
              to="/viewer"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition text-center"
            >
              Check Status
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRequestForm;


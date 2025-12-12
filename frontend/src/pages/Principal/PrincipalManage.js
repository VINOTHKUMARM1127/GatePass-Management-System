import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const PrincipalManage = () => {
  const { user, refreshUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [hods, setHods] = useState([]);
  const [watchmen, setWatchmen] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'hod',
    department: ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
    fetchHODs();
    fetchWatchmen();
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/admin/principal/departments');
      setDepartments(response.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchHODs = async () => {
    try {
      const response = await axios.get('/api/admin/principal/hods');
      setHods(response.data);
    } catch (error) {
      toast.error('Failed to fetch HODs');
    }
  };

  const fetchWatchmen = async () => {
    try {
      const response = await axios.get('/api/admin/principal/users?role=watchman');
      setWatchmen(response.data);
    } catch (error) {
      // If endpoint doesn't exist, it's okay
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', userFormData);
      toast.success('User created successfully');
      setShowUserForm(false);
      setUserFormData({
        name: '',
        email: '',
        password: '',
        role: 'hod',
        department: ''
      });
      fetchHODs();
      fetchWatchmen();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/principal/departments', { name: newDeptName });
      toast.success('Department created successfully');
      setNewDeptName('');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create department');
    }
  };

  const handleAssignHOD = async (deptId, hodId) => {
    if (!hodId) return;
    
    try {
      await axios.put(`/api/admin/principal/departments/${deptId}/assign-hod`, { hodId });
      toast.success('HOD assigned successfully');
      fetchDepartments();
      fetchHODs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign HOD');
    }
  };

  const handleRevokeHOD = async (deptId, deptName) => {
    if (!window.confirm(`Are you sure you want to revoke HOD assignment from "${deptName}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/principal/departments/${deptId}/revoke-hod`);
      toast.success('HOD assignment revoked successfully');
      fetchDepartments();
      fetchHODs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke HOD assignment');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const updateData = {
        name: profileData.name,
        email: profileData.email
      };
      if (profileData.password) {
        updateData.password = profileData.password;
      }

      await axios.put('/api/auth/profile', updateData);
      toast.success('Profile updated successfully');
      setProfileData({ ...profileData, password: '', confirmPassword: '' });
      
      // Refresh user data
      await refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleEditDepartment = (dept) => {
    setEditingDept(dept._id);
    setEditDeptName(dept.name);
  };

  const handleUpdateDepartment = async (deptId) => {
    if (!editDeptName.trim()) {
      toast.error('Department name cannot be empty');
      return;
    }

    try {
      await axios.put(`/api/admin/principal/departments/${deptId}`, { name: editDeptName });
      toast.success('Department updated successfully');
      setEditingDept(null);
      setEditDeptName('');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update department');
    }
  };

  const handleDeleteDepartment = async (deptId, deptName) => {
    if (!window.confirm(`Are you sure you want to delete "${deptName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/principal/departments/${deptId}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user._id);
    setEditUserData({
      name: user.name,
      email: user.email,
      password: '',
      department: user.department || ''
    });
  };

  const handleUpdateUser = async (userId, userRole) => {
    if (!editUserData.name.trim() || !editUserData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      const updateData = {
        name: editUserData.name,
        email: editUserData.email
      };
      
      if (editUserData.password) {
        updateData.password = editUserData.password;
      }
      
      if (userRole === 'hod') {
        updateData.department = editUserData.department;
      }

      await axios.put(`/api/admin/principal/users/${userId}`, updateData);
      toast.success('User updated successfully');
      setEditingUser(null);
      setEditUserData({ name: '', email: '', password: '', department: '' });
      fetchHODs();
      fetchWatchmen();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId, userName, userRole) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/principal/users/${userId}`);
      toast.success('User deleted successfully');
      fetchHODs();
      fetchWatchmen();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">System Management</h1>
          <Link
            to="/principal"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'departments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              User Management
            </button>
          </nav>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={profileData.password}
                  onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              {profileData.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
              >
                Update Profile
              </button>
            </form>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Departments */}
            <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Departments</h2>
            
            <form onSubmit={handleCreateDepartment} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="New department name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
                >
                  Add
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {departments.map((dept) => (
                <div key={dept._id} className="p-3 bg-gray-50 rounded-md">
                  {editingDept === dept._id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editDeptName}
                        onChange={(e) => setEditDeptName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateDepartment(dept._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingDept(null);
                          setEditDeptName('');
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{dept.name}</p>
                          {dept.hod ? (
                            <p className="text-sm text-gray-600">HOD: <span className="font-medium text-blue-600">{dept.hod.name}</span></p>
                          ) : (
                            <p className="text-sm text-gray-400">No HOD assigned</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditDepartment(dept)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {/* HOD Assignment Section */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {dept.hod ? 'Change HOD' : 'Assign HOD'}
                        </label>
                        <div className="flex items-center space-x-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignHOD(dept._id, e.target.value);
                              }
                            }}
                            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            defaultValue={dept.hod ? dept.hod._id : ''}
                          >
                            <option value="">{dept.hod ? 'Select new HOD...' : 'Select HOD...'}</option>
                            {hods
                              .filter(hod => !hod.department || hod.department === dept.name || hod._id === (dept.hod?._id || dept.hod))
                              .map((hod) => (
                                <option key={hod._id} value={hod._id}>
                                  {hod.name} {hod.department && hod.department !== dept.name ? `(Currently: ${hod.department})` : ''}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* HODs */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">HODs</h2>
            <div className="space-y-2">
              {hods.length === 0 ? (
                <p className="text-gray-600">No HODs registered yet.</p>
              ) : (
                hods.map((hod) => (
                  <div key={hod._id} className="p-3 bg-gray-50 rounded-md">
                    <p className="font-medium text-gray-900">{hod.name}</p>
                    <p className="text-sm text-gray-600">{hod.email}</p>
                    {hod.department && (
                      <p className="text-sm text-blue-600">Department: {hod.department}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={() => setShowUserForm(!showUserForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
              >
                {showUserForm ? 'Cancel' : '+ Create User'}
              </button>
            </div>

            {showUserForm && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={userFormData.name}
                        onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <select
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value, department: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="hod">HOD</option>
                        <option value="watchman">Watchman</option>
                      </select>
                    </div>
                    {userFormData.role === 'hod' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                        <input
                          type="text"
                          required
                          value={userFormData.department}
                          onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
                  >
                    Create User
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">HODs ({hods.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {hods.map((hod) => (
                    <div key={hod._id} className="p-3 bg-gray-50 rounded-md">
                      {editingUser === hod._id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editUserData.name}
                            onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Name"
                          />
                          <input
                            type="email"
                            value={editUserData.email}
                            onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Email"
                          />
                          <input
                            type="text"
                            value={editUserData.department}
                            onChange={(e) => setEditUserData({ ...editUserData, department: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Department"
                          />
                          <input
                            type="password"
                            value={editUserData.password}
                            onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="New password (optional)"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateUser(hod._id, 'hod')}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setEditUserData({ name: '', email: '', password: '', department: '' });
                              }}
                              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded text-sm font-medium transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900">{hod.name}</p>
                          <p className="text-sm text-gray-600">{hod.email}</p>
                          {hod.department && (
                            <p className="text-sm text-blue-600">Dept: {hod.department}</p>
                          )}
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => handleEditUser(hod)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(hod._id, hod.name, 'hod')}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Watchmen ({watchmen.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {watchmen.map((watchman) => (
                    <div key={watchman._id} className="p-3 bg-gray-50 rounded-md">
                      {editingUser === watchman._id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editUserData.name}
                            onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Name"
                          />
                          <input
                            type="email"
                            value={editUserData.email}
                            onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Email"
                          />
                          <input
                            type="password"
                            value={editUserData.password}
                            onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="New password (optional)"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateUser(watchman._id, 'watchman')}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setEditUserData({ name: '', email: '', password: '', department: '' });
                              }}
                              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded text-sm font-medium transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900">{watchman.name}</p>
                          <p className="text-sm text-gray-600">{watchman.email}</p>
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => handleEditUser(watchman)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(watchman._id, watchman.name, 'watchman')}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalManage;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicNavbar from './components/PublicNavbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import StudentRequestForm from './pages/Student/StudentRequestForm';
import HODDashboard from './pages/HOD/HODDashboard';
import PrincipalDashboard from './pages/Principal/PrincipalDashboard';
import PrincipalManage from './pages/Principal/PrincipalManage';
import WatchmanDashboard from './pages/Watchman/WatchmanDashboard';
import ViewerPanel from './pages/Viewer/ViewerPanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes with navbar */}
            <Route 
              path="/" 
              element={
                <>
                  <PublicNavbar />
                  <Home />
                </>
              } 
            />
            <Route 
              path="/login" 
              element={
                <>
                  <PublicNavbar />
                  <Login />
                </>
              } 
            />
            
            {/* Public routes - no login required */}
            <Route 
              path="/submit" 
              element={
                <>
                  <PublicNavbar />
                  <StudentRequestForm />
                </>
              } 
            />
            <Route 
              path="/status" 
              element={
                <>
                  <PublicNavbar />
                  <ViewerPanel />
                </>
              } 
            />
            
            {/* Legacy routes - redirect to new routes */}
            <Route path="/request" element={<Navigate to="/submit" replace />} />
            <Route path="/viewer" element={<Navigate to="/status" replace />} />
            
            {/* Private routes with role-based access */}
            <Route
              path="/hod"
              element={
                <PrivateRoute allowedRoles={['hod']}>
                  <HODDashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/principal"
              element={
                <PrivateRoute allowedRoles={['principal']}>
                  <PrincipalDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/principal/manage"
              element={
                <PrivateRoute allowedRoles={['principal']}>
                  <PrincipalManage />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/watchman"
              element={
                <PrivateRoute allowedRoles={['watchman']}>
                  <WatchmanDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


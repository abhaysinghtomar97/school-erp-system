import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


// --- Import Pages ---
import Login from './pages/Auth/Login';
import ChangePassword from './pages/Auth/ChangePassword';
import AdminDashboard from './pages/Admin/AdminDashboard';
import FacultyDashboard from './pages/Faculty/FacultyDashboard';
import StudentDashboard from './pages/Student/StudentDashboard';
import ManageStudents from './pages/Admin/ManageStudents';
import ManageFaculty from './pages/Admin/ManageFaculty';
import ManageClasses from './pages/Admin/ManageClasses';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Must be logged in to change password */}
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />

          {/* 🔒 PROTECTED ROLE-SPECIFIC DASHBOARDS 🔒 */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageStudents />
            </ProtectedRoute>
          } />
          <Route path="/admin/faculty" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageFaculty />
            </ProtectedRoute>
          } />
          <Route path="/admin/classes" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageClasses />
            </ProtectedRoute>
          } />

          <Route path="/faculty" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } />
         

          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>404 - Page Not Found</h2>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
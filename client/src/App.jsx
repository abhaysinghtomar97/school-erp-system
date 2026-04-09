import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// --- Import Layouts ---
import AdminLayout from './layouts/AdminLayout'; // <-- NEW

// --- Import Pages ---
import Login from './pages/Auth/Login';
import ChangePassword from './pages/Auth/ChangePassword';
import AdminDashboard from './pages/Admin/AdminDashboard';
import FacultyDashboard from './pages/Faculty/FacultyDashboard';
import StudentDashboard from './pages/Student/StudentDashboard';
import ManageStudents from './pages/Admin/ManageStudents';
import ManageFaculty from './pages/Admin/ManageFaculty';
import ManageClasses from './pages/Admin/ManageClasses';
import ManageEnrollments from './pages/Admin/ManageEnrollments';

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

          {/* 🔒 NESTED ADMIN ROUTES 🔒 */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout /> {/* Parent Layout contains Sidebar/Header */}
            </ProtectedRoute>
          }>
            {/* These child routes render inside the <Outlet /> of AdminLayout */}
            <Route index element={<div>Welcome to Admin Home (You can put stats here!)</div>} />
            <Route path="create-user" element={<AdminDashboard />} /> 
            <Route path="students" element={<ManageStudents />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="classes" element={<ManageClasses />} />
            <Route path="enrollments" element={<ManageEnrollments />} />
          </Route>

          {/* 🔒 FACULTY ROUTES 🔒 */}
          <Route path="/faculty" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } />

          {/* 🔒 STUDENT ROUTES 🔒 */}
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
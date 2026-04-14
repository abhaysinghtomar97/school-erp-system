import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// --- Import Layout & Navigation Config ---
// Updated to use the universal layout we created
import DashboardLayout from './layouts/DashboardLayout'; 
// Make sure you have created this file with your link arrays
import { adminLinks, facultyLinks, studentLinks } from './config/navigation'; 

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
import CreateUser from './pages/Admin/CreateUser';
import ManageTimetable from './pages/Admin/ManageTimetable';
import FacultyAttendance from './pages/Faculty/FacultyAttandance';
import ManageAttendance from './pages/Admin/ManageAttandance';
import FacultyGrades from './pages/Faculty/FacultyGrades';
import StudentTimetable from './pages/Student/StudentTimeTable';
import StudentAttendance from './pages/Student/StudentAttendance';
import StudentAssignments from './pages/Student/StudentAssignment';
import RecentAnnouncements from './components/wedget/RecentAnnouncements';





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
              <DashboardLayout navLinks={adminLinks} />
            </ProtectedRoute>
          }>
            <Route path="" element={<AdminDashboard />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="classes" element={<ManageClasses />} />
            <Route path="enrollments" element={<ManageEnrollments />} />
            <Route path="timetable" element={<ManageTimetable/>} />
            <Route path="attendance" element={<ManageAttendance/>} />

          </Route>

          {/* 🔒 NESTED FACULTY ROUTES 🔒 */}
          <Route path="/faculty" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <DashboardLayout navLinks={facultyLinks} />
            </ProtectedRoute>
          }>
            {/* Renders FacultyDashboard inside the Layout's Outlet */}
            <Route path="" element={<FacultyDashboard />} />
            <Route path="attendance" element={<FacultyAttendance />} />
            <Route path="grades" element={<FacultyGrades />} />
            <Route path="notices" element={<RecentAnnouncements/>}/>
          </Route>

        
          {/* 🎓 NESTED STUDENT ROUTES 🎓 */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <DashboardLayout navLinks={studentLinks} />
            </ProtectedRoute>
          }>
            {/* The default dashboard page */}
            <Route index element={<StudentDashboard />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="notices" element={<RecentAnnouncements/>}/>
          </Route>

          {/* 🔒 NOTICE ROUTES 🔒 */}
          {/* Fixed the comment syntax. Note: You have this pointing to StudentDashboard. 
              If you want this inside the layout, move it into the nested student block above. */}
          <Route path="/notice" element={
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
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import StudentDashboard from './pages/Dashboards/StudentDashboard';
import ParentDashboard from './pages/Dashboards/ParentDashboard';
import TeacherDashboard from './pages/Dashboards/TeacherDashboard';
import AdminDashboard from './pages/Dashboards/AdminDashboard';
import ManageUsers from './pages/Dashboards/ManageUsers';
import TeacherApprovals from './pages/Dashboards/TeacherApprovals';
import StudentRecords from './pages/Dashboards/StudentRecords';
import Reports from './pages/Dashboards/Reports';
import Analytics from './pages/Dashboards/Analytics';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/parent" element={<ParentDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/admin/users" element={<ManageUsers />} />
        <Route path="/dashboard/admin/approvals" element={<TeacherApprovals />} />
        <Route path="/dashboard/admin/students" element={<StudentRecords />} />
        <Route path="/dashboard/admin/reports" element={<Reports />} />
        <Route path="/dashboard/admin/analytics" element={<Analytics />} />

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;


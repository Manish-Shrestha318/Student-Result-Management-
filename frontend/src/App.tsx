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
import FeeManagement from './pages/Dashboards/FeeManagement';
import Settings from './pages/Dashboards/Settings';
import ActivityLogs from './pages/Dashboards/ActivityLogs';
import NoticeManagement from './pages/Dashboards/NoticeManagement';
import ManageClasses from './pages/Dashboards/ManageClasses';
import ManageSubjects from './pages/Dashboards/ManageSubjects';
import StudentNotices from './pages/Dashboards/StudentNotices';
import StudentAttendance from './pages/Dashboards/StudentAttendance';
import StudentReports from './pages/Dashboards/StudentReports';
import StudentResults from './pages/Dashboards/StudentResults';
import TeacherRecords from './pages/Dashboards/TeacherRecords';
import ParentRecords from './pages/Dashboards/ParentRecords';
import TeacherResults from './pages/Dashboards/TeacherResults';
import TeacherAttendance from './pages/Dashboards/TeacherAttendance';
import TeacherNotices from './pages/Dashboards/TeacherNotices';
import TeacherAnalytics from './pages/Dashboards/TeacherAnalytics';
import StudentMessages from './pages/Dashboards/StudentMessages';
import TeacherMessages from './pages/Dashboards/TeacherMessages';
import ParentMessages from './pages/Dashboards/ParentMessages';

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
        <Route path="/dashboard/admin/fees" element={<FeeManagement />} />
        <Route path="/dashboard/admin/settings" element={<Settings />} />
        <Route path="/dashboard/admin/logs" element={<ActivityLogs />} />
        <Route path="/dashboard/admin/notices" element={<NoticeManagement />} />
        <Route path="/dashboard/admin/classes" element={<ManageClasses />} />
        <Route path="/dashboard/admin/subjects" element={<ManageSubjects />} />
        <Route path="/dashboard/admin/teachers" element={<TeacherRecords />} />
        <Route path="/dashboard/admin/parents" element={<ParentRecords />} />

        {/* Student Specific Routes */}
        <Route path="/dashboard/student/notices" element={<StudentNotices />} />
        <Route path="/dashboard/student/attendance" element={<StudentAttendance />} />
        <Route path="/dashboard/student/reports" element={<StudentReports />} />
        <Route path="/dashboard/student/results" element={<StudentResults />} />
        <Route path="/dashboard/student/settings" element={<Settings />} />
        <Route path="/dashboard/student/messages" element={<StudentMessages />} />

        {/* Teacher Specific Routes */}
        <Route path="/dashboard/teacher/results" element={<TeacherResults />} />
        <Route path="/dashboard/teacher/attendance" element={<TeacherAttendance />} />
        <Route path="/dashboard/teacher/notices" element={<TeacherNotices />} />
        <Route path="/dashboard/teacher/analytics" element={<TeacherAnalytics />} />
        <Route path="/dashboard/teacher/settings" element={<Settings />} />
        <Route path="/dashboard/teacher/messages" element={<TeacherMessages />} />

        {/* Parent Messages */}
        <Route path="/dashboard/parent/messages" element={<ParentMessages />} />

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;


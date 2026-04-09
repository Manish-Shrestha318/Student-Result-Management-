import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TeacherSidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard/teacher' },
    { name: 'Students', path: '/dashboard/teacher/students' },
    { name: 'Results', path: '/dashboard/teacher/results' },
    { name: 'Attendance', path: '/dashboard/teacher/attendance' },
    { name: 'Analytics', path: '/dashboard/teacher/analytics' },
    { name: 'Messages', path: '/dashboard/teacher/messages' },
    { name: 'Notice', path: '/dashboard/teacher/notices' },
  ];

  return (
    <aside className="d-flex flex-column bg-white border-end p-4 shadow-sm" style={{ width: '280px', height: '100vh', zIndex: 10 }}>
      {/* ── Brand Section ── */}
      <div className="mb-5 px-3">
        <h4 className="fw-bold text-primary ls-1 mb-0">SMARTRESULTS</h4>
        <span className="smallest text-muted fw-bold text-uppercase ls-1">Teacher Portal</span>
      </div>
      
      {/* ── Navigation Menu ── */}
      <nav className="nav flex-column gap-2 flex-grow-1 overflow-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`nav-link rounded-pill py-3 px-4 fw-bold transition-all d-flex align-items-center ${
                isActive 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-secondary hover-bg-light'
              }`}
            >
              <span className="ls-1 text-uppercase smallest">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Section ── */}
      <div className="mt-auto pt-4 border-top border-light">
          <div className="px-3 d-flex align-items-center gap-3">
              <div className="bg-primary-soft text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                  T
              </div>
              <div>
                  <div className="smallest fw-bold text-dark text-uppercase ls-1">Verified Instructor</div>
                  <div className="smallest text-muted fw-medium">Active Session</div>
              </div>
          </div>
      </div>
    </aside>
  );
};

export default TeacherSidebar;

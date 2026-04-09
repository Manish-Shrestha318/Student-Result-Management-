import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const StudentSidebar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const NavItem: React.FC<{ label: string, to: string }> = ({ label, to }) => {
    const isActive = path === to;
    return (
      <Link 
        to={to} 
        className={`nav-link rounded-pill py-3 px-4 mb-1 transition-all ${
          isActive 
            ? 'bg-primary text-white fw-bold shadow-sm' 
            : 'text-secondary fw-semibold hover-bg-light'
        }`}
      >
        <span className="ls-1 text-uppercase smallest">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="d-flex flex-column bg-white border-end p-4 shadow-sm h-100" style={{ width: '280px', zIndex: 10 }}>
      <div className="mb-5 px-3">
        <h4 className="fw-bold text-primary ls-1 mb-0 uppercase mb-1">SMARTRESULTS</h4>
        <span className="smallest text-muted fw-bold text-uppercase ls-1 opacity-50">Student Panel</span>
      </div>
      
      <nav className="nav flex-column gap-1 flex-grow-1 overflow-auto custom-scrollbar">
        <NavItem label="Dashboard" to="/dashboard/student" />
        <NavItem label="Results" to="/dashboard/student/results" />
        <NavItem label="Attendance" to="/dashboard/student/attendance" />
        <NavItem label="Notices" to="/dashboard/student/notices" />
        <NavItem label="Messages" to="/dashboard/student/messages" />
      </nav>
    </aside>
  );
};

export default StudentSidebar;

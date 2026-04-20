import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItemProps {
  label: string;
  path: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ label, path, active }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(path)}
      className={`btn w-100 text-start py-2 px-4 rounded-3 border-0 mb-1 ${active ? 'bg-primary text-white shadow-sm fw-bold' : 'bg-transparent text-secondary fw-semibold'}`}
      style={{ fontSize: '0.98rem', transition: 'all 0.2s ease', minHeight: '48px' }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#f8faff'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <span className="text-uppercase" style={{ letterSpacing: '0.8px' }}>{label}</span>
    </button>
  );
};

import logo from '../assets/logo.svg';

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="d-flex flex-column flex-shrink-0 p-4 bg-white border-end shadow-sm overflow-hidden" style={{ width: '300px', height: '100vh', zIndex: 1000 }}>
      <div className="mb-4 px-3 pt-2">
        <div className="d-flex align-items-center gap-2 mb-1">
          <img src={logo} alt="Logo" style={{ height: '32px', width: '32px' }} />
          <h4 className="fw-bold text-primary mb-0" style={{ letterSpacing: '1.5px' }}>SMARTRESULTS</h4>
        </div>
        <span className="text-muted fw-bold text-uppercase d-block mt-1" style={{ fontSize: '0.82rem', letterSpacing: '1.2px', opacity: 0.8 }}>ADMIN PANEL</span>
      </div>
      
      <div className="flex-grow-1 d-flex flex-column gap-1">
        <NavItem label="Dashboard" path="/dashboard/admin" active={location.pathname === '/dashboard/admin'} />
        <NavItem label="Users" path="/dashboard/admin/users" active={location.pathname === '/dashboard/admin/users'} />
        <NavItem label="Approvals" path="/dashboard/admin/approvals" active={location.pathname === '/dashboard/admin/approvals'} />
        <NavItem label="Students" path="/dashboard/admin/students" active={location.pathname === '/dashboard/admin/students'} />
        <NavItem label="Teachers" path="/dashboard/admin/teachers" active={location.pathname === '/dashboard/admin/teachers'} />
        <NavItem label="Parents" path="/dashboard/admin/parents" active={location.pathname === '/dashboard/admin/parents'} />
        <NavItem label="Classes" path="/dashboard/admin/classes" active={location.pathname === '/dashboard/admin/classes'} />
        <NavItem label="Subjects" path="/dashboard/admin/subjects" active={location.pathname === '/dashboard/admin/subjects'} />
        <NavItem label="Reports" path="/dashboard/admin/reports" active={location.pathname === '/dashboard/admin/reports'} />
        <NavItem label="Analytics" path="/dashboard/admin/analytics" active={location.pathname === '/dashboard/admin/analytics'} />
        {/* Fee NavItem removed */}
        <NavItem label="Notice" path="/dashboard/admin/notices" active={location.pathname === '/dashboard/admin/notices'} />
      </div>
    </aside>
  );
};

export default AdminSidebar;

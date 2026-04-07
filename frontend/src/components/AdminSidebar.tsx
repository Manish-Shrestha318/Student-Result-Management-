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
      className={`btn w-100 text-start py-2 px-3 rounded-3 border-0 mb-0 ${active ? 'bg-primary text-white shadow-sm fw-bold' : 'bg-transparent text-secondary fw-medium'}`}
      style={{ fontSize: '0.88rem', transition: 'all 0.2s ease' }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#f0f4ff'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <span className="text-uppercase" style={{ letterSpacing: '0.5px' }}>{label}</span>
    </button>
  );
};

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="d-flex flex-column flex-shrink-0 p-3 bg-white border-end shadow-sm" style={{ width: '250px', height: '100vh', zIndex: 1000 }}>
      <div className="mb-4 px-2 pt-2">
        <h5 className="fw-bold text-primary mb-0" style={{ letterSpacing: '1px' }}>SMARTRESULTS</h5>
        <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Admin Panel</span>
      </div>
      
      <div className="flex-grow-1 overflow-auto pe-1 d-flex flex-column">
        <NavItem label="Dashboard" path="/dashboard/admin" active={location.pathname === '/dashboard/admin'} />
        <NavItem label="User Management" path="/dashboard/admin/users" active={location.pathname === '/dashboard/admin/users'} />
        <NavItem label="Teacher Approvals" path="/dashboard/admin/approvals" active={location.pathname === '/dashboard/admin/approvals'} />
        <NavItem label="Student Records" path="/dashboard/admin/students" active={location.pathname === '/dashboard/admin/students'} />
        <NavItem label="Teacher Records" path="/dashboard/admin/teachers" active={location.pathname === '/dashboard/admin/teachers'} />
        <NavItem label="Parent Records" path="/dashboard/admin/parents" active={location.pathname === '/dashboard/admin/parents'} />
        <NavItem label="Classes" path="/dashboard/admin/classes" active={location.pathname === '/dashboard/admin/classes'} />
        <NavItem label="Subjects" path="/dashboard/admin/subjects" active={location.pathname === '/dashboard/admin/subjects'} />
        <NavItem label="Reports" path="/dashboard/admin/reports" active={location.pathname === '/dashboard/admin/reports'} />
        <NavItem label="Analytics" path="/dashboard/admin/analytics" active={location.pathname === '/dashboard/admin/analytics'} />
        <NavItem label="Fee Management" path="/dashboard/admin/fees" active={location.pathname === '/dashboard/admin/fees'} />
        <NavItem label="Notices" path="/dashboard/admin/notices" active={location.pathname === '/dashboard/admin/notices'} />
      </div>
    </aside>
  );
};

export default AdminSidebar;

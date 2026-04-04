import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  CreditCard, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, active }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(path)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        padding: '0.875rem 1.25rem', 
        borderRadius: 'var(--btn-radius)', 
        border: 'none', 
        backgroundColor: active ? '#f1f5f9' : 'transparent', 
        color: active ? 'var(--primary)' : 'var(--text-secondary)', 
        fontSize: '0.95rem',
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.2s'
      }}
    >
      {icon}
      {label}
    </button>
  );
};

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>SmartResults</h1>
      </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" path="/dashboard/admin" active={location.pathname === '/dashboard/admin'} />
        <NavItem icon={<Users size={20} />} label="Manage Users" path="/dashboard/admin/users" active={location.pathname === '/dashboard/admin/users'} />
        <NavItem icon={<UserCheck size={20} />} label="Teacher Approvals" path="/dashboard/admin/approvals" active={location.pathname === '/dashboard/admin/approvals'} />
        <NavItem icon={<GraduationCap size={20} />} label="Student Records" path="/dashboard/admin/students" active={location.pathname === '/dashboard/admin/students'} />
        <NavItem icon={<FileText size={20} />} label="Reports" path="/dashboard/admin/reports" active={location.pathname === '/dashboard/admin/reports'} />
        <NavItem icon={<BarChart3 size={20} />} label="Analytics" path="/dashboard/admin/analytics" active={location.pathname === '/dashboard/admin/analytics'} />
        <NavItem icon={<CreditCard size={20} />} label="Fee Management" path="/dashboard/admin/fees" active={location.pathname === '/dashboard/admin/fees'} />
        <NavItem icon={<Settings size={20} />} label="Settings" path="/dashboard/admin/settings" active={location.pathname === '/dashboard/admin/settings'} />
      </nav>

      <button 
        onClick={handleLogout}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', color: '#dc2626', border: 'none', background: 'none', fontSize: '1rem', cursor: 'pointer', marginTop: 'auto' }}
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarItem {
  label: string;
  path: string;
}

interface BaseSidebarProps {
  title: string;
  subtitle: string;
  items: SidebarItem[];
}

const NavItem: React.FC<{ label: string; path: string; active: boolean }> = ({ label, path, active }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(path)}
      className={`btn w-100 text-start py-2 px-4 rounded-3 border-0 mb-1 ${active ? 'bg-primary text-white shadow-sm fw-bold' : 'bg-transparent text-secondary fw-semibold'}`}
      style={{ fontSize: '0.92rem', transition: 'all 0.2s ease', minHeight: '48px' }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#f8faff'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <span className="text-uppercase ls-1">{label}</span>
    </button>
  );
};

const BaseSidebar: React.FC<BaseSidebarProps> = ({ title, subtitle, items }) => {
  const location = useLocation();

  return (
    <aside className="d-flex flex-column flex-shrink-0 p-4 bg-white border-end shadow-sm overflow-hidden" style={{ width: '280px', height: '100vh', zIndex: 1000 }}>
      <div className="mb-4 px-3 pt-2">
        <h4 className="fw-bold text-primary mb-1 ls-2">{title}</h4>
        <span className="text-muted fw-bold text-uppercase d-block mt-1 smallest ls-1 opacity-75">{subtitle}</span>
      </div>
      
      <div className="flex-grow-1 d-flex flex-column gap-1 overflow-auto custom-scrollbar">
        {items.map((item, index) => (
          <NavItem 
            key={index}
            label={item.label} 
            path={item.path} 
            active={location.pathname === item.path} 
          />
        ))}
      </div>
    </aside>
  );
};

export default BaseSidebar;

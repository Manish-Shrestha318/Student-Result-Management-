import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Form } from 'react-bootstrap';

import logo from '../assets/logo.svg';

const ParentSidebar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  useEffect(() => {
    fetchProfile();
    // Sync selection with localStorage
    const saved = localStorage.getItem('selectedChildId');
    if (saved) setSelectedChildId(saved);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'selectedChildId' && e.newValue) {
        setSelectedChildId(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.user) {
        const list = data.user.parentProfile?.children || [];
        setChildren(list);
        
        // Only set default if nothing is already selected in storage
        const currentStored = localStorage.getItem('selectedChildId');
        if (!currentStored && list.length > 0) {
          const firstId = list[0]._id;
          setSelectedChildId(firstId);
          localStorage.setItem('selectedChildId', firstId);
        } else if (currentStored) {
          setSelectedChildId(currentStored);
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleChildChange = (id: string) => {
    setSelectedChildId(id);
    localStorage.setItem('selectedChildId', id);
    // Dispatch event manually for multi-tab sync or same-page components
    window.dispatchEvent(new Event('storage'));
    
    // Refresh to trigger re-fetch in main components
    window.location.reload(); 
  };

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
        <div className="d-flex align-items-center gap-2 mb-1">
          <img src={logo} alt="Logo" style={{ height: '30px', width: '30px' }} />
          <h4 className="fw-bold text-primary ls-1 mb-0 uppercase mb-1">SMARTRESULTS</h4>
        </div>
        <span className="smallest text-muted fw-bold text-uppercase ls-1 opacity-50">Parent Panel</span>
      </div>

      <div className="mb-5 px-3">
        <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-2 opacity-50">Active Child</span>
        <Form.Select 
          className="smallest fw-bold py-2 border-light-dark rounded-3 shadow-none text-uppercase"
          value={selectedChildId}
          onChange={(e) => handleChildChange(e.target.value)}
          disabled={children.length === 0}
        >
          {children.length === 0 ? (
            <option>Loading profiles...</option>
          ) : (
            children.map((c: any) => (
              <option key={c._id} value={c._id}>
                {(c.userId?.name || 'STUDENT').toUpperCase()}
              </option>
            ))
          )}
        </Form.Select>
      </div>
      
      <nav className="nav flex-column gap-1 flex-grow-1 overflow-auto custom-scrollbar">
        <NavItem label="Dashboard" to="/dashboard/parent" />
        <NavItem label="Results" to="/dashboard/parent/results" />
        <NavItem label="Attendance" to="/dashboard/parent/attendance" />
        <NavItem label="Notices" to="/dashboard/parent/notices" />
        <NavItem label="Messages" to="/dashboard/parent/messages" />
      </nav>
    </aside>
  );
};

export default ParentSidebar;

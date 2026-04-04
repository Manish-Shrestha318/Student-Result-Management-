import React from 'react';
import { Search, Bell, User } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  error?: string | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, error }) => {
  return (
    <header style={{ height: '80px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', position: 'sticky', top: 0, zIndex: 10 }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>
        {error && <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>{error}</p>}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
          <input 
            type="text" 
            placeholder="Global Search..." 
            style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.9rem', width: '250px', outline: 'none' }} 
          />
        </div>

        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={22} color="var(--text-secondary)" />
          <span style={{ position: 'absolute', top: -4, right: -4, width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '45px', height: '45px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={24} color="#fff" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  title: string;
  error?: string | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, error }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotices = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/notices', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setNotices(data.data.slice(0, 5)); // Keep last 5
        }
      } catch (err) {
        console.error("Failed to load notices", err);
      }
    };
    fetchNotices();
  }, []);

  // Global Search logic (mocking hitting users endpoint)
  useEffect(() => {
    const delayDebounceRequest = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            const filtered = data.users.filter((u: any) => 
              u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              u.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filtered.slice(0, 5));
            setShowSearch(true);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setShowSearch(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceRequest);
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const rawUser = localStorage.getItem('user');
  const userObj = rawUser ? JSON.parse(rawUser) : null;

  return (
    <header style={{ height: '80px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', position: 'sticky', top: 0, zIndex: 50 }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>
        {error && <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>{error}</p>}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        
        {/* Global Search */}
        <div style={{ position: 'relative' }} ref={searchRef}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if(searchQuery.length > 1) setShowSearch(true) }}
            placeholder="Global Search..." 
            style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.9rem', width: '250px', outline: 'none' }} 
          />
          {showSearch && searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: '120%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '0.5rem', zIndex: 100 }}>
              {searchResults.map((u, i) => (
                <div key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => navigate('/dashboard/admin/users')}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{u.name}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.role} - {u.email}</p>
                </div>
              ))}
            </div>
          )}
          {showSearch && searchResults.length === 0 && (
            <div style={{ position: 'absolute', top: '120%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '1rem', zIndex: 100, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              No results found.
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }} ref={notifRef}>
          <div onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={22} color="var(--text-secondary)" />
            {notices.length > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>}
          </div>
          
          {showNotifications && (
            <div style={{ position: 'absolute', top: '140%', right: -10, width: '300px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '1rem', zIndex: 100 }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Alerts & Notices</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notices.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>No new notifications</p>
                ) : (
                  notices.map((n, i) => (
                    <div key={i} style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
                      <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.content?.substring(0, 30)}...</p>
                    </div>
                  ))
                )}
              </div>
              <button 
                onClick={() => {
                  const userStr = localStorage.getItem('user');
                  const role = userStr ? JSON.parse(userStr).role : '';
                  if (role === 'admin') navigate('/dashboard/admin/notices');
                  else if (role === 'teacher') navigate('/dashboard/teacher');
                  else navigate('/dashboard/student');
                }}
                style={{ width: '100%', padding: '0.5rem', marginTop: '1rem', background: 'none', border: 'none', borderTop: '1px solid var(--border-color)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                View all Board Notices &rarr;
              </button>
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.2rem', borderRadius: '8px', transition: 'background 0.2s' }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color="#fff" />
            </div>
          </div>
          
          {showProfileMenu && (
            <div style={{ position: 'absolute', top: '120%', right: 0, width: '220px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden', zIndex: 100 }}>
              
              {/* Profile Header Info */}
              <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{userObj?.name || 'Administrator'}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{userObj?.email || 'admin@school.com'}</p>
                <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.1rem 0.5rem', backgroundColor: '#e0e7ff', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  {userObj?.role || 'Admin'}
                </span>
              </div>

              <button 
                onClick={() => navigate('/dashboard/admin/settings')}
                style={{ width: '100%', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', background: '#fff', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                <SettingsIcon size={18} color="var(--text-secondary)" />
                Settings
              </button>
              
              <div style={{ borderTop: '1px solid var(--border-color)' }}></div>
              
              <button 
                onClick={handleLogout}
                style={{ width: '100%', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', background: '#fff', cursor: 'pointer', color: '#dc2626', fontSize: '0.9rem', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;


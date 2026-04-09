import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { InputGroup, Form, Button, Badge } from 'react-bootstrap';

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
          setNotices(Array.isArray(data.data) ? data.data.slice(0, 5) : []);
        }
      } catch (err) {
        console.error("Failed to load notices", err);
      }
    };
    fetchNotices();
  }, []);

  // Global Search logic
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
    <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-0 shadow-sm" style={{ height: '80px', zIndex: 1020 }}>
      <div className="container-fluid px-4 py-2">
        <div className="d-flex flex-column">
          <h1 className="navbar-brand h5 fw-bold mb-0 text-dark ls-1 text-uppercase small">{title}</h1>
          {error && <span className="smallest text-danger fw-bold text-uppercase ls-1">{error}</span>}
        </div>
        
        <div className="ms-auto d-flex align-items-center gap-4">
          
          {/* Global Search */}
          <div className="position-relative d-none d-md-block" ref={searchRef}>
            <InputGroup size="sm" className="rounded-pill overflow-hidden border-light-dark">
              <InputGroup.Text className="bg-white border-0 ps-3">
                <Search size={14} className="text-secondary" />
              </InputGroup.Text>
              <Form.Control 
                type="text" 
                placeholder="Search..." 
                className="border-0 py-2 shadow-none smaller fw-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchQuery.length > 1) setShowSearch(true) }}
                style={{ width: '240px' }}
              />
            </InputGroup>

            {showSearch && (
              <div className="position-absolute top-100 start-0 w-100 mt-2 bg-white border-0 shadow-lg rounded-4 p-2 overflow-hidden" style={{ zIndex: 1050 }}>
                {searchResults.length > 0 ? (
                  searchResults.map((u, i) => (
                    <div key={i} className="p-3 rounded-3 hover-bg-light cursor-pointer transition-all mb-1 border-bottom last-border-0" onClick={() => { navigate('/dashboard/admin/users'); setShowSearch(false); }}>
                      <div className="fw-bold smaller text-dark text-uppercase ls-1">{u.name}</div>
                      <div className="text-secondary smallest fw-bold text-uppercase ls-1">{u.role} · {u.email}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted smallest fw-bold text-uppercase ls-1">No matching entities found.</div>
                )}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="position-relative" ref={notifRef}>
            <Button 
              variant="link" 
              className="p-2 text-secondary position-relative text-decoration-none shadow-none"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {notices.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-white rounded-circle"></span>
              )}
            </Button>
            
            {showNotifications && (
              <div className="position-absolute top-100 end-0 mt-2 bg-white border-0 shadow-lg rounded-4 p-0 overflow-hidden" style={{ width: '340px', zIndex: 1050 }}>
                <div className="p-4 border-bottom bg-light-soft d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold smallest text-uppercase ls-2">Notices</h6>
                  <Badge bg="primary-soft" text="primary" className="fw-bold smallest rounded-pill">{notices.length}</Badge>
                </div>
                <div className="p-2 overflow-auto custom-scrollbar" style={{ maxHeight: '380px' }}>
                  {notices.length === 0 ? (
                    <div className="p-5 text-center text-muted smallest fw-bold text-uppercase ls-1">No new notifications.</div>
                  ) : (
                    notices.map((n, i) => (
                      <div key={i} className="p-3 mb-2 rounded-3 hover-bg-light transition-all cursor-pointer border-start border-4 border-primary">
                        <div className="fw-bold smaller text-dark mb-1 ls-1 text-uppercase">{n.title}</div>
                        <div className="text-secondary smallest fw-medium lh-sm">{n.content?.substring(0, 80)}...</div>
                      </div>
                    ))
                  )}
                </div>
                <Button 
                  variant="light" 
                  className="w-100 rounded-0 py-3 border-top fw-bold text-primary smallest text-uppercase ls-1 shadow-none"
                  onClick={() => navigate('/dashboard/admin/notices')}
                >
                  VIEW ALL
                </Button>
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <div className="position-relative" ref={profileRef}>
            <button 
              className="btn btn-link p-0 border-0 d-flex align-items-center gap-2 text-decoration-none shadow-none"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '38px', height: '38px', fontSize: '0.85rem' }}>
                {userObj?.name ? userObj.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </button>
            
            {showProfileMenu && (
              <div className="position-absolute top-100 end-0 mt-2 bg-white border-0 shadow-lg rounded-4 p-0 overflow-hidden" style={{ width: '260px', zIndex: 1050 }}>
                <div className="p-4 border-bottom bg-light-soft">
                  <div className="fw-bold text-dark text-truncate smallest text-uppercase ls-1 mb-1">{userObj?.name || 'Administrator'}</div>
                  <div className="text-secondary smallest fw-bold text-truncate ls-1">{userObj?.email || 'admin@school.com'}</div>
                  <div className="mt-3">
                    <span className="badge bg-primary-soft text-primary text-uppercase smallest ls-1 px-3 py-2 rounded-pill border">
                      {userObj?.role || 'Admin'} Role
                    </span>
                  </div>
                </div>

                <div className="p-2">
                  <button onClick={() => navigate('/dashboard/admin/settings')} className="btn btn-link dropdown-item py-2 px-3 d-flex align-items-center gap-2 smallest fw-bold text-uppercase ls-1 text-secondary transition-all">
                    SETTINGS
                  </button>
                  <div className="dropdown-divider mx-3 my-2 opacity-25"></div>
                  <button onClick={handleLogout} className="btn btn-link dropdown-item py-2 px-3 text-danger d-flex align-items-center gap-2 smallest fw-bold text-uppercase ls-1 transition-all">
                    LOGOUT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;



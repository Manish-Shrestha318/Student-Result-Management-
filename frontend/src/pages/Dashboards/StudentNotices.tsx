import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  ChevronDown,
  Clock,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  publishDate: string;
  expiryDate?: string;
  createdAt: string;
  createdBy?: { name: string };
  targetRoles?: string[];
}

const StudentNotices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchNotices = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const url = filterCategory === 'all' ? '/api/notices' : `/api/notices?category=${filterCategory}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotices(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch notices');
      }
    } catch (err) {
      setError('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [filterCategory]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'academic': return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
      case 'event': return { bg: '#faf5ff', color: '#7c3aed', border: '#ddd6fe' };
      case 'exam': return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      case 'holiday': return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case 'general': return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
      default: return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>SmartResults</h1>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => navigate('/dashboard/student')} />
          <NavItem icon={<GraduationCap size={20} />} label="Results" onClick={() => navigate('/dashboard/student/results')} />
          <NavItem icon={<Calendar size={20} />} label="Attendance" onClick={() => navigate('/dashboard/student/attendance')} />
          <NavItem icon={<Bell size={20} />} label="Notices" active />
          <NavItem icon={<FileText size={20} />} label="Reports" onClick={() => navigate('/dashboard/student/reports')} />
        </nav>

        <button 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', color: '#dc2626', border: 'none', background: 'none', fontSize: '1rem', cursor: 'pointer', marginTop: 'auto' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Notices & Announcements" error={error} />

        <div style={{ padding: '2.5rem' }}>
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notices..." 
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none' }} 
              />
            </div>
            <div style={{ position: 'relative' }}>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', appearance: 'none', cursor: 'pointer', background: '#fff' }}
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="event">Events</option>
                <option value="exam">Exams</option>
                <option value="holiday">Holidays</option>
                <option value="general">General</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} size={16} />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <p>Loading notices...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <Bell size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Notices Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>There are no notices matching your criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: selectedNotice ? '1fr 1fr' : '1fr', gap: '2rem' }}>
              {/* Notice List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredNotices.map((notice) => {
                  const catStyle = getCategoryColor(notice.category);
                  const isSelected = selectedNotice?._id === notice._id;
                  return (
                    <div 
                      key={notice._id}
                      onClick={() => setSelectedNotice(notice)}
                      className="card" 
                      style={{ 
                        cursor: 'pointer', 
                        borderLeft: `4px solid ${catStyle.color}`,
                        background: isSelected ? '#f8fafc' : '#fff',
                        boxShadow: isSelected ? '0 0 0 2px var(--primary)' : undefined,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}`, textTransform: 'capitalize' }}>
                          {notice.category}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {formatDate(notice.createdAt)}
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{notice.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {notice.content.length > 120 ? notice.content.substring(0, 120) + '...' : notice.content}
                      </p>
                      {notice.createdBy && (
                        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <User size={12} /> Posted by {notice.createdBy.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detail Panel */}
              {selectedNotice && (
                <div className="card" style={{ position: 'sticky', top: '2rem', alignSelf: 'flex-start' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, 
                      background: getCategoryColor(selectedNotice.category).bg, 
                      color: getCategoryColor(selectedNotice.category).color, 
                      border: `1px solid ${getCategoryColor(selectedNotice.category).border}`,
                      textTransform: 'capitalize'
                    }}>
                      {selectedNotice.category}
                    </span>
                  </div>
                  <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.35rem' }}>{selectedNotice.title}</h2>
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> {formatDate(selectedNotice.createdAt)}</span>
                    {selectedNotice.createdBy && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><User size={14} /> {selectedNotice.createdBy.name}</span>
                    )}
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0 0 1.5rem 0' }} />
                  <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-primary)' }}>
                    {selectedNotice.content.split('\n').map((para, i) => (
                      <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
                    ))}
                  </div>
                  {selectedNotice.expiryDate && (
                    <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                      Expires on: {formatDate(selectedNotice.expiryDate)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Internal Side nav component
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
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

export default StudentNotices;

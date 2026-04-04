import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Calendar, 
  Bell, 
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'holiday';
  remarks?: string;
}

const StudentAttendance: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    holiday: 0,
    percentage: '0'
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (user?._id) {
      fetchAttendanceData();
    }
  }, [user, currentMonth, currentYear]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Use the student report API for full month stats
      const month = currentMonth + 1;
      const response = await fetch(`/api/academics/attendance/report/${user._id}?month=${month}&year=${currentYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAttendance(data.data.details || []);
        setStats({
          present: data.data.present || 0,
          absent: data.data.absent || 0,
          late: data.data.late || 0,
          holiday: data.data.holiday || 0,
          percentage: data.data.percentage || '0'
        });
      } else {
        setError(data.message || 'Failed to fetch attendance');
      }
    } catch (err) {
      setError('Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const changeMonth = (offset: number) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getDayStatus = (dayNum: number) => {
    const dateStr = new Date(currentYear, currentMonth, dayNum).toISOString().split('T')[0];
    return attendance.find(a => a.date.startsWith(dateStr));
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(currentYear, currentMonth));

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
          <NavItem icon={<Calendar size={20} />} label="Attendance" active />
          <NavItem icon={<Bell size={20} />} label="Notices" onClick={() => navigate('/dashboard/student/notices')} />
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
        <AdminHeader title="Attendance Records" error={error} />

        <div style={{ padding: '2.5rem' }}>
          {/* Stats Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <StatCard label="Present" value={stats.present} color="#059669" icon={<CheckCircle2 size={20} />} />
            <StatCard label="Absent" value={stats.absent} color="#dc2626" icon={<XCircle size={20} />} />
            <StatCard label="Attendance %" value={`${stats.percentage}%`} color="var(--primary)" icon={<AlertCircle size={20} />} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Calendar View */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>{monthName} {currentYear}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => changeMonth(-1)} style={navBtnStyle}><ChevronLeft size={20} /></button>
                  <button onClick={() => setCurrentMonth(new Date().getMonth())} style={navBtnStyle}>Today</button>
                  <button onClick={() => changeMonth(1)} style={navBtnStyle}><ChevronRight size={20} /></button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.85rem', paddingBottom: '0.5rem' }}>
                    {day}
                  </div>
                ))}
                
                {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, i) => {
                  const dayNum = i + 1;
                  const status = getDayStatus(dayNum);
                  return (
                    <div 
                      key={dayNum} 
                      style={{ 
                        height: '80px', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '12px', 
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: status ? getStatusBg(status.status) : 'transparent',
                        borderColor: status ? getStatusColor(status.status) : 'var(--border-color)'
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dayNum}</span>
                      {status && (
                        <div style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          color: getStatusColor(status.status),
                          textAlign: 'center'
                        }}>
                          {status.status}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendance Summary/Legend */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Status Guide</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <LegendItem status="present" label="Present" />
                <LegendItem status="absent" label="Absent" />
              </div>
              
              <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--primary)', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>Monthly Productivity</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.percentage}%</div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
                  <div style={{ width: `${stats.percentage}%`, height: '100%', background: '#fff' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const LegendItem = ({ status, label }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ 
      width: '32px', height: '32px', borderRadius: '8px', 
      backgroundColor: getStatusBg(status), display: 'flex', alignItems: 'center', 
      justifyContent: 'center', color: getStatusColor(status) 
    }}>
      {getStatusIcon(status)}
    </div>
    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
  </div>
);

// Helper Components
const StatCard = ({ label, value, color, icon }: any) => (
  <div className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${color}` }}>
    <div style={{ color, marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
  </div>
);

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', borderRadius: 'var(--btn-radius)', border: 'none', 
    backgroundColor: active ? '#f1f5f9' : 'transparent', color: active ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.95rem',
    fontWeight: active ? 600 : 500, cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s'
  }}>
    {icon} {label}
  </button>
);

const navBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer', 
  fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', transition: 'all 0.2s'
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'present': return '#059669';
    case 'absent': return '#dc2626';
    case 'late': return '#ca8a04';
    case 'holiday': return '#7c3aed';
    default: return '#64748b';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'present': return '#ecfdf5';
    case 'absent': return '#fef2f2';
    case 'late': return '#fef9c3';
    case 'holiday': return '#faf5ff';
    default: return '#f8fafc';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'present': return <CheckCircle2 size={18} />;
    case 'absent': return <XCircle size={18} />;
    case 'late': return <Clock size={18} />;
    case 'holiday': return <Calendar size={18} />;
    default: return <AlertCircle size={18} />;
  }
};

export default StudentAttendance;

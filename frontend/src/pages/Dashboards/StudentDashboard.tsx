import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  Download,
  Award
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import AdminHeader from '../../components/AdminHeader';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend
);

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

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
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      // 1. Fetch Marks/Results
      const resultsRes = await fetch(`/api/academics/marks/marks/student/${user._id}`, { headers });
      const resultsData = await resultsRes.json();
      if (resultsData.success) setResults(resultsData.data);

      // 2. Fetch Attendance
      const attendanceRes = await fetch(`/api/academics/attendance/student/${user._id}`, { headers });
      const attendanceData = await attendanceRes.json();
      if (attendanceData.success) setAttendance(attendanceData.data);

      // 3. Fetch Performance Trends
      const trendsRes = await fetch(`/api/academics/marks/trends/${user._id}`, { headers });
      const trendsData = await trendsRes.json();
      if (trendsData.success) setTrends(trendsData.data);

      // 4. Fetch Announcements
      const noticesRes = await fetch('/api/notices', { headers });
      const noticesData = await noticesRes.json();
      if (noticesData.success) {
        setAnnouncements(noticesData.data ? noticesData.data.slice(0, 3) : []);
      }

    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load some dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const year = new Date().getFullYear();
      const term = "Final"; 
      const url = `/api/report-cards/generate?studentId=${user._id}&term=${term}&year=${year}`;
      window.open(url, '_blank');
    } catch (err) {
      alert("Failed to generate report card");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const chartData = {
    labels: trends.length > 0 ? trends.map(t => t.term) : ['Unit 1', 'Unit 2', 'Quarterly', 'Unit 3', 'Unit 4', 'Finals'],
    datasets: [
      {
        label: 'Academic Progress (%)',
        data: trends.length > 0 ? trends.map(t => parseFloat(t.percentage)) : [0, 0, 0, 0, 0, 0],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    }
  };

  // Calculate stats
  const averageMarksValue = results.length > 0 ? (results.reduce((acc, curr) => acc + curr.marksObtained, 0) / results.reduce((acc, curr) => acc + curr.totalMarks, 0) * 100).toFixed(1) : 'N/A';
  const attendancePercentage = attendance?.length > 0 ? ((attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100).toFixed(1) : '0';

  const stats = [
    { label: 'Avg Achievement', value: results.length > 0 ? `${averageMarksValue}%` : '---', icon: Award, color: '#2563eb' },
    { label: 'Attendance', value: `${attendancePercentage}%`, icon: Calendar, color: '#0ea5e9' },
    { label: 'Total Subjects', value: results.length.toString(), icon: GraduationCap, color: '#8b5cf6' },
  ];

  if (loading && !user) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar navigation */}
      <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>SmartResults</h1>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => navigate('/dashboard/student')} />
          <NavItem icon={<GraduationCap size={20} />} label="Results" onClick={() => navigate('/dashboard/student/results')} />
          <NavItem icon={<Calendar size={20} />} label="Attendance" onClick={() => navigate('/dashboard/student/attendance')} />
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

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Topbar navigation */}
        <AdminHeader title="Student Dashboard" error={error} />

        {/* Dashboard Content */}
        <div style={{ padding: '3rem' }}>
          {error && (
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          {/* Summary Cards section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
            {stats.map((stat, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: `${stat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</p>
                  <h3 style={{ fontSize: '1.75rem', marginBottom: 0 }}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Progress Chart section */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3>Academic Performance Trend</h3>
                  <button onClick={handleDownloadReport} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Download size={16} />
                    Download PDF Report
                  </button>
                </div>
                <div style={{ height: '300px' }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Subject Results Table section */}
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Subject-wise Grades</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Subject</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Exam Type</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Marks</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Grade</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No results found yet.</td>
                        </tr>
                      ) : (
                        results.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1.25rem 1rem', fontWeight: 500 }}>{row.subjectId?.name || 'Subject'}</td>
                            <td style={{ padding: '1.25rem 1rem' }}>{row.examType}</td>
                            <td style={{ padding: '1.25rem 1rem' }}>{row.marksObtained} / {row.totalMarks}</td>
                            <td style={{ padding: '1.25rem 1rem', fontWeight: 700 }}>{row.grade || 'N/A'}</td>
                            <td style={{ padding: '1.25rem 1rem' }}>
                              <div style={{ width: '100%', maxWidth: '120px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${(row.marksObtained / row.totalMarks) * 100}%`, height: '100%', background: 'var(--primary)' }}></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Announcements section */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Bell size={20} color="var(--primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Latest Announcements</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {announcements.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No recent announcements.</p>
                  ) : (
                    announcements.map((ann, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{new Date(ann.createdAt).toLocaleDateString()}</p>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{ann.title}</h4>
                        <p style={{ fontSize: '0.875rem' }}>{ann.content.substring(0, 80)}...</p>
                      </div>
                    ))
                  )}
                  <button onClick={() => navigate('/dashboard/student/results')} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}>View All Announcements →</button>
                </div>
              </div>

              {/* Attendance section */}
              <div className="card" style={{ background: '#2563eb', color: '#fff', border: 'none' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Calendar size={24} />
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Attendance Status</h4>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1rem' }}>Your current attendance is {attendancePercentage}%. Keep it up to maintain your grade eligibility.</p>
                    <button onClick={() => navigate('/dashboard/student/attendance')} style={{ background: '#fff', color: '#2563eb', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>View Detailed Log</button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
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
  }}>
    {icon}
    {label}
  </button>
);

export default StudentDashboard;

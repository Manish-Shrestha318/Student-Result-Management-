import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  User, 
  Download,
  AlertCircle,
  TrendingUp,
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
  // Dummy data for performance chart
  const chartData = {
    labels: ['Unit 1', 'Unit 2', 'Quarterly', 'Unit 3', 'Unit 4', 'Finals'],
    datasets: [
      {
        label: 'Academic Progress (%)',
        data: [75, 82, 78, 85, 92, 88],
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

  const stats = [
    { label: 'Latest Grade', value: 'A-', icon: Award, color: '#2563eb' },
    { label: 'Attendance', value: '94%', icon: Calendar, color: '#0ea5e9' },
    { label: 'Overall GPA', value: '3.8', icon: TrendingUp, color: '#8b5cf6' },
  ];

  const results = [
    { subject: 'Mathematics', marks: 92, total: 100, grade: 'A+' },
    { subject: 'Science', marks: 88, total: 100, grade: 'A' },
    { subject: 'English', marks: 85, total: 100, grade: 'B+' },
    { subject: 'History', marks: 78, total: 100, grade: 'B' },
    { subject: 'Computer Science', marks: 95, total: 100, grade: 'A+' },
  ];

  const announcements = [
    { title: 'Final Exams Schedule', date: 'Oct 15, 2024', description: 'The final examination schedule for the current semester has been posted.' },
    { title: 'New Science Lab Hours', date: 'Oct 12, 2024', description: 'The science laboratory will remain open until 6 PM on weekdays.' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar navigation */}
      <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>SmartResults</h1>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<GraduationCap size={20} />} label="Results" />
          <NavItem icon={<Calendar size={20} />} label="Attendance" />
          <NavItem icon={<FileText size={20} />} label="Reports" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
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
        <header style={{ height: '80px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', position: 'sticky', top: 0, zIndex: 10 }}>
          <h2 style={{ fontSize: '1.25rem' }}>Student Dashboard</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={22} color="var(--text-secondary)" />
              <span style={{ position: 'absolute', top: -5, right: -5, width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Alex Thomson</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: #2024098</p>
              </div>
              <div style={{ width: '45px', height: '45px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="var(--text-secondary)" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div style={{ padding: '3rem' }}>
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
                  <h3>Academic Progress</h3>
                  <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Download size={16} />
                    Download Report
                  </button>
                </div>
                <div style={{ height: '300px' }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Subject Results Table section */}
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Subject-wise Results</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Subject</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Marks</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Grade</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1.25rem 1rem', fontWeight: 500 }}>{row.subject}</td>
                          <td style={{ padding: '1.25rem 1rem' }}>{row.marks} / {row.total}</td>
                          <td style={{ padding: '1.25rem 1rem' }}><span style={{ padding: '0.25rem 0.75rem', background: '#f1f5f9', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 600 }}>{row.grade}</span></td>
                          <td style={{ padding: '1.25rem 1rem' }}>
                            <div style={{ width: '100%', maxWidth: '120px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${row.marks}%`, height: '100%', background: 'var(--primary)' }}></div>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Recent Updates</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {announcements.map((ann, i) => (
                    <div key={i} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{ann.date}</p>
                      <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{ann.title}</h4>
                      <p style={{ fontSize: '0.875rem' }}>{ann.description}</p>
                    </div>
                  ))}
                  <button style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}>View All Announcements →</button>
                </div>
              </div>

              {/* Status Alert section */}
              <div className="card" style={{ background: '#2563eb', color: '#fff', border: 'none' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={24} />
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Fees Pending</h4>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1rem' }}>Your current semester fee is overdue. Please complete the payment to see final grades.</p>
                    <button style={{ background: '#fff', color: '#2563eb', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Pay Now</button>
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
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active }) => (
  <button style={{ 
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

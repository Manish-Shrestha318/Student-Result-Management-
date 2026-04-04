import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Calendar, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell, 
  User, 
  Download,
  AlertCircle,
  Clock,
  ExternalLink,
  Mail
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Performance chart data for the child
  const performanceData = {
    labels: ['Term 1', 'Term 2', 'Term 3', 'Pre-Finals', 'Final Exams'],
    datasets: [
      {
        label: 'Average Score (%)',
        data: [72, 78, 85, 82, 89],
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

  const overviewStats = [
    { label: 'Latest Exam Grade', value: 'B+', icon: TrendingUp, color: '#2563eb' },
    { label: 'Child Attendance', value: '92%', icon: Calendar, color: '#0ea5e9' },
    { label: 'Overall Rank', value: '#5', icon: User, color: '#8b5cf6' },
  ];

  const subjects = [
    { name: 'Physics', marks: 85, grade: 'A', status: 'Passed' },
    { name: 'Chemistry', marks: 78, grade: 'B+', status: 'Passed' },
    { name: 'Mathematics', marks: 92, grade: 'A+', status: 'Passed' },
    { name: 'English Literature', marks: 88, grade: 'A', status: 'Passed' },
  ];

  const paymentHistory = [
    { date: 'Oct 05, 2024', description: 'Academic Fee - Term 2', amount: '1,200', status: 'Success' },
    { date: 'Sep 12, 2024', description: 'Transport Fee - September', amount: '150', status: 'Success' },
    { date: 'Aug 20, 2024', description: 'Exam Fee - Quarterly', amount: '300', status: 'Success' },
  ];

  const messages = [
    { from: 'Mr. David (Maths Teacher)', preview: 'Good progress in algebra during last...', time: '1h ago', read: false },
    { from: 'Office Administration', preview: 'Reminder: The school council meet...', time: 'Yesterday', read: true },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Parent Sidebar Navigation */}
      <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>SmartResults</h1>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<TrendingUp size={20} />} label="Child Performance" />
          <NavItem icon={<Calendar size={20} />} label="Attendance" />
          <NavItem icon={<FileText size={20} />} label="Reports" />
          <NavItem icon={<CreditCard size={20} />} label="Fee Payment" />
          <NavItem icon={<MessageSquare size={20} />} label="Messages" />
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
        <header style={{ height: '80px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Child's Academic Overview</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Currently Viewing: <strong>John Doe (Grade 10-A)</strong></p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={22} color="var(--text-secondary)" />
              <span style={{ position: 'absolute', top: -5, right: -5, width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Mr. Robert Doe</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Parent Account</p>
              </div>
              <div style={{ width: '45px', height: '45px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="var(--text-secondary)" />
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
            {overviewStats.map((stat, i) => (
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
              {/* Performance Visualization section */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3>Academic Performance</h3>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Download size={16} />
                      Full Report
                    </button>
                  </div>
                </div>
                <div style={{ height: '300px' }}>
                  <Line data={performanceData} options={chartOptions} />
                </div>
              </div>

              {/* Fee Management section */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ margin: 0 }}>Fee Payment Status</h3>
                  <button className="btn-primary" style={{ width: 'auto', background: '#16a34a' }}>Pay Now</button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Payable</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>$4,500.00</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Paid</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>$3,300.00</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Outstanding</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>$1,200.00</p>
                  </div>
                </div>

                <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Payment History</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Date</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Description</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Amount</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{row.date}</td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>{row.description}</td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem' }}>${row.amount}</td>
                          <td style={{ padding: '1rem' }}><span style={{ padding: '0.25rem 0.5rem', background: '#dcfce7', color: '#16a34a', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{row.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Child Subject Results section */}
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Recent Subject Results</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {subjects.map((sub, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>{sub.grade}</div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '1rem' }}>{sub.name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Class Performance: Top 15%</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{sub.marks}%</p>
                        <p style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>{sub.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Message Panel section */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Mail size={20} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Teacher Feedback</h3>
                  </div>
                  <button style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}><ExternalLink size={18}/></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ padding: '1rem', borderRadius: '10px', background: msg.read ? '#fff' : '#f0f7ff', border: msg.read ? '1px solid var(--border-color)' : '1px solid #bfdbfe', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <h5 style={{ margin: 0, fontSize: '0.9rem' }}>{msg.from}</h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{msg.time}</p>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.preview}</p>
                    </div>
                  ))}
                  <button className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem' }}>Message Teacher</button>
                </div>
              </div>

              {/* School Updates section */}
              <div className="card">
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>School Announcements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertCircle size={20} color="#d97706" />
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>School Trip Postponed</h5>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>The visit to Planetarium is rescheduled to next Wednesday.</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>2 hours ago</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={20} color="#7c3aed" />
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Parent-Teacher Meeting</h5>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Book your slot for the upcoming PTA meeting on Friday.</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Yesterday</p>
                    </div>
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

// Nav Item Component
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

export default ParentDashboard;

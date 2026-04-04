import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Edit3, 
  FileBarChart, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell, 
  User, 
  Plus,
  ExternalLink,
  Search,
  MoreVertical,
  Layers,
  TrendingUp,
  AlertCircle
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
import { Bar } from 'react-chartjs-2';
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

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Class performance comparison data
  const classPerformanceData = {
    labels: ['Class 10-A', 'Class 10-B', 'Class 9-C', 'Class 11-A', 'Class 8-B'],
    datasets: [
      {
        label: 'Average Score (%)',
        data: [82, 75, 88, 79, 84],
        backgroundColor: '#2563eb',
        borderRadius: 6,
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

  const teacherStats = [
    { label: 'Assigned Classes', value: '5', icon: Layers, color: '#2563eb' },
    { label: 'Total Students', value: '164', icon: Users, color: '#0ea5e9' },
    { label: 'Subjects Handled', value: '3', icon: BookOpen, color: '#8b5cf6' },
  ];

  const students = [
    { id: '101', name: 'Sophia Miller', class: '10-A', email: 'sophia@email.com', attendance: '98%', performance: 'A' },
    { id: '102', name: 'James Wilson', class: '10-A', email: 'james@email.com', attendance: '92%', performance: 'B+' },
    { id: '103', name: 'Olivia Brown', class: '10-A', email: 'olivia@email.com', attendance: '95%', performance: 'A-' },
    { id: '104', name: 'William Jones', class: '10-A', email: 'will@email.com', attendance: '88%', performance: 'B' },
  ];

  const messages = [
    { from: 'Mrs. Davis (Parent)', subject: 'About Term Exam marks...', time: '15m ago', unread: true },
    { from: 'Student: Alex Thomson', subject: 'Submission query for Unit 3...', time: '2h ago', unread: false },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Teacher Sidebar Navigation */}
      <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>SmartResults</h1>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Layers size={20} />} label="Classes" />
          <NavItem icon={<Users size={20} />} label="Students" />
          <NavItem icon={<Edit3 size={20} />} label="Mark Entry" />
          <NavItem icon={<FileBarChart size={20} />} label="Reports" />
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
          <h2 style={{ fontSize: '1.25rem' }}>Teacher Dashboard</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={22} color="var(--text-secondary)" />
              <span style={{ position: 'absolute', top: -5, right: -5, width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Prof. Sarah Parker</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Senior Faculty</p>
              </div>
              <div style={{ width: '45px', height: '45px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="var(--text-secondary)" />
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: '3rem' }}>
          {/* Action Header section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Welcome back, Sarah!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>You have 2 new messages and 15 pending mark entries.</p>
            </div>
            <button className="btn-primary" style={{ width: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Edit3 size={18} />
              Enter Marks
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
            {teacherStats.map((stat, i) => (
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
              {/* Student Management Table section */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>Recent Students (Class 10-A)</h3>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={16} />
                    <input type="text" placeholder="Search student..." style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Student Name</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Attendance</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Performance</th>
                        <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{student.name}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {student.id}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>{student.attendance}</td>
                          <td style={{ padding: '1rem' }}><span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', backgroundColor: '#eef2ff', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>{student.performance}</span></td>
                          <td style={{ padding: '1rem' }}>
                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><MoreVertical size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginTop: '1.5rem', width: '100%', textAlign: 'center' }}>View All Students →</button>
              </div>

              {/* Class Trend Visual section */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3>Class Performance Trends</h3>
                  <select style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem', outline: 'none' }}>
                    <option>Weekly View</option>
                    <option>Monthly View</option>
                    <option>Term View</option>
                  </select>
                </div>
                <div style={{ height: '280px' }}>
                  <Bar data={classPerformanceData} options={chartOptions} />
                </div>
              </div>
            </div>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Quick Communication panel */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MessageSquare size={20} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Recent Messages</h3>
                  </div>
                  <button style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Plus size={20}/></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ padding: '1rem', borderRadius: '10px', background: msg.unread ? '#f0f7ff' : '#fff', border: msg.unread ? '1px solid #bfdbfe' : '1px solid var(--border-color)', position: 'relative' }}>
                      {msg.unread && <span style={{ position: 'absolute', right: '10px', top: '10px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>}
                      <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{msg.from}</h5>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.subject}</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{msg.time}</p>
                    </div>
                  ))}
                  <button className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem' }}>Open Inbox</button>
                </div>
              </div>

              {/* Performance Summaries section */}
              <div className="card">
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Performance Insights</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <TrendingUp size={20} color="#16a34a" />
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Maths Improvement</h5>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Class 10-A showed a 12% increase in algebra scores this week.</p>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertCircle size={20} color="#e11d48" />
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Low Attendance Alert</h5>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>5 students from Class 10-B have missed more than 3 classes this term.</p>
                    </div>
                  </div>
                </div>
                <button style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginTop: '1.5rem' }}>View Specific Insights <ExternalLink size={14} /></button>
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

export default TeacherDashboard;

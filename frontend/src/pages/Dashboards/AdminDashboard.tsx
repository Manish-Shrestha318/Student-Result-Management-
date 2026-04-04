import React, { useState, useEffect } from 'react';
import { 
  Users,
  UserCheck, 
  GraduationCap, 
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingDown
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
  Legend,
  ArcElement
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // Fetch Stats
      const statsRes = await fetch('/api/dashboard/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      // Fetch Pending Teachers
      const teachersRes = await fetch('/api/users/pending-teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const teachersData = await teachersRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (teachersData.success) {
        setPendingTeachers(teachersData.users);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveTeacher = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/verify-teacher/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Refresh data
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to approve teacher");
      }
    } catch (err) {
      alert("Error approving teacher");
    }
  };

  // System Analytics (User Distribution)
  const userDistributionData = {
    labels: ['Students', 'Teachers', 'Parents', 'Admins'],
    datasets: [
      {
        data: stats ? [stats.totalStudents, stats.totalTeachers, 0, 1] : [0, 0, 0, 0],
        backgroundColor: ['#2563eb', '#0ea5e9', '#8b5cf6', '#64748b'],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  // Performance trends data
  const revenueTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Fee Revenue',
        data: [42, 58, 48, 72, 65, 88],
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
    plugins: { legend: { display: false } }
  };

  const adminStats = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: GraduationCap, color: '#2563eb' },
    { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: Users, color: '#0ea5e9' },
    { label: 'Pending Approvals', value: (stats?.pendingTeacherApprovals || 0).toString(), icon: UserCheck, color: '#f59e0b' },
    { label: 'Total Classes', value: stats?.totalClasses || 0, icon: Layers, color: '#10b981' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Administrator Console" error={error} />

        <div style={{ padding: '2.5rem' }}>
          {/* Dashboard Summary Cards section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {adminStats.map((stat, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: `${stat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.2rem' }}>{stat.label}</p>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Removed System User Base per request */}

              {/* Analytics Summary section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                  <h4 style={{ marginBottom: '1.5rem' }}>User Distribution</h4>
                  <div style={{ height: '200px', position: 'relative' }}>
                    <Doughnut data={userDistributionData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' as const } } }} />
                  </div>
                </div>
                <div className="card">
                  <h4 style={{ marginBottom: '1.5rem' }}>Revenue Trends (k$)</h4>
                  <div style={{ height: '200px' }}>
                    <Line data={revenueTrendData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Specialized Teacher Approval panel section */}
              <div className="card" style={{ border: '1.5px solid #bfdbfe', background: '#f0f9ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <UserCheck size={20} color="var(--primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>New Approvals</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {loading ? (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading...</p>
                  ) : pendingTeachers.length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No pending approvals</p>
                  ) : (
                    pendingTeachers.map((teacher, i) => (
                      <div key={i} style={{ background: '#fff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>{teacher.name}</h5>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                          <p style={{ margin: 0 }}>Email: {teacher.email}</p>
                          <p style={{ margin: 0 }}>Subject: {teacher.subject || 'Not Assigned'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button 
                            onClick={() => handleApproveTeacher(teacher._id)}
                            style={{ flex: 1, background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                          >
                            <CheckCircle2 size={16} /> Approve
                          </button>
                          <button style={{ background: '#fff', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                            <XCircle size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                    View All Requests ({stats?.pendingTeacherApprovals || 0})
                  </button>
                </div>
              </div>

              {/* Maintenance & System Activity logs section */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Activity size={20} color="var(--primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>System Health</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Server Latency</span>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>24ms</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px' }}>
                      <div style={{ width: '15%', height: '100%', background: '#16a34a', borderRadius: '10px' }}></div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>Recent Logs</h5>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <li style={{ display: 'flex', gap: '0.6rem' }}><ArrowUpRight size={14} color="#16a34a" /> Admin added new class section</li>
                      <li style={{ display: 'flex', gap: '0.6rem' }}><TrendingDown size={14} color="#ef4444" /> System detected failed login (IP: 192.1...)</li>
                      <li style={{ display: 'flex', gap: '0.6rem' }}><CheckCircle2 size={14} color="#2563eb" /> Monthly backup completed</li>
                    </ul>
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

export default AdminDashboard;

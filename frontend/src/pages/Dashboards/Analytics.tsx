import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { 
  BarChart3, 
  TrendingUp, 
  User,
  Activity,
  Layers
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  RadialLinearScale,
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [subjectData, setSubjectData] = useState<any>(null);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [uRes, cRes] = await Promise.all([
        fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/classes', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const uData = await uRes.json();
      const cData = await cRes.json();
      
      if (uData.success) setStudents(uData.users.filter((u: any) => u.role === 'student'));
      if (cData.classes) setClasses(cData.classes);
    } catch (err) {
      setError('Failed to load filter options');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchAnalytics = async () => {
    if (!selectedStudent && !selectedClass) {
      alert('Please select a student or class');
      return;
    }

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    
    try {
      if (selectedStudent) {
        const [perfRes, trendRes, subjRes] = await Promise.all([
          fetch(`/api/analytics/student/${selectedStudent}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/analytics/trend/${selectedStudent}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/analytics/subject-analysis/${selectedStudent}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const perf = await perfRes.json();
        const trend = await trendRes.json();
        const subj = await subjRes.json();
        
        if (perf.success) setPerformanceData(perf.data);
        if (trend.success) setTrendData(trend.data);
        if (subj.success) setSubjectData(subj.data);
      } else if (selectedClass) {
        const classRes = await fetch(`/api/analytics/class/${selectedClass}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const classData = await classRes.json();
        if (classData.success) {
          setPerformanceData(classData.data);
          setTrendData(null); // Reset student specific data
          setSubjectData(null);
        }
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Chart Data Preparation
  const barChartData = {
    labels: performanceData?.subjects?.map((s: any) => s.name) || ['Math', 'Science', 'English', 'History'],
    datasets: [
      {
        label: 'Marks Obtained',
        data: performanceData?.subjects?.map((s: any) => s.marks) || [0, 0, 0, 0],
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderRadius: 5,
      },
      {
        label: 'Class Average',
        data: performanceData?.subjects?.map((s: any) => s.avgMarks) || [75, 78, 82, 70],
        backgroundColor: 'rgba(209, 213, 219, 0.5)',
        borderRadius: 5,
      }
    ],
  };

  const lineChartData = {
    labels: trendData?.map((t: any) => t.term) || ['1st Term', '2nd Term', '3rd Term', 'Final'],
    datasets: [
      {
        label: 'Overall Percentage',
        data: trendData?.map((t: any) => t.percentage) || [0, 0, 0, 0],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ],
  };

  const radarChartData = {
    labels: subjectData?.labels || ['Critical Thinking', 'Recall', 'Application', 'Creativity', 'Persistence'],
    datasets: [
      {
        label: 'Student Skillset',
        data: subjectData?.values || [80, 90, 70, 85, 95],
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: '#2563eb',
        pointBackgroundColor: '#2563eb',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8 }
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Performance Analytics" error={error} />

        <div style={{ padding: '2.5rem' }}>
          {/* Header Controls */}
          <div className="card" style={{ marginBottom: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>Filter by Student</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <select 
                  value={selectedStudent} 
                  onChange={(e) => { setSelectedStudent(e.target.value); setSelectedClass(''); }}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#f8fafc' }}
                >
                  <option value="">Select Student...</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>Or Filter by Class</label>
              <div style={{ position: 'relative' }}>
                <Layers size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <select 
                  value={selectedClass} 
                  onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#f8fafc' }}
                >
                  <option value="">Select Class...</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={fetchAnalytics}
              disabled={loading}
              className="btn-primary" 
              style={{ padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <Activity size={18} /> {loading ? 'Analyzing...' : 'Fetch Insights'}
            </button>
          </div>

          {!performanceData && !loading && (
            <div className="card" style={{ height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <BarChart3 size={40} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Data Selected</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>Select a student or class from the filters above to generate comprehensive performance analytics and trends.</p>
            </div>
          )}

          {performanceData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Top Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <MetricCard label="Academic Rank" value="#4" trend="+2" trendUp={true} />
                <MetricCard label="Average Score" value={`${performanceData.avgScore || 84}%`} trend="+5.2%" trendUp={true} />
                <MetricCard label="Attendance" value="96.4%" trend="-0.5%" trendUp={false} />
                <MetricCard label="Credits" value="32/32" trend="stable" trendUp={true} />
              </div>

              {/* Charts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0 }}>Subject-wise Performance</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Term: Final 2025</div>
                  </div>
                  <div style={{ height: '350px' }}>
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: '2rem' }}>Learning Profile</h3>
                  <div style={{ height: '350px' }}>
                    <Radar 
                      data={radarChartData} 
                      options={{ 
                        maintainAspectRatio: false, 
                        scales: { r: { beginAtZero: true, max: 100 } },
                        plugins: { legend: { display: false } }
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0 }}>Performance Trend</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#16a34a' }}><TrendingUp size={16}/> Improving</span>
                    </div>
                 </div>
                 <div style={{ height: '300px' }}>
                    <Line data={lineChartData} options={chartOptions} />
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string, trend: string, trendUp: boolean }> = ({ label, value, trend, trendUp }) => (
  <div className="card">
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>{label}</p>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
      <h3 style={{ fontSize: '1.75rem', margin: 0 }}>{value}</h3>
      <div style={{ 
        fontSize: '0.75rem', 
        fontWeight: 600, 
        color: trend === 'stable' ? 'var(--text-secondary)' : trendUp ? '#16a34a' : '#dc2626',
        display: 'flex',
        alignItems: 'center',
        gap: '0.2rem',
        marginBottom: '0.3rem'
      }}>
        {trend !== 'stable' && (trendUp ? <TrendingUp size={14} /> : <Activity size={14} />)}
        {trend}
      </div>
    </div>
  </div>
);

export default Analytics;

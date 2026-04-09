import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TeacherSidebar from '../../components/TeacherSidebar';
import AdminHeader from '../../components/AdminHeader';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

const TeacherDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const statsRes = await fetch('/api/dashboard/teacher', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      const noticesRes = await fetch('/api/notices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const noticesData = await noticesRes.json();

      if (statsData.success) setDashboardStats(statsData);
      if (noticesData.success) setNotices(Array.isArray(noticesData.data) ? noticesData.data.slice(0, 3) : []);
    } catch (err) {
      console.error("Dashboard Sync Fail:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: dashboardStats?.classPerformanceData?.labels || [],
    datasets: [
      {
        label: 'Mean Class Performance (%)',
        data: dashboardStats?.classPerformanceData?.datasets[0]?.data || [],
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        borderColor: '#2563eb',
        borderWidth: 2.5,
        borderRadius: 10,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1e293b',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 10,
            displayColors: false
        }
    },
    scales: {
      y: { 
          beginAtZero: true, 
          max: 100, 
          border: { display: false }, 
          grid: { color: '#f1f5f9' }, 
          ticks: { font: { size: 11, weight: '600' }, color: '#64748b' } 
      },
      x: { 
          grid: { display: false }, 
          ticks: { font: { size: 11, weight: '600' }, color: '#64748b' } 
      }
    }
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <TeacherSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Faculty Control" error={null} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Personnel Context ── */}
          <div className="mb-5 d-flex justify-content-between align-items-end">
              <div>
                <h3 className="fw-bold text-dark mb-1 lh-1">Welcome back, {user?.name || 'Teacher'}</h3>
                <p className="text-secondary small mb-0 fw-medium ls-1 opacity-75 uppercase">TEACHER PORTAL | {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
              <Button variant="white" onClick={fetchDashboardData} className="border shadow-sm rounded-pill px-4 py-2 smallest fw-bold ls-1 text-uppercase bg-white">
                REFRESH DATA
              </Button>
          </div>

          {/* ── Key Faculty Metrics ── */}
          <Row className="g-4 mb-5">
            {[
              { label: 'Classes Taught', value: dashboardStats?.stats?.assignedClasses || '0' },
              { label: 'Active Students', value: dashboardStats?.stats?.totalStudents || '0' },
              { label: 'Subjects Handled', value: dashboardStats?.stats?.subjectsHandled || '0' },
              { label: 'Exam Reports', value: '4 Active' },
            ].map((stat, i) => (
              <Col key={i} sm={6} xl={3}>
                <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
                  <Card.Body className="p-4">
                    <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1 opacity-50">{stat.label}</span>
                    <h2 className="fw-bold text-dark mb-0 ls-1">{loading ? '...' : stat.value}</h2>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            <Col xl={8}>
              {/* ── Classroom Performance ── */}
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white shadow-sm h-100">
                <div className="d-flex justify-content-between align-items-center mb-5 border-start border-4 border-primary ps-3">
                   <div>
                      <h5 className="fw-bold text-dark mb-0 smallest text-uppercase ls-1">Class Statistics</h5>
                      <span className="smallest text-muted fw-bold">Comparative analysis across assigned class groups.</span>
                   </div>
                </div>
                <div className="rounded-4 p-1" style={{ height: '400px' }}>
                  {loading ? (
                     <div className="h-100 d-flex align-items-center justify-content-center text-muted fw-bold smallest italic ls-1 uppercase opacity-50 border border-dashed rounded-4">Syncing analytics...</div>
                  ) : chartData.labels.length > 0 ? (
                    <Bar data={chartData} options={chartOptions} />
                  ) : (
                    <div className="h-100 d-flex align-items-center justify-content-center text-muted fw-bold smallest italic ls-1 uppercase opacity-50 border border-dashed rounded-4">No data available for your classes.</div>
                  )}
                </div>
              </Card>
            </Col>

            <Col xl={4}>
              <div className="d-flex flex-column gap-4 h-100 pb-5">
                {/* ── Teacher Advisories ── */}
                <Card className="border-0 shadow-sm rounded-4 p-4 flex-grow-1 bg-white">
                  <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 border-light-dark">
                      <h6 className="fw-bold text-dark mb-0 text-uppercase smallest ls-1">Notices</h6>
                      <Button variant="link" className="text-primary p-0 text-decoration-none fw-bold smallest text-uppercase ls-1">VIEW ALL</Button>
                  </div>
                  <div className="d-flex flex-column gap-3">
                     {loading ? (
                        <div className="py-4 text-center text-muted smallest fw-bold uppercase opacity-50 ls-1">Syncing notices...</div>
                     ) : notices.length === 0 ? (
                        <div className="py-4 text-center text-muted smallest fw-bold uppercase opacity-50 border border-dashed rounded-4 ls-1">No active notices</div>
                     ) : (
                        notices.map((item, idx) => (
                           <div key={idx} className="p-3 rounded-4 bg-light-soft d-flex justify-content-between align-items-center border border-light">
                              <span className="smallest fw-bold text-dark text-uppercase ls-1 text-truncate pe-2">{item.title}</span>
                              <span className="smallest text-muted fw-bold">{new Date(item.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                           </div>
                        ))
                     )}
                  </div>
                </Card>

                {/* ── Faculty Tasks ── */}
                <Card className="border-0 shadow-sm rounded-4 p-4 bg-white flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 border-light-dark">
                      <h6 className="fw-bold text-dark mb-0 text-uppercase smallest ls-1">Pending Syncs</h6>
                  </div>
                  <div className="d-flex flex-column gap-3">
                    {[
                      { type: 'Exam', msg: 'Update Grade 10 Math results.', status: 'Priority' },
                      { type: 'Attendance', msg: 'Verify session sync for 9B.', status: 'Pending' },
                    ].map((task, idx) => (
                      <div key={idx} className="p-3 bg-white border border-light-dark rounded-4 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <div className="smallest fw-bold text-dark text-uppercase ls-1">{task.type}</div>
                            <span className={`smallest fw-bold ${task.status === 'Priority' ? 'text-danger' : 'text-warning'} uppercase ls-1`}>{task.status}</span>
                        </div>
                        <p className="smallest text-secondary mb-0 text-truncate fw-medium">{task.msg}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;

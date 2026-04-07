import React, { useState, useEffect } from 'react';
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
import { Doughnut } from 'react-chartjs-2';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';

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
      const statsRes = await fetch('/api/dashboard/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
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
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to approve teacher");
      }
    } catch (err) {
      alert("Error approving teacher");
    }
  };

  const userDistributionData = {
    labels: ['STUDENTS', 'TEACHERS', 'PARENTS', 'ADMINS'],
    datasets: [
      {
        data: stats ? [stats.totalStudents, stats.totalTeachers, 12, 4] : [0, 0, 0, 0],
        backgroundColor: ['rgba(37, 99, 235, 0.8)', 'rgba(14, 165, 233, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(148, 163, 184, 0.8)'],
        borderColor: ['#fff'],
        borderWidth: 2,
        hoverOffset: 12
      },
    ],
  };

  const adminStats = [
    { label: 'TOTAL STUDENTS', value: stats?.totalStudents || 0, color: 'primary', trend: 'Registered' },
    { label: 'TOTAL TEACHERS', value: stats?.totalTeachers || 0, color: 'info', trend: 'Verified' },
    { label: 'TOTAL PARENTS', value: stats?.totalParents || 12, color: 'purple', trend: 'Linked' },
    { label: 'TOTAL CLASSES', value: stats?.totalClasses || 0, color: 'success', trend: 'Active' },
    { label: 'TOTAL SUBJECTS', value: stats?.totalSubjects || 0, color: 'danger', trend: 'Available' },
    { label: 'PENDING APPROVALS', value: stats?.pendingTeacherApprovals || 0, color: 'warning', trend: 'Action Required' },
  ];

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />

      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Admin Dashboard" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── High-Impact Operational Metrics ── */}
          <Row className="g-3 mb-5">
            {adminStats.map((stat, i) => (
              <Col key={i} sm={6} xl={4}>
                <Card 
                  className="border-0 shadow-sm rounded-4 h-100"
                  style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                >
                  <Card.Body className="p-3">
                    <span className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>{stat.label}</span>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '0.5px' }}>{stat.value}</h3>
                    <div className={`fw-bold text-uppercase text-${stat.color}`} style={{ fontSize: '0.7rem' }}>
                      {stat.trend}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            {/* ── Demographic Distribution Engine ── */}
            <Col xl={8}>
              <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                <div className="d-flex align-items-center justify-content-between mb-5 border-start border-4 border-primary ps-3">
                  <h6 className="fw-bold text-dark mb-0 text-uppercase small ls-1">User Distribution</h6>
                </div>
                <Row className="align-items-center">
                  <Col md={7}>
                    <div style={{ height: '340px', position: 'relative' }}>
                      <Doughnut 
                        data={userDistributionData} 
                        options={{ 
                          maintainAspectRatio: false, 
                          plugins: { legend: { display: false } },
                          cutout: '78%'
                        }} 
                      />
                      <div className="position-absolute top-50 start-50 translate-middle text-center">
                        <div className="display-6 fw-bold mb-0 text-dark ls-1">{(stats?.totalStudents || 0) + (stats?.totalTeachers || 0) + 16}</div>
                        <div className="smallest text-muted fw-bold text-uppercase ls-1">Total Users</div>
                      </div>
                    </div>
                  </Col>
                  <Col md={5} className="mt-4 mt-md-0">
                    <div className="d-flex flex-column gap-3">
                      {userDistributionData.labels.map((label, idx) => (
                        <div key={idx} className="d-flex align-items-center justify-content-between p-3 rounded-4 bg-light border-light-dark border">
                          <div className="d-flex align-items-center gap-2">
                             <div className="rounded-1" style={{ width: '12px', height: '12px', backgroundColor: userDistributionData.datasets[0].backgroundColor[idx] as string }}></div>
                             <span className="smallest fw-bold text-secondary text-uppercase ls-1">{label}</span>
                          </div>
                          <span className="smaller fw-bold text-dark ls-1">{userDistributionData.datasets[0].data[idx]}</span>
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* ── Critical Approval Timeline ── */}
            <Col xl={4}>
              <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-light">
                  <h6 className="fw-bold text-dark mb-0 smallest text-uppercase ls-1">Pending Approvals</h6>
                  <Badge bg="warning-soft" text="warning" className="fw-bold smallest px-3 py-2 rounded-pill border border-warning-soft">{(pendingTeachers.length).toString()} PENDING</Badge>
                </div>
                
                <div className="d-flex flex-grow-1 flex-column gap-3">
                  {loading ? (
                    <div className="text-center py-5">
                       <Spinner animation="border" variant="primary" size="sm" />
                    </div>
                  ) : pendingTeachers.length === 0 ? (
                    <div className="text-center py-5 h-100 d-flex flex-column justify-content-center border border-dashed rounded-4">
                      <h6 className="text-secondary fw-bold smallest text-uppercase ls-1 mb-2">ALL CAUGHT UP</h6>
                      <p className="text-muted smaller mb-0">No pending teacher approvals at the moment.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '420px' }}>
                      {pendingTeachers.map((teacher, i) => (
                        <div key={i} className="p-3 bg-white border border-light-dark rounded-4 shadow-sm">
                          <div className="fw-bold text-dark smaller mb-1 text-truncate ls-1 text-uppercase">{teacher.name}</div>
                          <div className="text-muted smallest fw-semibold mb-3 ls-1 text-lowercase">{teacher.email}</div>
                          <Row className="g-2">
                             <Col>
                                <Button 
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleApproveTeacher(teacher._id)}
                                  className="w-100 fw-bold smallest py-2 rounded-pill ls-1 text-uppercase"
                                >
                                  APPROVE
                                </Button>
                             </Col>
                             <Col xs="auto">
                                <Button variant="outline-danger" size="sm" className="px-3 rounded-pill border-0 smallest fw-bold text-uppercase ls-1">REJECT</Button>
                             </Col>
                          </Row>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

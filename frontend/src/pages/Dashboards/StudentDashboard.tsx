import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Spinner, Table } from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import AdminHeader from '../../components/AdminHeader';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
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
      const [resultsRes, attendanceRes, trendsRes, noticesRes] = await Promise.all([
        fetch(`/api/academics/marks/marks/student/${user._id}`, { headers }),
        fetch(`/api/academics/attendance/student/${user._id}`, { headers }),
        fetch(`/api/academics/marks/trends/${user._id}`, { headers }),
        fetch('/api/notices', { headers })
      ]);

      const [resultsData, attendanceData, trendsData, noticesData] = await Promise.all([
        resultsRes.json(),
        attendanceRes.json(),
        trendsRes.json(),
        noticesRes.json()
      ]);

      if (resultsData.success) setResults(resultsData.data);
      if (attendanceData.success) setAttendance(attendanceData.data);
      if (trendsData.success) setTrends(trendsData.data);
      if (noticesData.success) {
        setAnnouncements(Array.isArray(noticesData.data) ? noticesData.data.slice(0, 3) : []);
      }

    } catch (err) {
      setError("Failed to synchronize academic telemetry.");
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
      alert("Failed to generate report card directive.");
    }
  };


  const chartData = {
    labels: trends.length > 0 ? trends.map(t => t.term) : ['Term 1', 'Term 2', 'Final'],
    datasets: [
      {
        label: 'Success Delta (%)',
        data: trends.length > 0 ? trends.map(t => parseFloat(t.percentage)) : [0, 0, 0],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        tension: 0.35,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { padding: 12, cornerRadius: 8 }
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10, weight: 'bold' as const } } },
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' as const } } }
    }
  };

  const averageMarksValue = results.length > 0 ? (results.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0) / results.reduce((acc, curr) => acc + (curr.totalMarks || 100), 0) * 100).toFixed(1) : '0';
  const attendancePercentage = Array.isArray(attendance) && attendance.length > 0 ? ((attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100).toFixed(1) : '0';

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      {/* ── Scholar Console ── */}
      <aside className="d-flex flex-column bg-white border-end p-4 shadow-sm" style={{ width: '280px', zIndex: 10 }}>
        <div className="mb-5 px-3">
          <h4 className="fw-bold text-primary ls-1 mb-0">SMARTRESULTS</h4>
          <span className="smallest text-muted fw-bold text-uppercase ls-1">Student</span>
        </div>
        
        <nav className="nav flex-column gap-1 flex-grow-1 overflow-auto custom-scrollbar">
          <Link to="/dashboard/student" className="nav-link bg-primary text-white rounded-pill py-3 px-4 fw-bold shadow-sm mb-1">
             <span className="ls-1 text-uppercase smallest">Dashboard</span>
          </Link>
          <Link to="/dashboard/student/results" className="nav-link text-secondary fw-semibold hover-bg-light rounded-pill py-3 px-4 mb-1">
             <span className="ls-1 text-uppercase smallest">Results</span>
          </Link>
          <Link to="/dashboard/student/attendance" className="nav-link text-secondary fw-semibold hover-bg-light rounded-pill py-3 px-4 mb-1">
             <span className="ls-1 text-uppercase smallest">Attendance</span>
          </Link>
          <Link to="/dashboard/student/notices" className="nav-link text-secondary fw-semibold hover-bg-light rounded-pill py-3 px-4 mb-1">
             <span className="ls-1 text-uppercase smallest">Notices</span>
          </Link>
        </nav>
      </aside>

      {/* ── Primary Terminal ── */}
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Student Dashboard" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Status Header ── */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">Welcome: {user?.name || 'Student'}</h3>
              <p className="text-secondary small mb-0 fw-medium">Status: Logged In | Grade {user?.class || 'N/A'}</p>
            </div>
            <Button variant="primary" className="fw-bold px-5 py-2 rounded-pill shadow-sm ls-1 smallest text-uppercase" onClick={handleDownloadReport}>
               DOWNLOAD REPORT
            </Button>
          </div>

          {/* ── Analytical Scorecards ── */}
          <Row className="g-4 mb-5">
            {[
              { label: 'STATUS TREND', value: `${averageMarksValue}%`, color: 'primary' },
              { label: 'ATTENDANCE RATIO', value: `${attendancePercentage}%`, color: 'info' },
              { label: 'ACTIVE MODULES', value: results.length, color: 'success' },
              { label: 'IDENTITY STATE', value: 'VERIFIED', color: 'dark' },
            ].map((stat, i) => (
              <Col key={i} sm={6} xl={3}>
                <Card className={`border-0 shadow-sm rounded-4 h-100 border-start border-5 border-${stat.color}`}>
                  <Card.Body className="p-4">
                    <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1">{stat.label}</span>
                    <h3 className="fw-bold text-dark mb-0 ls-1">{stat.value}</h3>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            <Col xl={8}>
               {/* ── Success Pipeline ── */}
               <Card className="border-0 shadow-sm rounded-4 p-4 mb-4 border-bottom border-4 border-primary">
                  <div className="d-flex align-items-center justify-content-between mb-4 border-start border-4 border-primary ps-3">
                     <h6 className="fw-bold text-dark mb-0 text-uppercase smallest ls-2">Term Progress</h6>
                     <Badge bg="primary-soft" text="primary" className="fw-bold smallest px-3 py-2 rounded-pill border border-primary-soft">IMPROVING</Badge>
                  </div>
                  <div style={{ height: '340px' }}>
                     <Line data={chartData} options={chartOptions} />
                  </div>
               </Card>

               {/* ── Subject Evaluations ── */}
               <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                  <div className="card-header bg-white border-bottom p-4">
                     <h5 className="fw-bold mb-0 text-dark smallest text-uppercase ls-1">Subject Results</h5>
                  </div>
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0 smallest fw-medium">
                      <thead className="bg-light-soft border-bottom">
                        <tr>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Subject</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Exam Type</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Marks</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-end">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.length === 0 ? (
                          <tr><td colSpan={4} className="px-4 py-5 text-center text-muted fw-bold italic opacity-50 uppercase ls-1">No results available yet.</td></tr>
                        ) : (
                          results.map((row, i) => (
                            <tr key={i} className="border-bottom border-light">
                              <td className="px-4 py-3 fw-bold text-dark text-uppercase">{row.subjectId?.name || 'Subject'}</td>
                              <td className="px-4 py-3 text-secondary text-uppercase smallest fw-bold ls-1">{row.examType}</td>
                              <td className="px-4 py-3 text-center fw-bold ls-1">{row.marksObtained} / {row.totalMarks}</td>
                              <td className="px-4 py-3 text-end">
                                <Badge bg={['A', 'B', 'PASS'].includes(row.grade) ? 'success-soft' : 'danger-soft'} text={['A', 'B', 'PASS'].includes(row.grade) ? 'success' : 'danger'} className="fw-bold smallest px-3 py-2 rounded-pill border">
                                  {row.grade || 'N/A'}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card>
            </Col>

            <Col xl={4}>
               <div className="d-flex flex-column gap-4 pb-5">
                  {/* ── Institutional Directives ── */}
                  <Card className="border-0 shadow-sm rounded-4 p-4">
                     <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 border-light-dark">
                         <h6 className="fw-bold text-dark mb-0 text-uppercase smallest ls-2">Notices</h6>
                         <Link to="/dashboard/student/notices" className="text-primary text-decoration-none fw-bold smallest text-uppercase ls-1">VIEW ALL</Link>
                     </div>
                     <div className="d-flex flex-column gap-3">
                        {loading ? (
                           <div className="py-5 text-center"><Spinner animation="border" variant="primary" size="sm" /></div>
                        ) : announcements.length === 0 ? (
                            <div className="py-5 text-center text-muted smallest fw-bold ls-2 opacity-50 uppercase border border-dashed rounded-4">No notices yet</div>
                        ) : (
                           announcements.map((notice, i) => (
                              <div key={i} className="p-3 bg-light-soft rounded-4 border border-light-dark transition-all last-mb-0">
                                 <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="smallest fw-bold text-dark mb-0 ls-1 text-uppercase">{notice.title}</h6>
                                    <span className="smallest text-muted fw-bold ls-1 text-uppercase opacity-50">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                 </div>
                                 <p className="smallest text-secondary fw-medium mb-0 lh-base text-truncate">{notice.content}</p>
                              </div>
                           ))
                        )}
                     </div>
                  </Card>

                  {/* ── Operational Directives ── */}
                  <Card className="border-0 shadow-sm rounded-4 p-4 bg-dark text-white">
                     <h6 className="fw-bold text-uppercase smallest ls-2 mb-4 border-bottom border-secondary border-opacity-25 pb-3">Quick Links</h6>
                     <div className="d-flex flex-column gap-3">
                         <Button onClick={() => navigate('/dashboard/student/results')} variant="outline-light" className="text-start border-light border-opacity-25 py-3 px-4 rounded-4 shadow-none smallest fw-bold text-uppercase ls-1 transition-all hover-bg-white hover-text-dark">View Results</Button>
                         <Button onClick={() => navigate('/dashboard/student/attendance')} variant="outline-light" className="text-start border-light border-opacity-25 py-3 px-4 rounded-4 shadow-none smallest fw-bold text-uppercase ls-1 transition-all hover-bg-white hover-text-dark">View Attendance</Button>
                         <Button variant="outline-light" className="text-start border-light border-opacity-25 py-3 px-4 rounded-4 shadow-none smallest fw-bold text-uppercase ls-1 transition-all hover-bg-white hover-text-dark">Help & Support</Button>
                     </div>
                  </Card>

                  {/* ── Standing Insights ── */}
                  <Card className="border-0 shadow-sm rounded-4 p-4 border-end border-4 border-info">
                     <h6 className="fw-bold text-dark mb-4 border-bottom pb-3 border-light-dark smallest text-uppercase ls-2">Academic Status</h6>
                     <div className="p-3 bg-light-soft rounded-4 border border-light-dark">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                           <span className="smallest fw-bold text-secondary text-uppercase ls-1">STATUS TREND</span>
                            <Badge bg="success-soft" text="success" className="fw-bold smallest border border-success-soft">GOOD</Badge>
                         </div>
                         <p className="smallest text-secondary fw-medium mb-0 lh-base">You are doing well. Keep up the good work and stay consistent with your studies.</p>
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

export default StudentDashboard;

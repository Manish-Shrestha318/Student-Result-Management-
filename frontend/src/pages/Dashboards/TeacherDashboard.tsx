import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Table, Button, Form, Badge, InputGroup } from 'react-bootstrap';
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
import AdminHeader from '../../components/AdminHeader';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    assignedClasses: 0,
    totalStudents: 0,
    subjectsHandled: 0,
  });
  
  const [students, setStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [classPerformanceData, setClassPerformanceData] = useState<any>({
    labels: [],
    datasets: []
  });

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


  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const [dashboardRes, noticesRes] = await Promise.all([
          fetch('/api/dashboard/teacher', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/notices', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const data = await dashboardRes.json();
        const noticesData = await noticesRes.json();
        
        if (data.success) {
          setStats(data.stats);
          setStudents(data.students || []);
          setMessages(data.messages || []);
          if (data.classPerformanceData && data.classPerformanceData.labels.length > 0) {
            setClassPerformanceData(data.classPerformanceData);
          }
        } else {
          setError(data.message || 'Failed to load dashboard data');
        }

        if (noticesData.success && noticesData.data) {
          setAnnouncements(Array.isArray(noticesData.data) ? noticesData.data.slice(0, 3) : []);
        }

      } catch (err) {
        setError('Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      {/* ── Teacher Sidebar ── */}
      <aside className="d-flex flex-column bg-white border-end p-4 shadow-sm" style={{ width: '280px', zIndex: 10 }}>
        <div className="mb-5 px-3">
          <h4 className="fw-bold text-primary ls-1 mb-0">SMARTRESULTS</h4>
          <span className="smallest text-muted fw-bold text-uppercase ls-1">Teacher</span>
        </div>
        
        <nav className="nav flex-column gap-1 flex-grow-1 overflow-auto custom-scrollbar">
          <NavItem label="Dashboard" active />
          <NavItem label="Classes" />
          <NavItem label="Students" />
          <NavItem label="Results" />
          <NavItem label="Stats" />
          <NavItem label="Messages" />
        </nav>
      </aside>

      {/* ── Teacher Main ── */}
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Teacher Dashboard" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Status Header ── */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">Welcome: {userData.name || 'Teacher'}</h3>
              <p className="text-secondary small mb-0 fw-medium">Status: Logged In | {messages.length} new messages.</p>
            </div>
            <Button variant="primary" className="fw-bold px-4 py-2 rounded-pill shadow-sm ls-1 smallest text-uppercase">
               GO TO RESULTS
            </Button>
          </div>

          {/* ── Key Metrics ── */}
          <Row className="g-4 mb-5">
            {[
               { label: 'CLASSES', value: stats.assignedClasses, color: 'primary' },
               { label: 'STUDENTS', value: stats.totalStudents, color: 'info' },
               { label: 'SUBJECTS', value: stats.subjectsHandled, color: 'success' },
            ].map((stat, i) => (
              <Col key={i} md={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-4">
                    <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-2">{stat.label}</span>
                    <h2 className="display-5 fw-bold text-dark mb-0 ls-1">{stat.value}</h2>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            <Col xl={8}>
              {/* ── Student List ── */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <Card.Header className="bg-white border-0 p-4 pb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold text-dark mb-0 text-uppercase smallest ls-1">My Students</h5>
                    <InputGroup className="w-auto shadow-none">
                      <Form.Control 
                        placeholder="Search..." 
                        className="py-1 smaller border-light-dark shadow-none fw-medium" 
                        style={{ width: '220px' }}
                      />
                    </InputGroup>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="bg-light-soft border-bottom border-light-dark">
                        <tr>
                           <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Name</th>
                          <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary text-center">Attendance</th>
                          <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary text-center">Performance</th>
                          <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                           <tr><td colSpan={4} className="py-5 text-center text-muted fw-bold small italic">Loading students...</td></tr>
                        ) : students.length === 0 ? (
                           <tr><td colSpan={4} className="py-5 text-center text-muted small fw-medium">No students found.</td></tr>
                        ) : (
                          students.map((student: any, i: number) => (
                            <tr key={i}>
                                <td className="px-4 py-3">
                                  <div className="d-flex flex-column">
                                    <span className="fw-bold text-dark smallest text-uppercase ls-1">{student.name}</span>
                                    <span className="smallest text-muted fw-bold text-lowercase">{student.email}</span>
                                    <Badge bg="light" text="primary" className="mt-2 border fw-bold smallest text-start d-inline-block ls-1" style={{ width: 'fit-content' }}>
                                      CHRT: {student.class} | ID: {student.id}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                   <Badge bg="success-soft" text="success" className="rounded-pill px-3 py-2 smallest fw-bold border text-uppercase">
                                      {student.attendance} %
                                   </Badge>
                                </td>
                                <td className="px-4 py-3 text-center">
                                   <Badge bg="primary-soft" text="primary" className="rounded-pill px-3 py-2 smallest fw-bold border text-uppercase">
                                      {student.performance}
                                   </Badge>
                                </td>
                                <td className="px-4 py-3 text-end">
                                    <Button variant="link" size="sm" className="text-secondary text-decoration-none fw-bold smallest border px-3 rounded-pill ls-1">VIEW</Button>
                                </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                  <div className="p-3 text-center border-top border-light-dark bg-white">
                     <Button variant="link" className="text-primary text-decoration-none fw-bold smallest ls-1 text-uppercase">VIEW ALL STUDENTS &rarr;</Button>
                  </div>
                </Card.Body>
              </Card>

              {/* ── Class Performance ── */}
              <Card className="border-0 shadow-sm rounded-4 p-4 border-bottom border-4 border-primary">
                <div className="d-flex justify-content-between align-items-center mb-4">
                   <h5 className="fw-bold text-dark mb-0 smallest text-uppercase ls-2">CLASS PERFORMANCE</h5>
                  <Form.Select className="w-auto shadow-none border-light-dark smallest fw-bold py-1 text-uppercase">
                     <option>THIS TERM</option>
                    <option>PREVIOUS TERMS</option>
                  </Form.Select>
                </div>
                <div className="bg-light-soft rounded-4 p-3" style={{ height: '340px' }}>
                  {loading ? (
                     <div className="h-100 d-flex align-items-center justify-content-center text-muted fw-bold smallest italic ls-2 uppercase">Loading chart...</div>
                  ) : classPerformanceData.labels.length > 0 ? (
                    <Bar data={classPerformanceData} options={chartOptions} />
                  ) : (
                     <div className="h-100 d-flex align-items-center justify-content-center text-muted smallest fw-bold ls-2 text-uppercase opacity-50 border border-dashed rounded-4">NO DATA TO DISPLAY</div>
                  )}
                </div>
              </Card>
            </Col>

            <Col xl={4}>
              <div className="d-flex flex-column gap-4 pb-5">
                {/* ── Messages ── */}
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 border-light-dark">
                        <h6 className="fw-bold text-dark mb-0 text-uppercase smallest ls-2">MESSAGES</h6>
                        <Button variant="link" className="text-primary p-0 text-decoration-none fw-bold smallest text-uppercase ls-1">VIEW ALL</Button>
                    </div>
                    <div className="d-flex flex-column gap-3">
                      {messages.length === 0 && !loading && (
                         <div className="py-5 text-center text-muted smallest fw-bold italic ls-2 border border-dashed rounded-4 opacity-50 uppercase">NO MESSAGES</div>
                      )}
                      {messages.map((msg: any, i: number) => (
                        <div key={i} className={`p-3 rounded-4 border transition-all cursor-pointer ${msg.unread ? 'border-primary bg-primary-soft bg-opacity-10' : 'border-light-dark bg-light-soft'}`}>
                          <h6 className="fw-bold text-dark mb-1 smallest text-uppercase ls-1">{msg.from}</h6>
                          <p className="smallest text-secondary mb-2 lh-base text-wrap word-break">{msg.subject}</p>
                          <span className="smallest text-muted fw-bold text-uppercase ls-1 opacity-50">{msg.time}</span>
                        </div>
                      ))}
                       <Button variant="primary" className="fw-bold w-100 py-3 rounded-pill shadow-sm smallest ls-1 text-uppercase mt-2">VIEW INBOX</Button>
                    </div>
                  </Card.Body>
                </Card>

                {/* ── Institutional Briefs ── */}
                <Card className="border-0 shadow-sm rounded-4 border-end border-4 border-primary">
                   <Card.Body className="p-4">
                     <h6 className="fw-bold text-dark mb-4 text-uppercase smallest ls-2 border-bottom pb-3 border-light-dark">RECENT NOTICES</h6>
                    <div className="d-flex flex-column gap-4">
                      {announcements.length === 0 ? (
                         <div className="p-5 text-center text-muted smallest fw-bold text-uppercase ls-2 italic opacity-50 border border-dashed rounded-4">NO RECENT NOTICES</div>
                      ) : (
                        announcements.map((ann, i) => (
                          <div key={i} className="border-start border-light-dark ps-3 py-1 last-pb-0">
                             <span className="smallest text-primary fw-bold text-uppercase ls-1 d-block mb-1">{new Date(ann.createdAt).toLocaleDateString()}</span>
                             <h6 className="fw-bold mb-1 smallest text-uppercase ls-1">{ann.title}</h6>
                             <p className="smallest text-secondary mb-0 lh-base">{ann.content.substring(0, 80)}...</p>
                          </div>
                        ))
                      )}
                       <Button variant="link" className="text-primary text-decoration-none fw-bold smallest p-0 text-start ls-1 text-uppercase">VIEW ALL NOTICES &rarr;</Button>
                    </div>
                   </Card.Body>
                </Card>

                {/* ── System Insights ── */}
                <Card className="border-0 shadow-sm rounded-4 bg-dark text-white">
                  <Card.Body className="p-4">
                     <h6 className="fw-bold text-white mb-4 text-uppercase smallest ls-2 border-bottom border-secondary border-opacity-25 pb-3">SUGGESTIONS</h6>
                    <div className="d-flex flex-column gap-4">
                       <div className="p-3 bg-white bg-opacity-10 rounded-4 border-start border-4 border-success">
                           <h6 className="text-white fw-bold mb-1 smallest text-uppercase ls-1">GOOD PROGRESS</h6>
                          <p className="smallest text-white-50 mb-0 lh-base opacity-75">Class 10-A math marks increased by 12.4% during the final term.</p>
                       </div>
                       <div className="p-3 bg-white bg-opacity-10 rounded-4 border-start border-4 border-danger">
                           <h6 className="text-white fw-bold mb-1 smallest text-uppercase ls-1">ATTENTION NEEDED</h6>
                          <p className="smallest text-white-50 mb-0 lh-base opacity-75">Class 10-B: Decreasing performance detected in a small group (5 students).</p>
                       </div>
                    </div>
                     <Button variant="outline-light" className="w-100 fw-bold border-light border-opacity-25 mt-4 smallest py-3 ls-1 rounded-pill text-uppercase shadow-none">VIEW DETAILS</Button>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ label: string, active?: boolean, onClick?: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`btn w-100 text-start py-3 px-4 rounded-pill border-0 transition-all mb-1 ${active ? 'bg-primary text-white fw-bold shadow-sm' : 'bg-transparent text-secondary fw-semibold hover-bg-light'}`} style={{ fontSize: '0.85rem' }}>
    <span className="ls-1 text-uppercase smallest">{label}</span>
  </button>
);

export default TeacherDashboard;


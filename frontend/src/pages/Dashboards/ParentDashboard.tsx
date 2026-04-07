import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
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

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const error = null;

  const performanceData = {
    labels: ['TERM 1', 'TERM 2', 'TERM 3', 'PRE-FINALS', 'FINAL EXAMS'],
    datasets: [
      {
        label: 'Success Metrics (%)',
        data: [72, 78, 85, 82, 89],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 3
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10, weight: 'bold' } } },
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
    }
  };

  const overviewStats = [
    { label: 'GRADE', value: 'B+', variant: 'primary', trend: 'IMPROVING' },
    { label: 'ATTENDANCE', value: '92%', variant: 'info', trend: 'GOOD' },
    { label: 'RANK', value: '#5', variant: 'success', trend: 'TOP 5%' },
  ];

  const subjects = [
    { name: 'PHYSICS', marks: 85, grade: 'A', status: 'PROFICIENT' },
    { name: 'CHEMISTRY', marks: 78, grade: 'B+', status: 'COMPETENT' },
    { name: 'MATHEMATICS', marks: 92, grade: 'A+', status: 'DISTINCTION' },
    { name: 'ENGLISH LITERATURE', marks: 88, grade: 'A', status: 'PROFICIENT' },
  ];

  const paymentHistory = [
    { date: 'OCT 05, 2024', description: 'ACADEMIC FEE - TERM 2', amount: '1,200', status: 'SUCCESS' },
    { date: 'SEP 12, 2024', description: 'TRANSPORT FEE - SEP', amount: '150', status: 'SUCCESS' },
    { date: 'AUG 20, 2024', description: 'EXAM FEE - QUARTERLY', amount: '300', status: 'SUCCESS' },
  ];

  useEffect(() => {
    const fetchNotices = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/api/notices', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data) {
          setAnnouncements(Array.isArray(data.data) ? data.data.slice(0, 3) : []);
        }
      } catch (err) {
        console.error('Failed to fetch notices:', err);
      }
    };
    fetchNotices();
  }, []);


  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      {/* ── Parent Sidebar ── */}
      <aside className="d-flex flex-column bg-white border-end p-4 shadow-sm" style={{ width: '280px', zIndex: 10 }}>
        <div className="mb-5 px-3">
          <h4 className="fw-bold text-primary ls-1 mb-0">SMARTRESULTS</h4>
          <span className="smallest text-muted fw-bold text-uppercase ls-1">Parent</span>
        </div>
        
        <nav className="nav flex-column gap-1 flex-grow-1 overflow-auto custom-scrollbar">
          <NavItem label="Dashboard" active />
          <NavItem label="Results" />
          <NavItem label="Attendance" />
          <NavItem label="Notices" />
          <NavItem label="Fees" />
        </nav>
      </aside>

      {/* ── Parent Main ── */}
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Parent Dashboard" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Overview ── */}
          <Row className="g-4 mb-5">
            {overviewStats.map((stat, i) => (
              <Col key={i} sm={4}>
                <Card className={`border-0 shadow-sm rounded-4 h-100 border-start border-5 border-${stat.variant}`}>
                  <Card.Body className="p-4">
                    <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1">{stat.label}</span>
                    <h3 className="fw-bold text-dark mb-1 ls-1">{stat.value}</h3>
                    <div className={`smallest fw-bold text-uppercase ls-1 text-${stat.variant}`}>{stat.trend}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            <Col lg={8}>
              <div className="d-flex flex-column gap-5">
                {/* ── Progress Chart ── */}
                <Card className="border-0 shadow-sm rounded-4 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-5 border-start border-4 border-primary ps-3">
                    <div>
                      <h6 className="fw-bold text-dark mb-0 text-uppercase small ls-1">Progress</h6>
                      <span className="smallest text-muted fw-bold text-uppercase ls-1">Updated: Now</span>
                    </div>
                    <Button variant="primary" size="sm" className="fw-bold smallest px-4 rounded-pill ls-1 text-uppercase shadow-none">View All</Button>
                  </div>
                  <div style={{ height: '340px' }}>
                    <Line data={performanceData} options={chartOptions} />
                  </div>
                </Card>

                {/* ── Financial Ledger ── */}
                <Card className="border-0 shadow-sm rounded-4 p-4 overflow-hidden">
                  <div className="d-flex justify-content-between align-items-center mb-4 border-start border-4 border-success ps-3">
                    <h6 className="fw-bold text-dark mb-0 text-uppercase small ls-1">Fee Status</h6>
                    <Button variant="success" size="sm" className="fw-bold smallest px-4 rounded-pill ls-1 text-uppercase shadow-none border-0">Pay Fees</Button>
                  </div>
                  
                  <Row className="g-3 mb-5">
                    {[
                      { label: 'TOTAL FEES', value: '$4,500.00', bg: 'light' },
                      { label: 'PAID', value: '$3,300.00', bg: 'success-soft text-success' },
                      { label: 'DUE', value: '$1,200.00', bg: 'danger-soft text-danger' },
                    ].map((m, idx) => (
                      <Col key={idx} md={4}>
                         <div className={`p-4 rounded-4 border border-light-dark text-center h-100 ${m.bg}`}>
                            <span className="smallest fw-bold text-uppercase ls-2 d-block mb-1 opacity-75">{m.label}</span>
                            <div className="smaller fw-bold ls-1">{m.value}</div>
                         </div>
                      </Col>
                    ))}
                  </Row>

                  <h6 className="fw-bold text-dark mb-3 smallest text-uppercase ls-1 opacity-50 px-2">Payment History</h6>
                  <div className="table-responsive">
                    <Table borderless hover className="align-middle mb-0 smallest fw-medium">
                      <thead className="bg-light-soft border-bottom">
                        <tr>
                          <th className="px-3 py-3 text-secondary fw-bold text-uppercase ls-1">Date</th>
                          <th className="px-3 py-3 text-secondary fw-bold text-uppercase ls-1">Description</th>
                          <th className="px-3 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Amount ($)</th>
                          <th className="px-3 py-3 text-secondary fw-bold text-uppercase ls-1 text-end">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((row, i) => (
                          <tr key={i} className="border-bottom border-light">
                            <td className="px-3 py-3 text-muted fw-bold">{row.date}</td>
                            <td className="px-3 py-3 text-dark fw-bold ls-1 text-uppercase smallest">{row.description}</td>
                            <td className="px-3 py-3 text-center fw-bold text-dark ls-1">{row.amount}</td>
                            <td className="px-3 py-3 text-end">
                               <Badge bg="success-soft" text="success" className="fw-bold smallest text-uppercase px-3 py-2 rounded-pill border border-success-soft">{row.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card>

                {/* ── Module Evaluations ── */}
                <Card className="border-0 shadow-sm rounded-4 p-4 mb-5">
                  <h6 className="fw-bold text-dark mb-4 border-start border-4 border-info ps-3 text-uppercase small ls-1">Recent Results</h6>
                  <div className="d-flex flex-column gap-3">
                    {subjects.map((sub, i) => (
                      <div key={i} className="p-3 bg-white border border-light-dark rounded-4 d-flex align-items-center justify-content-between shadow-sm transition-all hover-translate-y">
                        <div className="d-flex align-items-center gap-4">
                           <div className="bg-primary text-white rounded-3 fw-bold d-flex align-items-center justify-content-center ls-1" style={{ width: '52px', height: '52px', fontSize: '1.2rem' }}>{sub.grade}</div>
                           <div>
                              <h6 className="fw-bold text-dark mb-1 ls-1 text-uppercase smallest">{sub.name}</h6>
                              <span className="smallest text-muted fw-bold text-uppercase ls-1">Top 15%</span>
                           </div>
                        </div>
                        <div className="text-end px-3">
                           <div className="smaller fw-bold text-dark ls-1">{sub.marks}%</div>
                           <div className="smallest fw-bold text-success text-uppercase ls-1">{sub.status === 'DISTINCTION' ? 'EXCELLENT' : sub.status === 'PROFICIENT' ? 'GOOD' : 'AVERAGE'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </Col>

            <Col lg={4}>
              <div className="d-flex flex-column gap-4 pb-5">
                {/* ── Instructional Feed ── */}
                <Card className="border-0 shadow-sm rounded-4 p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 border-light-dark">
                    <h6 className="fw-bold text-dark mb-0 smallest text-uppercase ls-1">Teacher Messages</h6>
                    <Badge bg="primary-soft" text="primary" className="fw-bold smallest px-3 py-2 rounded-pill border border-primary-soft text-uppercase">2 NEW</Badge>
                  </div>
                  <div className="d-flex flex-column gap-3">
                    {[
                      { from: 'MR. DAVID (MATHS)', preview: 'Significant acceleration in algebraic logic detected in last assessment phase.', time: '1H AGO', unread: true },
                      { from: 'OFFICE ADMIN', preview: 'Directive: Secondary council session scheduled for upcoming academic quarter.', time: 'YESTERDAY', unread: false },
                    ].map((msg, i) => (
                      <div key={i} className={`p-4 rounded-4 border transition-all cursor-pointer ${msg.unread ? 'bg-primary-soft border-primary-soft' : 'bg-white border-light-dark opacity-75'}`}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                           <h6 className="smallest fw-bold text-dark mb-0 ls-1 text-uppercase">{msg.from}</h6>
                           <span className="smallest text-muted fw-bold ls-1 text-uppercase opacity-50">{msg.time}</span>
                        </div>
                        <p className="smallest text-secondary fw-medium mb-0 lh-base text-truncate d-block">{msg.preview}</p>
                      </div>
                    ))}
                    <Button variant="outline-primary" className="fw-bold smallest py-3 rounded-pill ls-1 text-uppercase mt-2 border-2 shadow-none">View All Messages</Button>
                  </div>
                </Card>

                {/* ── Campus Bulletins ── */}
                <Card className="border-0 shadow-sm rounded-4 p-4 border-bottom border-4 border-primary">
                   <h6 className="fw-bold text-dark mb-4 border-bottom pb-3 border-light-dark smallest text-uppercase ls-1">Campus Notices</h6>
                   <div className="d-flex flex-column gap-4">
                    {announcements.length === 0 ? (
                      <div className="p-5 text-center text-muted smallest fw-bold text-uppercase ls-2 italic opacity-50 border border-dashed rounded-4">NO NOTICES</div>
                    ) : (
                      announcements.map((ann, i) => (
                        <div key={i} className="pb-3 border-bottom border-light-dark flex-column last-border-0">
                          <span className="smallest text-primary fw-bold text-uppercase ls-1 d-block mb-1">{new Date(ann.createdAt).toLocaleDateString()}</span>
                          <h6 className="fw-bold text-dark mb-2 smaller ls-1 text-uppercase">{ann.title}</h6>
                          <p className="smallest text-secondary fw-medium mb-0 lh-base">{ann.content.substring(0, 100)}...</p>
                        </div>
                      ))
                    )}
                    <Button variant="link" className="text-primary text-decoration-none fw-bold smallest p-0 ls-1 text-uppercase text-start shadow-none">View All Notices &rarr;</Button>
                  </div>
                </Card>

                {/* ── Quick Directives ── */}
                <Card className="border-0 shadow-sm rounded-4 p-4 bg-dark text-white">
                  <h6 className="fw-bold text-uppercase smallest ls-2 mb-4 border-bottom border-secondary border-opacity-25 pb-3">Quick Actions</h6>
                  <div className="d-flex flex-column gap-3">
                     <Button variant="outline-light" className="text-start border-light border-opacity-25 py-3 px-4 rounded-4 shadow-none smallest fw-bold text-uppercase ls-1 transition-all hover-bg-white hover-text-dark">Download Report</Button>
                     <Button variant="outline-light" className="text-start border-light border-opacity-25 py-3 px-4 rounded-4 shadow-none smallest fw-bold text-uppercase ls-1 transition-all hover-bg-white hover-text-dark">Enrollment Status</Button>
                     <Button variant="outline-light" className="text-start border-light border-opacity-25 py-3 px-4 rounded-4 shadow-none smallest fw-bold text-uppercase ls-1 transition-all hover-bg-white hover-text-dark">Contact School</Button>
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

const NavItem: React.FC<{ label: string, active?: boolean, onClick?: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`btn w-100 text-start py-3 px-4 rounded-pill border-0 transition-all mb-1 ${active ? 'bg-primary text-white fw-bold shadow-sm' : 'bg-transparent text-secondary fw-semibold hover-bg-light'}`} style={{ fontSize: '0.85rem' }}>
    <span className="ls-1 text-uppercase smallest">{label}</span>
  </button>
);

export default ParentDashboard;

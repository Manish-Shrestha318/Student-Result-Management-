import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
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
  ArcElement,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

const StudentResults: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [comprehensive, setComprehensive] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [resultWithAttendance, setResultWithAttendance] = useState<any>(null);
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchData = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [compRes, trendRes, resultRes] = await Promise.all([
        fetch(`/api/analytics/comprehensive/${user._id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/analytics/trend/${user._id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/analytics/result-with-attendance/${user._id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const comp = await compRes.json();
      const trendData = await trendRes.json();
      const resultData = await resultRes.json();

      if (comp.success) setComprehensive(comp.data);
      if (trendData.success) setTrend(trendData.data);
      if (resultData.success) setResultWithAttendance(resultData.data);

    } catch (err) {
      setError('Failed to synchronize performance analytics hub.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sortedTrend = [...trend].sort((a, b) => {
    const termOrder: any = { 'First Term': 0, 'Mid Term': 1, 'Final': 2 };
    const aTerm = a.term.replace(/\s\d{4}$/, '');
    const bTerm = b.term.replace(/\s\d{4}$/, '');
    return (a.year * 10 + (termOrder[aTerm] || 0)) - (b.year * 10 + (termOrder[bTerm] || 0));
  });

  const currentLevel = sortedTrend.length > 0 ? sortedTrend[sortedTrend.length - 1].percentage : 0;
  const previousLevel = sortedTrend.length > 1 ? sortedTrend[sortedTrend.length - 2].percentage : currentLevel;
  const growth = currentLevel - previousLevel;

  const termLabels = sortedTrend.map(t => t.term.replace(/\s\d{4}$/, ''));
  const termScores = sortedTrend.map(t => t.percentage);
  
  const termChartData = {
    labels: termLabels,
    datasets: [{
      label: 'Score (%)',
      data: termScores,
      backgroundColor: [
        'rgba(37, 99, 235, 0.8)',  
        'rgba(16, 185, 129, 0.8)', 
        'rgba(139, 92, 246, 0.8)', 
      ],
      borderRadius: 12,
      borderWidth: 0,
    }]
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      {/* ── Scholar Console ── */}
      <aside className="d-flex flex-column bg-white border-end p-4 shadow-sm" style={{ width: '280px', zIndex: 10 }}>
        <div className="mb-5 px-3">
          <h4 className="fw-bold text-primary ls-1 mb-0">SMARTRESULTS</h4>
          <span className="smallest text-muted fw-bold text-uppercase ls-1">Academic Analytics</span>
        </div>
        
        <nav className="nav flex-column gap-1 flex-grow-1 overflow-auto custom-scrollbar">
          <NavItem label="Dashboard" onClick={() => navigate('/dashboard/student')} />
          <NavItem label="Results" active />
          <NavItem label="Attendance" onClick={() => navigate('/dashboard/student/attendance')} />
          <NavItem label="Notices" onClick={() => navigate('/dashboard/student/notices')} />
        </nav>
      </aside>

      {/* ── Primary Terminal ── */}
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Results" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {loading ? (
             <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
             </div>
          ) : (
            <div className="d-flex flex-column gap-5">
              
              {/* ── Analytical Scorecards ── */}
              <Row className="g-4">
                <MetricCol label="OVERALL SCORE" value={`${currentLevel.toFixed(1)}%`} variant="primary" growth={growth} />
                <MetricCol label="BEST SUBJECT" value={comprehensive?.summary?.strongestSubject || 'N/A'} variant="success" />
                <MetricCol label="WEAKEST SUBJECT" value={comprehensive?.summary?.weakestSubject || 'N/A'} variant="warning" />
                <MetricCol label="ATTENDANCE" value={`${resultWithAttendance?.attendancePercentage || 0}%`} variant="dark" />
              </Row>

              {/* ── Success Visualization Matrix ── */}
              <Row className="g-4">
                <Col lg={6}>
                  <Card className="border-0 shadow-sm rounded-4 p-4">
                    <h6 className="fw-bold text-dark mb-4 smallest text-uppercase ls-2">Progress Chart</h6>
                    <div style={{ height: '340px' }}>
                      <Bar 
                        data={termChartData} 
                        options={{ 
                          responsive: true, 
                          maintainAspectRatio: false, 
                          plugins: { legend: { display: false } },
                          scales: { 
                            y: { beginAtZero: true, max: 100, border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10, weight: 'bold' } } },
                            x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
                          }
                        }} 
                      />
                    </div>
                  </Card>
                </Col>
                <Col lg={6}>
                  <Card className="border-0 shadow-sm rounded-4 p-4">
                    <h6 className="fw-bold text-dark mb-4 smallest text-uppercase ls-2">Longitudinal trajectory</h6>
                    <div style={{ height: '340px' }}>
                      <Line 
                          data={{
                              ...termChartData,
                              datasets: [{
                                  ...termChartData.datasets[0],
                                  label: 'Relative Score %',
                                  backgroundColor: 'rgba(37, 99, 235, 0.05)',
                                  borderColor: 'rgba(37, 99, 235, 1)',
                                  fill: true,
                                  tension: 0.4,
                                  pointRadius: 6,
                                  pointBackgroundColor: '#fff',
                                  pointBorderWidth: 3
                              }]
                          }} 
                          options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { 
                              y: { beginAtZero: true, max: 100, border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10, weight: 'bold' } } },
                              x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
                            }
                          }} 
                      />
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* ── Hover Intelligence Fragment ── */}
              {hoveredSubject && (
                <div 
                  className="position-fixed bg-white border border-light-dark rounded-4 shadow-lg p-4 z-3"
                  style={{ top: mousePos.y + 15, left: mousePos.x + 15, minWidth: '260px', pointerEvents: 'none' }}
                >
                   <h6 className="fw-bold text-primary mb-3 smallest text-uppercase ls-2 border-bottom pb-2">
                     {hoveredSubject} Topic Matrix
                   </h6>
                   <div className="d-flex flex-column gap-3">
                      {comprehensive?.topicBreakdown?.filter((t: any) => t.subject === hoveredSubject)
                        .filter((t: any, i: number, self: any[]) => self.findIndex(x => x.topic === t.topic) === i)
                        .map((topic: any, idx: number) => (
                          <div key={idx}>
                            <div className="d-flex justify-content-between smallest fw-bold text-uppercase mb-1 ls-1">
                              <span className="text-secondary">{topic.topic}</span>
                              <span className="text-dark">{topic.percentage}%</span>
                            </div>
                            <div style={{ height: '8px' }} className="bg-light-soft rounded-pill overflow-hidden border">
                              <div style={{ 
                                height: '100%', 
                                width: `${topic.percentage}%`, 
                                background: parseFloat(topic.percentage) >= 80 ? '#10b981' : parseFloat(topic.percentage) >= 50 ? '#f59e0b' : '#ef4444' 
                              }} />
                            </div>
                          </div>
                      ))}
                   </div>
                </div>
              )}

              {/* ── Strategic Intervention POD ── */}
              <Card className="border-0 shadow-sm rounded-4 p-4 border-start border-5 border-info bg-primary-soft">
                  <div className="d-flex align-items-center gap-4">
                    <div className="p-4 bg-white rounded-4 shadow-sm border smallest fw-bold text-primary ls-1 text-uppercase">Recommendation</div>
                    <div className="px-2">
                      <p className="text-dark smallest mb-0 fw-bold lh-base ls-1">
                        {comprehensive?.summary?.weakestSubject !== 'N/A' 
                          ? `Focus more on ${comprehensive?.summary?.weakestSubject}. Your overall performance is good, but improving this subject will help raise your total score.`
                          : "Great job! Keep up the consistency. Your attendance and marks are both looking good."}
                      </p>
                    </div>
                  </div>
              </Card>

              {/* ── Achievement Matrix ── */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center border-bottom">
                   <h6 className="fw-bold text-dark mb-0 smallest text-uppercase ls-2">Subject Details</h6>
                   <Badge bg="primary-soft" text="primary" className="fw-bold smallest text-uppercase ls-1 border border-primary-soft px-3 py-2 rounded-pill">YEAR: 2025</Badge>
                </Card.Header>
                <div className="table-responsive">
                  <Table borderless hover className="align-middle mb-0 smallest fw-medium">
                    <thead className="bg-light-soft border-bottom">
                      <tr>
                        <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Subject</th>
                        <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Marks</th>
                        <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Percentage</th>
                        <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-end">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultWithAttendance?.subjects.map((sub: any, i: number) => {
                        const analysisData = comprehensive?.subjectWise?.find((s: any) => s.subject === sub.subject);
                        const progressTrend = analysisData?.statusTrend;
                        return (
                          <tr 
                            key={i} 
                            className="cursor-help border-bottom border-light transition-all hover-translate-x"
                            onMouseMove={(e) => { setHoveredSubject(sub.subject); setMousePos({ x: e.clientX, y: e.clientY }); }}
                            onMouseLeave={() => setHoveredSubject(null)}
                          >
                            <td className="px-4 py-3">
                              <span className="fw-bold text-dark smallest text-uppercase ls-1">{sub.subject}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                               <div className="smallest fw-bold text-secondary ls-1">
                                 {sub.marksObtained} / {sub.totalMarks} <span className="text-muted ms-2">({sub.rawPercentage}%)</span>
                               </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge bg={sub.rawPercentage < 40 ? 'danger-soft' : 'success-soft'} text={sub.rawPercentage < 40 ? 'danger' : 'success'} className="fw-bold smallest text-uppercase px-4 py-2 border rounded-pill ls-1">
                                {sub.grade !== 'N/E' ? sub.grade : (sub.rawPercentage >= 40 ? 'PASS' : 'FAIL')}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-end">
                               <div className="smallest fw-bold ls-1">
                                  {progressTrend === 'MASTERED' ? <span className="text-warning text-uppercase">EXCELLENCE ARCHIVED</span> :
                                   progressTrend === 'IMPROVED' ? <span className="text-success text-uppercase">IMPROVEMENT ACQUIRED</span> :
                                   progressTrend === 'POORER' ? <span className="text-danger text-uppercase">REBATE OBSERVED</span> :
                                   progressTrend === 'INITIAL_EXCELLENCE' ? <span className="text-primary text-uppercase">SUPERIOR ENTRY</span> :
                                   progressTrend === 'CONSISTENT' ? <span className="text-info text-uppercase">STABLE TRAJECTORY</span> :
                                   <span className="text-muted text-uppercase">NOMINAL STATE</span>}
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const MetricCol: React.FC<{ label: string, value: string | number, variant: string, growth?: number }> = ({ label, value, variant, growth }) => (
  <Col md={3}>
    <Card className={`border-0 shadow-sm rounded-4 h-100 border-start border-5 border-${variant}`}>
      <Card.Body className="p-4 py-3">
        <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1">{label}</span>
        <h4 className="fw-bold text-dark mb-1 ls-1">{value}</h4>
        {growth !== undefined && (
          <div className={`smallest fw-bold text-uppercase ls-1 ${growth >= 0 ? 'text-success' : 'text-danger'}`}>
             {growth >= 0 ? "+" : ""}{growth.toFixed(1)}% VELOCITY
          </div>
        )}
      </Card.Body>
    </Card>
  </Col>
);

const NavItem: React.FC<{ label: string, active?: boolean, onClick?: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`btn w-100 text-start py-3 px-4 rounded-pill border-0 transition-all mb-1 ${active ? 'bg-primary text-white fw-bold shadow-sm' : 'bg-transparent text-secondary fw-semibold hover-bg-light'}`} style={{ fontSize: '0.85rem' }}>
    <span className="ls-1 text-uppercase smallest">{label}</span>
  </button>
);

export default StudentResults;

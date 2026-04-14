import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentSidebar from '../../components/ParentSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Table, Badge, Spinner, Form, Button } from 'react-bootstrap';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ParentResults: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  
  const [comprehensive, setComprehensive] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [resultWithAttendance, setResultWithAttendance] = useState<any>(null);
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Sync with Sidebar selection
  useEffect(() => {
    const fetchAndSync = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const res = await fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.user) {
          const children = data.user.parentProfile?.children || [];
          const storedId = localStorage.getItem('selectedChildId');
          const match = children.find((c: any) => c._id === storedId) || children[0];
          
          if (match) {
            setSelectedChild(match);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) { 
        console.error(err); 
        setLoading(false);
      }
    };

    fetchAndSync();

    const handleSync = () => {
      const storedId = localStorage.getItem('selectedChildId');
      window.location.reload(); // Hard reload for simplicity in syncing complex states
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, [navigate]);

  const fetchData = useCallback(async () => {
    if (!selectedChild?._id) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    const studentUserId = selectedChild.userId?._id || selectedChild.userId;

    try {
      const [compRes, trendRes, resultRes] = await Promise.all([
        fetch(`/api/analytics/comprehensive/${studentUserId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/analytics/trend/${studentUserId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/analytics/result-with-attendance/${studentUserId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const comp = await compRes.json();
      const trendData = await trendRes.json();
      const resultData = await resultRes.json();

      if (comp.success) setComprehensive(comp.data);
      if (trendData.success) setTrend(trendData.data || []);
      if (resultData.success) setResultWithAttendance(resultData.data);

    } catch (err) {
      setError('Failed to synchronize performance analytics hub.');
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedTrend = [...trend].sort((a, b) => {
    const termOrder: any = { 'First Term': 0, 'Second Term': 1, 'Final Term': 2 };
    const aTerm = a.term.replace(/\s\d{4}$/, '');
    const bTerm = b.term.replace(/\s\d{4}$/, '');
    return (a.year * 10 + (termOrder[aTerm] || 0)) - (b.year * 10 + (termOrder[bTerm] || 0));
  });

  const currentLevel = sortedTrend.length > 0 ? sortedTrend[sortedTrend.length - 1].percentage : 0;

  const termOrders = ['First Term', 'Second Term', 'Final Term'];
  const termIdx = termOrders.indexOf(selectedTerm);
  let prevTermName: string | null = null;
  let prevYearValue = selectedYear;

  if (termIdx > 0) {
      prevTermName = termOrders[termIdx - 1];
  }

  const buildComparisons = () => {
    const rawSubjectsAll = resultWithAttendance?.subjects || [];
    const topicsData = comprehensive?.subjectAnalysis?.topicBreakdown || [];
    const subjectsSet = new Set<string>();
    rawSubjectsAll.forEach((s: any) => subjectsSet.add(s.subject));
    const result: any[] = [];

    Array.from(subjectsSet).forEach(subName => {
      const curr = rawSubjectsAll.find((s: any) => s.subject === subName && s.term === selectedTerm && String(s.year ?? s.yearId) === selectedYear);
      const prev = prevTermName ? rawSubjectsAll.find((s: any) => s.subject === subName && s.term === prevTermName && String(s.year ?? s.yearId) === prevYearValue) : null;
      if (!curr) return;

      const currentTermNormalized = selectedTerm.toLowerCase().trim();
      const topics = Array.from(new Set(topicsData.filter((t: any) => t.subject.toLowerCase() === subName.toLowerCase()).map((t: any) => t.topic)))
        .map(topicName => {
        const currTopic = topicsData.find((t: any) => t.subject.toLowerCase() === subName.toLowerCase() && t.topic === topicName && t.term.toLowerCase().includes(currentTermNormalized) && (!t.year || String(t.year) === String(selectedYear)));
        const prevTopic = prevTermName ? topicsData.find((t: any) => t.subject.toLowerCase() === subName.toLowerCase() && t.topic === topicName && t.term.toLowerCase().includes(prevTermName.toLowerCase()) && (!t.year || String(t.year) === String(prevYearValue))) : null;
          return { 
          topic: topicName, 
          rawScore: currTopic ? parseFloat(currTopic.score) : 0, 
          prevRawScore: prevTopic ? parseFloat(prevTopic.score) : 0,
          percentage: currTopic ? parseFloat(currTopic.percentage) : 0 
        };
        });

      result.push({ name: subName, previous: prev ? prev.marksObtained : 0, current: curr.marksObtained, currPct: curr.rawPercentage ?? 0, prevPct: prev?.rawPercentage ?? 0, topics });
    });
    return result;
  };

  const comparisons = buildComparisons();
  const sortedByScore = [...comparisons].sort((a, b) => b.currPct - a.currPct);
  const bestSub = sortedByScore.length > 0 ? sortedByScore[0].name : 'N/A';
  const weakestSub = sortedByScore.length > 0 ? sortedByScore[sortedByScore.length - 1].name : 'N/A';

  const barData = {
    labels: comparisons.map(c => c.name),
    datasets: [
      { label: 'Current', data: comparisons.map(c => c.current), backgroundColor: '#5a8dee', barPercentage: 0.4, categoryPercentage: 0.5 },
      { label: 'Prev', data: comparisons.map(c => c.previous), backgroundColor: '#dce5f9', barPercentage: 0.4, categoryPercentage: 0.5 }
    ]
  };

  const barOptions: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true, pointStyle: 'rect' } } },
    scales: { y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' }, border: { display: false } }, x: { grid: { display: false } } }
  };

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const studentUserId = selectedChild.userId?._id || selectedChild.userId;
      const termEncoded = encodeURIComponent(selectedTerm);
      const yearEncoded = encodeURIComponent(selectedYear);
      
      const response = await fetch(`/api/reports/generate?studentId=${studentUserId}&term=${termEncoded}&year=${yearEncoded}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        let errMsg = "Report not available for selected term/year.";
        try {
          const errData = await response.json();
          if (errData.message) errMsg = errData.message;
        } catch(e) {}
        throw new Error(errMsg);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ReportCard_${selectedChild.userId?.name?.replace(/\s+/g, '_')}_${selectedTerm}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download report.");
    }
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <ParentSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Exam Results" error={error} />
        <div className="container-fluid p-4 p-lg-5">
          {loading ? (
             <div className="d-flex justify-content-center align-items-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : !selectedChild ? (
             <div className="text-center py-5 text-muted fw-bold">NO CHILD SELECTED</div>
          ) : (
            <div className="d-flex flex-column gap-5">
              <Row className="g-3 mb-4">
                <MetricCol label="OVERALL SCORE" value={`${currentLevel.toFixed(1)}%`} />
                <MetricCol label="BEST SUBJECT" value={bestSub} />
                <MetricCol label="WEAKEST SUBJECT" value={weakestSub} />
                <MetricCol label="ATTENDANCE" value={`${resultWithAttendance?.attendancePercentage ? Math.round(resultWithAttendance.attendancePercentage) : 0}%`} />
              </Row>

              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5 bg-white">
                 <Card.Header className="bg-white border-0 p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                   <h6 className="fw-bold text-muted mb-0 text-uppercase ls-2">PERFORMANCE ANALYSIS</h6>
                   <div className="d-flex flex-wrap gap-2">
                     <Button size="sm" variant="outline-primary" className="fw-bold smallest text-uppercase px-3 rounded-pill" onClick={handleDownloadReport}>DOWNLOAD CARD</Button>
                     <Form.Select size="sm" className="fw-bold smallest text-uppercase shadow-none border py-2 px-3" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Final Term">Final Term</option>
                     </Form.Select>
                     <Form.Select size="sm" className="fw-bold smallest text-uppercase shadow-none border py-2 px-3" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                     </Form.Select>
                   </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <div style={{ height: '350px' }} className="mb-5"><Bar data={barData} options={barOptions} /></div>
                  <div className="table-responsive">
                    <Table borderless hover className="align-middle mb-0 smallest fw-medium">
                      <thead className="bg-light border-bottom">
                        <tr>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Subject</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Prev</th>
                          <th className="px-4 py-3 text-primary fw-bold text-uppercase ls-1 text-center">Current</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Status</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Level</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-end">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisons.length === 0 ? (
                          <tr><td colSpan={6} className="text-center text-muted p-4">No data found.</td></tr>
                        ) : comparisons.map((c: any, i: number) => {
                          const delta = c.current - c.previous;
                          const isPass = c.currPct >= 40;
                          const strength = c.currPct >= 80 ? 'STRONG' : c.currPct < 40 ? 'WEAK' : 'AVERAGE';
                          const isExpanded = expandedSubject === c.name;
                          return (
                            <React.Fragment key={i}>
                              <tr onClick={() => setExpandedSubject(isExpanded ? null : c.name)} style={{ cursor: 'pointer' }} className={isExpanded ? 'bg-light' : ''}>
                                <td className="px-4 py-3"><div className="d-flex align-items-center gap-2"><span className="fw-bold text-dark text-uppercase ls-1">{c.name}</span><span className="text-muted" style={{ fontSize: '0.7rem' }}>{isExpanded ? '▲' : '▼'} {c.topics.length} topics</span></div></td>
                                <td className="px-4 py-3 text-center text-muted">{c.previous > 0 ? c.previous.toFixed(1) : '—'}</td>
                                <td className="px-4 py-3 text-center fw-bold" style={{ color: '#5a8dee' }}>{c.current.toFixed(1)}</td>
                                <td className="px-4 py-3 text-center"><Badge bg={isPass ? 'success-soft' : 'danger-soft'} text={isPass ? 'success' : 'danger'} className="rounded-pill px-3 py-1 fw-bold">{isPass ? 'PASS' : 'FAIL'}</Badge></td>
                                <td className="px-4 py-3 text-center"><span className="smallest fw-bold ls-1 text-muted">{strength}</span></td>
                                <td className="px-4 py-3 text-end fw-bold text-muted">{delta > 0 ? '+' : ''}{delta.toFixed(1)}</td>
                              </tr>
                              {isExpanded && c.topics.map((t: any, j: number) => {
                                const tDelta = t.rawScore - t.prevRawScore;
                                const tPass = t.percentage >= 40;
                                const tStrength = t.percentage >= 80 ? 'STRONG' : t.percentage < 40 ? 'WEAK' : 'AVERAGE';
                                return (
                                  <tr key={`topic-${i}-${j}`} style={{ backgroundColor: '#f8faff' }}>
                                    <td className="ps-5 pe-4 py-2"><span className="text-muted fw-semibold text-uppercase ls-1" style={{ fontSize: '0.75rem' }}>↳ {t.topic}</span></td>
                                    <td className="px-4 py-2 text-center text-muted">{t.prevRawScore > 0 ? t.prevRawScore.toFixed(1) : '—'}</td>
                                    <td className="px-4 py-2 text-center fw-bold text-primary">{t.rawScore.toFixed(1)}</td>
                                    <td className="px-4 py-2 text-center"><Badge bg={tPass ? 'success-soft' : 'danger-soft'} text={tPass ? 'success' : 'danger'} className="rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>{tPass ? 'PASS' : 'FAIL'}</Badge></td>
                                    <td className="px-4 py-2 text-center"><span className="fw-bold text-muted" style={{ fontSize: '0.72rem' }}>{tStrength}</span></td>
                                    <td className="px-4 py-2 text-end text-muted fw-bold">{tDelta > 0 ? '+' : ''}{tDelta.toFixed(1)}</td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              {sortedTrend.length > 0 && (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-5">
                  <Card.Header className="bg-white border-bottom p-4"><h6 className="fw-bold text-dark mb-0 smallest text-uppercase ls-2">GROWTH TREND</h6></Card.Header>
                  <Card.Body className="p-4"><div style={{ height: '220px' }}><Line data={{ labels: sortedTrend.map(t => t.term.replace(/\s\d{4}$/, '') + ' ' + t.year), datasets: [{ label: 'Score %', data: sortedTrend.map(t => t.percentage), borderColor: '#5a8dee', backgroundColor: 'rgba(90,141,238,0.08)', fill: true, tension: 0.4, pointRadius: 5 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, min: 0, max: 100, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }} /></div></Card.Body>
                </Card>
              )}

              {resultWithAttendance && (() => {
                 const currScore = currentLevel;
                 const attend = resultWithAttendance.attendancePercentage ?? 100;
                 let type = 'INFO';
                 let typeColor = 'text-primary border-primary bg-primary-soft';
                 let msg = '';

                 if (attend >= 85 && currScore >= 70) {
                     msg = "Your child's consistent attendance is clearly reflected in their excellent grades. They are demonstrating strong dedication.";
                     type = 'OPTIMAL';
                     typeColor = 'text-success border-success bg-success-soft';
                 } else if (attend >= 85 && currScore < 70) {
                     msg = "Your child attends classes regularly, but their grades indicate they may be struggling with the material. Additional academic support at home might be beneficial.";
                     type = 'NEEDS ATTENTION';
                     typeColor = 'text-warning border-warning bg-warning-soft';
                 } else if (attend < 75 && currScore < 50) {
                     msg = "Your child's frequent absences are directly harming their academic performance. Improving attendance is the first crucial step to recovering their grades.";
                     type = 'CRITICAL ALERT';
                     typeColor = 'text-danger border-danger bg-danger-soft';
                 } else if (attend < 75 && currScore >= 70) {
                     msg = "Your child is maintaining good grades, but their low attendance is a concern. Consistent attendance is essential to ensure they don't fall behind in the future.";
                     type = 'WARNING';
                     typeColor = 'text-warning border-warning bg-warning-soft';
                 } else {
                     msg = "Your child's performance and attendance are both moderate. Encouraging more consistent class participation will help them achieve better results.";
                     type = 'ON TRACK';
                     typeColor = 'text-secondary border-secondary bg-light';
                 }

                 return (
                    <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-5">
                      <div className="d-flex align-items-start gap-3">
                        <div className={`smallest fw-bolder text-uppercase ls-1 border rounded-2 px-3 py-2 ${typeColor}`} style={{ whiteSpace: 'nowrap', fontSize: '0.65rem' }}>{type}</div>
                        <div>
                          <span className="smallest text-muted fw-bold text-uppercase d-block mb-2">Performance Insight</span>
                          <p className="text-dark mb-0 fw-semibold" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>{msg}</p>
                        </div>
                      </div>
                    </Card>
                 );
              })()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const MetricCol: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
  <Col md={6} lg={3}><Card className="border shadow-none rounded-3 h-100 bg-white"><Card.Body className="p-3 text-center d-flex flex-column justify-content-center"><span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-2 opacity-75">{label}</span><h4 className="fw-bold text-dark mb-0 ls-1">{value}</h4></Card.Body></Card></Col>
);

export default ParentResults;

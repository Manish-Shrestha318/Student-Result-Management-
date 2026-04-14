import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../components/StudentSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Table, Badge, Spinner, Form, Button } from 'react-bootstrap';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const StudentResults: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [comprehensive, setComprehensive] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [resultWithAttendance, setResultWithAttendance] = useState<any>(null);

  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

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

  // Build rich comparisons: subject-level + topic breakdown embedded
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

      // Get topics for this subject
      const topicNames = new Set<string>();
      const currentTermNormalized = selectedTerm.toLowerCase().trim();

      topicsData
        .filter((t: any) => t.subject.toLowerCase() === subName.toLowerCase())
        .forEach((t: any) => topicNames.add(t.topic));

      const topics = Array.from(topicNames).map(topicName => {
        const currTopic = topicsData.find((t: any) => 
          t.subject.toLowerCase() === subName.toLowerCase() && 
          t.topic === topicName && 
          t.term.toLowerCase().includes(currentTermNormalized) &&
          (!t.year || String(t.year) === String(selectedYear))
        );
        const prevTopic = prevTermName ? topicsData.find((t: any) => 
          t.subject.toLowerCase() === subName.toLowerCase() && 
          t.topic === topicName && 
          t.term.toLowerCase().includes(prevTermName.toLowerCase()) &&
          (!t.year || String(t.year) === String(prevYearValue))
        ) : null;

        return {
          topic: topicName,
          rawScore: currTopic ? parseFloat(currTopic.score) : 0,
          prevRawScore: prevTopic ? parseFloat(prevTopic.score) : 0,
          percentage: currTopic ? parseFloat(currTopic.percentage) : 0,
        };
      });

      result.push({
        name: subName,
        previous: prev ? prev.marksObtained : 0,
        current: curr.marksObtained,
        currPct: curr.rawPercentage ?? 0,
        prevPct: prev?.rawPercentage ?? 0,
        topics,
      });
    });
    return result;
  };

  const comparisons = buildComparisons();

  // Find best and weakest subject based on CURRENT term (from comparisons)
  const sortedByScore = [...comparisons].sort((a, b) => b.currPct - a.currPct);
  const bestSub = sortedByScore.length > 0 ? sortedByScore[0].name : 'N/A';
  const weakestSub = sortedByScore.length > 0 ? sortedByScore[sortedByScore.length - 1].name : 'N/A';

  const barData = {
    labels: comparisons.map(c => c.name),
    datasets: [
      {
        label: 'Current',
        data: comparisons.map(c => c.current),
        backgroundColor: '#5a8dee',
        barPercentage: 0.4,
        categoryPercentage: 0.5
      },
      {
        label: 'Prev',
        data: comparisons.map(c => c.previous),
        backgroundColor: '#dce5f9',
        barPercentage: 0.4,
        categoryPercentage: 0.5
      }
    ]
  };

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const termEncoded = encodeURIComponent(selectedTerm);
      const yearEncoded = encodeURIComponent(selectedYear);
      
      const response = await fetch(`/api/reports/generate?studentId=${user._id}&term=${termEncoded}&year=${yearEncoded}`, {
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
      a.download = `ReportCard_${user?.name?.replace(/\s+/g, '_')}_${selectedTerm}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download report.");
    }
  };

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true, pointStyle: 'rect' } }
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' }, border: { display: false } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <StudentSidebar />

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
              <Row className="g-3 mb-4">
                <MetricCol label="OVERALL SCORE" value={`${currentLevel.toFixed(1)}%`} />
                <MetricCol label="BEST SUBJECT" value={bestSub} />
                <MetricCol label="WEAKEST SUBJECT" value={weakestSub} />
                <MetricCol label="ATTENDANCE PERCENTAGE" value={`${resultWithAttendance?.attendancePercentage ? Math.round(resultWithAttendance.attendancePercentage) : 0}%`} />
              </Row>

              {/* ── Comparison View ── */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                 <Card.Header className="bg-white border-0 p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                   <h6 className="fw-bold text-muted mb-0 text-uppercase ls-2">COMPARISON VIEW</h6>
                   <div className="d-flex flex-wrap gap-2">
                     <Button size="sm" variant="outline-primary" className="fw-bold smallest text-uppercase px-3 rounded-pill" onClick={handleDownloadReport}>
                        PRINT REPORT
                     </Button>
                     <Form.Select size="sm" className="fw-bold smallest text-uppercase shadow-none border py-2 px-3" value={selectedTerm} onChange={(e: any) => setSelectedTerm(e.target.value)}>
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Final Term">Final Term</option>
                     </Form.Select>
                     <Form.Select size="sm" className="fw-bold smallest text-uppercase shadow-none border py-2 px-3" value={selectedYear} onChange={(e: any) => setSelectedYear(e.target.value)}>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                     </Form.Select>
                   </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <div style={{ height: '350px' }} className="mb-5">
                    <Bar data={barData} options={barOptions} />
                  </div>
                  
                  {/* Subject Comparison Table with expandable topic rows */}
                  <div className="table-responsive">
                    <Table borderless hover className="align-middle mb-0 smallest fw-medium">
                      <thead className="bg-light border-bottom">
                        <tr>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Subject</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Prev Score</th>
                          <th className="px-4 py-3 text-primary fw-bold text-uppercase ls-1 text-center">Curr Score</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Status</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Strength</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-end">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisons.length === 0 ? (
                          <tr><td colSpan={6} className="text-center text-muted p-4">No data for the selected term.</td></tr>
                        ) : comparisons.map((c: any, i: number) => {
                          const delta = c.current - c.previous;
                          const isPass = c.currPct >= 40;
                          const strength = c.currPct >= 80 ? 'STRONG' : c.currPct < 40 ? 'WEAK' : 'AVERAGE';
                          const isExpanded = expandedSubject === c.name;
                          return (
                            <React.Fragment key={i}>
                              {/* Subject row - clickable */}
                              <tr
                                onClick={() => setExpandedSubject(isExpanded ? null : c.name)}
                                style={{ cursor: 'pointer' }}
                                className={`border-bottom ${isExpanded ? 'bg-light' : ''}`}
                              >
                                <td className="px-4 py-3">
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="fw-bold text-dark text-uppercase ls-1">{c.name}</span>
                                    {c.topics?.length > 0 && (
                                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                        {isExpanded ? '▲' : '▼'} {c.topics.length} topics
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center text-muted">{c.previous > 0 ? c.previous.toFixed(1) : '—'}</td>
                                <td className="px-4 py-3 text-center fw-bold" style={{ color: '#5a8dee' }}>{c.current > 0 ? c.current.toFixed(1) : '0'}</td>
                                <td className="px-4 py-3 text-center">
                                  <Badge bg={isPass ? 'success-soft' : 'danger-soft'} text={isPass ? 'success' : 'danger'} className="rounded-pill px-3 py-1 fw-bold">{isPass ? 'PASS' : 'FAIL'}</Badge>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="smallest fw-bold ls-1 text-muted">{strength}</span>
                                </td>
                                <td className="px-4 py-3 text-end fw-bold text-muted">
                                  {delta > 0 ? '+' : ''}{delta !== 0 ? delta.toFixed(1) : '0'}
                                </td>
                              </tr>

                              {/* Topic expansion rows */}
                              {isExpanded && c.topics?.length > 0 && c.topics.map((t: any, j: number) => {
                                const tDelta = t.rawScore - t.prevRawScore;
                                const tPass = t.percentage >= 40;
                                const tStrength = t.percentage >= 80 ? 'STRONG' : t.percentage < 40 ? 'WEAK' : 'AVERAGE';
                                return (
                                  <tr key={`topic-${i}-${j}`} className="border-bottom" style={{ backgroundColor: '#f8faff' }}>
                                    <td className="ps-5 pe-4 py-2">
                                      <span className="text-muted fw-semibold text-uppercase ls-1" style={{ fontSize: '0.75rem' }}>↳ {t.topic}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center text-muted" style={{ fontSize: '0.75rem' }}>{t.prevRawScore > 0 ? t.prevRawScore.toFixed(1) : '—'}</td>
                                    <td className="px-4 py-2 text-center fw-bold" style={{ color: '#5a8dee', fontSize: '0.75rem' }}>{t.rawScore > 0 ? t.rawScore.toFixed(1) : '0'}</td>
                                    <td className="px-4 py-2 text-center">
                                      <Badge bg={tPass ? 'success-soft' : 'danger-soft'} text={tPass ? 'success' : 'danger'} className="rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>{tPass ? 'PASS' : 'FAIL'}</Badge>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <span className="fw-bold text-muted" style={{ fontSize: '0.72rem' }}>{tStrength}</span>
                                    </td>
                                    <td className="px-4 py-2 text-end text-muted fw-bold" style={{ fontSize: '0.75rem' }}>
                                      {tDelta > 0 ? '+' : ''}{tDelta !== 0 ? tDelta.toFixed(1) : '0'}
                                    </td>
                                  </tr>
                                );
                              })}
                              {isExpanded && (!c.topics || c.topics.length === 0) && (
                                <tr style={{ backgroundColor: '#f8faff' }}>
                                  <td colSpan={6} className="ps-5 py-2 text-muted smallest">No topic breakdown recorded for this subject.</td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>


              {/* ── Performance Trend ── */}
              {sortedTrend.length > 0 && (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <Card.Header className="bg-white border-0 p-4 border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold text-dark mb-0 smallest text-uppercase ls-2">Performance Trend</h6>
                    <span className="smallest text-muted fw-bold">{sortedTrend.length} Terms Recorded</span>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <div style={{ height: '220px' }}>
                      <Line
                        data={{
                          labels: sortedTrend.map(t => t.term.replace(/\s\d{4}$/, '') + ' ' + t.year),
                          datasets: [{
                            label: 'Score %',
                            data: sortedTrend.map(t => t.percentage),
                            borderColor: '#5a8dee',
                            backgroundColor: 'rgba(90,141,238,0.08)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#5a8dee',
                            pointBorderWidth: 2,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { beginAtZero: false, min: 0, max: 100, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 10 } } },
                            x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                          }
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* ── Smart Recommendation ── */}
              {(() => {
                const weakest = comprehensive?.summary?.weakestSubject;
                const strongest = comprehensive?.summary?.strongestSubject;
                const attend = resultWithAttendance?.attendancePercentage ?? 100;
                const failedSubs = (resultWithAttendance?.subjects || []).filter((s: any) => s.term === selectedTerm && String(s.year ?? s.yearId) === selectedYear && s.rawPercentage < 40);
                const currScore = currentLevel;

                let type = 'INFO';
                let typeColor = 'text-primary';
                let msg = '';
                let impactMsg = '';

                if (attend >= 85 && currScore >= 70) {
                     impactMsg = 'Your consistent attendance has directly contributed to your strong grades. Keep up this excellent dedication.';
                     type = 'EXCELLENT';
                     typeColor = 'text-success border-success bg-success-soft';
                } else if (attend >= 85 && currScore < 70) {
                     impactMsg = 'While your classroom attendance is great, your grades need attention. Consider exploring new study habits or seeking extra help.';
                     type = 'NEEDS FOCUS';
                     typeColor = 'text-warning border-warning bg-warning-soft';
                } else if (attend < 75 && currScore < 50) {
                     impactMsg = 'Your frequent absences are severely affecting your academic performance. Regular attendance is critical to improving your grades.';
                     type = 'CRITICAL ALERT';
                     typeColor = 'text-danger border-danger bg-danger-soft';
                } else if (attend < 75 && currScore >= 70) {
                     impactMsg = 'You possess good academic capabilities, but your low attendance is a risk. Maintaining regular participation is essential for long-term consistency.';
                     type = 'ATTENDANCE RISK';
                     typeColor = 'text-warning border-warning bg-warning-soft';
                } else {
                     impactMsg = 'Your attendance and academic performance are at a moderate level. Consistent class participation is the key to further improvement.';
                     type = 'ON TRACK';
                     typeColor = 'text-secondary border-secondary bg-light';
                }

                if (failedSubs.length > 0) {
                  const failNames = failedSubs.map((s: any) => s.subject).join(', ');
                  msg = `${impactMsg} You also need to focus heavily on recovering your failing grades in: ${failNames}.`;
                  type = 'ACTION REQUIRED';
                  typeColor = 'text-danger border-danger bg-danger-soft';
                } else {
                  msg = `${impactMsg} ${weakest && weakest !== 'N/A' ? `Dedicating extra time to ${weakest} will help boost your overall average even further.` : ''}`;
                }

                return (
                  <Card className="border-0 shadow-sm rounded-4 p-4 mb-5">
                    <div className="d-flex align-items-start gap-3">
                      <div className={`smallest fw-bolder text-uppercase ls-1 border rounded-2 px-3 py-2 ${typeColor}`} style={{ whiteSpace: 'nowrap', fontSize: '0.65rem' }}>{type}</div>
                      <div>
                        <span className="smallest fw-bold text-uppercase ls-1 text-muted d-block mb-2">Performance Insight</span>
                        <p className="text-dark mb-0 fw-semibold" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>{msg}</p>
                      </div>
                    </div>
                  </Card>
                );
              })()}

              {/* ── Achievement Matrix ── */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                <Card.Header className="bg-white border-0 p-4 d-flex justify-content-between align-items-center border-bottom">
                   <h6 className="fw-bold text-dark mb-0 smallest text-uppercase ls-2">Term Report Card</h6>
                </Card.Header>
                <div className="table-responsive">
                  <Table borderless hover className="align-middle mb-0 smallest fw-medium">
                    <thead className="bg-light-soft border-bottom">
                      <tr>
                        <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Subject</th>
                        <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Marks</th>
                        <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Percentage & Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const reportSubjects = (resultWithAttendance?.subjects || [])
                          .filter((sub: any) => sub.term === selectedTerm && String(sub.year || sub.yearId) === selectedYear)
                          .filter((sub: any, index: number, self: any[]) => self.findIndex(s => s.subject === sub.subject) === index);
                        
                        let totalObtained = 0;
                        let totalMax = 0;

                        return (
                          <>
                            {reportSubjects.map((sub: any, i: number) => {
                              totalObtained += sub.marksObtained;
                              totalMax += sub.totalMarks;
                              return (
                                <tr
                                  key={i}
                                  className="cursor-help border-bottom border-light transition-all hover-translate-x"
                                >
                                  <td className="px-4 py-3">
                                    <span className="fw-bold text-dark smallest text-uppercase ls-1">{sub.subject}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                     <div className="smallest fw-bold text-secondary ls-1">
                                       {sub.marksObtained} / {sub.totalMarks} <span className="text-muted ms-2">({sub.rawPercentage})</span>
                                     </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <Badge bg={sub.rawPercentage < 40 ? 'danger-soft' : 'success-soft'} text={sub.rawPercentage < 40 ? 'danger' : 'success'} className="fw-bold smallest text-uppercase px-4 py-2 border rounded-pill ls-1">
                                      {sub.grade !== 'N/E' ? sub.grade : (sub.rawPercentage >= 40 ? 'PASS' : 'FAIL')}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })}
                            {reportSubjects.length > 0 && totalMax > 0 && (
                              <tr className="bg-light-soft border-top">
                                <td className="px-4 py-4 text-end text-dark fw-bold text-uppercase ls-2 smallest">Total Score</td>
                                <td className="px-4 py-4 text-center">
                                  <div className="smallest fw-bold text-primary ls-1">
                                    {totalObtained} / {totalMax} <span className="text-muted ms-2">({((totalObtained / totalMax) * 100).toFixed(1)})</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <Badge bg={((totalObtained / totalMax) * 100) < 40 ? 'danger-soft' : 'success-soft'} text={((totalObtained / totalMax) * 100) < 40 ? 'danger' : 'success'} className="fw-bold smallest text-uppercase px-4 py-2 border rounded-pill ls-1">
                                    {((totalObtained / totalMax) * 100) >= 40 ? 'PASS' : 'FAIL'}
                                  </Badge>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })()}
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

const MetricCol: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
  <Col md={6} lg={3}>
    <Card className="border shadow-none rounded-3 h-100 bg-white">
      <Card.Body className="p-3 text-center d-flex flex-column justify-content-center">
        <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-2 opacity-75">{label}</span>
        <h4 className="fw-bold text-dark mb-0 ls-1">{value}</h4>
      </Card.Body>
    </Card>
  </Col>
);

export default StudentResults;

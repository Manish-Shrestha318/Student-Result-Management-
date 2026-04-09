import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Form, Button, Badge, Table, Alert } from 'react-bootstrap';

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Filler, Title, Tooltip, Legend
);

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses]   = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass,   setSelectedClass]   = useState('');
  const [selectedTerm,    setSelectedTerm]    = useState('First Term');
  const [selectedYear,    setSelectedYear]    = useState(new Date().getFullYear().toString());

  const [performance,      setPerformance]      = useState<any>(null);
  const [trendData,        setTrendData]        = useState<any[]>([]);
  const [resultData,       setResultData]       = useState<any>(null);

  const token = localStorage.getItem('token');

  const loadInitial = useCallback(async () => {
    try {
      const [cRes, spRes] = await Promise.all([
        fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/users?role=student', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const cData = await cRes.json();
      const spData = await spRes.json();
      if (cData.classes) setClasses(cData.classes);
      
      const stArray = spData.users || spData;
      if (Array.isArray(stArray)) setStudents(stArray);
    } catch { setError('Connection error.'); }
  }, [token]);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!selectedStudent) return;
    if (!silent) setLoading(true);
    setError(null);

    try {
      const [compRes, trendRes, resultRes] = await Promise.all([
        fetch(`/api/analytics/comprehensive/${selectedStudent}`,          { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/analytics/trend/${selectedStudent}`,                  { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/analytics/result-with-attendance/${selectedStudent}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      const comp   = await compRes.json();
      const trend  = await trendRes.json();
      const result = await resultRes.json();

      if (comp.success)   setPerformance(comp.data.performance);
      if (trend.success)  setTrendData(trend.data || []);
      if (result.success) setResultData(result.data);
      
    } catch { 
      setError('Fetch failed.'); 
    } finally { 
      if (!silent) setLoading(false); 
    }
  }, [selectedStudent, token]);

  useEffect(() => { if (selectedStudent) fetchAnalytics(); }, [selectedStudent, fetchAnalytics]);

  // Comparison
  const termOrders = ['First Term', 'Second Term', 'Final'];
  const termIdx = termOrders.indexOf(selectedTerm);
  
  let prevTermName: string | null = null;
  let prevYearValue = selectedYear;

  if (termIdx > 0) {
      prevTermName = termOrders[termIdx - 1];
  } else if (termIdx === 0) {
      prevTermName = 'Final';
      prevYearValue = String(Number(selectedYear) - 1);
  }
  
  const currentTrend = trendData.find(t => t.term?.includes(selectedTerm) && String(t.year) === selectedYear);
  const prevTrend = prevTermName ? trendData.find(t => t.term?.includes(prevTermName) && String(t.year) === prevYearValue) : null;
  
  const currentPct = currentTrend ? currentTrend.percentage : 0;
  const prevPct    = prevTrend    ? prevTrend.percentage    : 0;
  const growthRate = prevTrend    ? +(currentPct - prevPct).toFixed(1) : 0;

  const attendPct     = resultData?.attendancePercentage ?? 0;
  const rawSubjects   = resultData?.subjects ?? performance?.subjects ?? [];
  
  const getSubjectComparisons = () => {
    const table: any[] = [];
    const subjectsSet = new Set<string>();
    rawSubjects.forEach((s: any) => subjectsSet.add(s.name || s.subject));
    
    Array.from(subjectsSet).forEach(subName => {
      const curr = rawSubjects.find((s: any) => (s.name === subName || s.subject === subName) && s.term === selectedTerm && String(s.year || s.yearId) === selectedYear);
      const prev = prevTermName ? rawSubjects.find((s: any) => (s.name === subName || s.subject === subName) && s.term === prevTermName && String(s.year || s.yearId) === prevYearValue) : null;
      if (curr) {
        table.push({
          name: subName,
          previous: prev ? (prev.marksObtained ?? prev.marks) : '—',
          current: curr.marksObtained ?? curr.marks,
          grade: curr.grade || (curr.marksObtained >= 85 ? 'A+' : curr.marksObtained >= 70 ? 'A' : curr.marksObtained >= 60 ? 'B+' : curr.marksObtained >= 50 ? 'B' : 'C')
        });
      }
    });
    return table;
  };

  const comparisons = getSubjectComparisons();

  const chartOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { weight: '600', size: 11 } } } },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  const barData = {
    labels: comparisons.map(s => s.name),
    datasets: [
      {
        label: 'Current',
        data: comparisons.map(s => s.current),
        backgroundColor: 'rgba(37,99,235,0.7)',
        borderRadius: 4,
      },
      {
        label: 'Prev',
        data: comparisons.map(s => s.previous === '—' ? 0 : s.previous),
        backgroundColor: 'rgba(203, 213, 225, 0.6)',
        borderRadius: 4,
      },
    ],
  };

  const trendLabels = trendData.map((t: any) => (t.term ?? '').replace(/\s\d{4}$/, ''));
  const trendPoints = trendData.map((t: any) => t.percentage ?? 0);

  const lineData = {
    labels: trendLabels,
    datasets: [{
      label: 'Trend',
      data: trendPoints,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.05)',
      tension: 0.35,
      fill: true,
      pointRadius: 5,
    }],
  };

  const getImpact = () => {
    const rate = attendPct;
    const score = currentTrend ? currentPct : (comparisons.length > 0 ? (comparisons.reduce((a,b)=>a+b.current,0)/comparisons.length) : 0);
    if (rate >= 85 && score >= 70) return 'Excellent - Good attendance leads to good grades';
    if (rate >= 85 && score < 70) return 'Good attendance but needs academic improvement';
    if (rate < 75 && score < 50) return 'Low attendance affecting grades';
    if (rate < 75 && score >= 70) return 'Good grades despite low attendance';
    return (rate < 75) ? 'Low attendance detected.' : 'Attendance influence is stable.';
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Analysis" error={error} />
        <div className="container-fluid p-4 p-lg-5">
          <Card className="border shadow-none rounded-4 mb-5">
            <Card.Body className="p-4 p-md-5 bg-white rounded-4">
              <Row className="g-4 align-items-end">
                <Col xl={3}>
                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1 mb-2">Class</Form.Label>
                  <Form.Select className="py-2 border bg-light shadow-none fw-bold" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); }}>
                    <option value="">Select Class...</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name} — {c.section}</option>)}
                  </Form.Select>
                </Col>
                <Col xl={3}>
                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1 mb-2">Student</Form.Label>
                  <Form.Select className="py-2 border bg-light shadow-none fw-bold" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                    <option value="">Select Student...</option>
                    {students.filter(s => {
                       if (!selectedClass) return true;
                       const cls = classes.find(c => c._id === selectedClass);
                       return s.class === cls?.name && s.section === cls?.section;
                    }).map(s => <option key={s._id} value={s.userId?._id || s._id}>{s.name} ({s.rollNumber})</option>)}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1 mb-2">Term</Form.Label>
                  <Form.Select className="py-2 border bg-light shadow-none fw-bold" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Final">Final</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1 mb-2">Year</Form.Label>
                  <Form.Select className="py-2 border bg-light shadow-none fw-bold" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </Form.Select>
                </Col>
                <Col xl={2}>
                  <Button onClick={() => fetchAnalytics()} disabled={loading || !selectedStudent} variant="primary" className="w-100 py-2 fw-bold shadow-none text-uppercase smallest ls-1">Load</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {!performance && !loading ? (
             <div className="card shadow-none border rounded-4 py-5 text-center bg-white"><h6 className="fw-bold text-muted text-uppercase smallest ls-1 mb-0 opacity-50">Select student for performance report</h6></div>
          ) : (
            <div className="row g-4">
               <Col md={4}><Card className="border shadow-none rounded-4 p-4 bg-white"><span className="text-muted smallest fw-bold text-uppercase mb-2 opacity-50">Previous</span><h2 className="mb-0 fw-bold">{prevTrend ? `${Math.round(prevPct)}%` : '—'}</h2></Card></Col>
               <Col md={4}><Card className="border shadow-none rounded-4 p-4 bg-white"><span className="text-muted smallest fw-bold text-uppercase mb-2 opacity-50">Current</span><div className="d-flex align-items-center"><h2 className="mb-0 fw-bold">{currentTrend ? `${Math.round(currentPct)}%` : (comparisons.length > 0 ? `${Math.round(comparisons.reduce((a,b)=>a+b.current,0)/comparisons.length)}%` : '—')}</h2>{prevTrend && currentTrend && <span className={`smallest fw-bold ms-3 px-2 py-1 rounded-pill ${growthRate >= 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>{growthRate >= 0 ? '+' : ''}{growthRate}%</span>}</div></Card></Col>
               <Col md={4}><Card className="border shadow-none rounded-4 p-4 bg-white"><span className="text-muted smallest fw-bold text-uppercase mb-2 opacity-50">Attendance</span><h2 className="mb-0 fw-bold">{attendPct ? Math.round(attendPct) : 0}%</h2></Card></Col>
               <Col lg={12}><Alert variant="light" className="border shadow-none rounded-4 py-3 px-4 fw-bold text-dark smallest text-uppercase ls-1 d-flex align-items-center gap-3 bg-white"><i className="bi bi-info-circle-fill fs-5 text-secondary"></i>{getImpact()}</Alert></Col>
               <Col lg={7}><Card className="border shadow-none rounded-4 p-4 mb-4 bg-white h-100"><h6 className="fw-bold text-dark mb-4 text-uppercase smallest ls-1 border-bottom pb-2 opacity-75">Comparison View</h6><div style={{ height: '350px' }}><Bar data={barData} options={chartOpts} /></div></Card></Col>
               <Col lg={5}><Card className="border shadow-none rounded-4 overflow-hidden bg-white h-100"><div className="card-header bg-white border-bottom p-4"><h6 className="fw-bold text-dark mb-0 text-uppercase smallest ls-1 opacity-75">Marks Table</h6></div><div className="p-0 overflow-auto" style={{ maxHeight: '720px' }}><Table hover borderless className="align-middle mb-0 smallest fw-bold text-uppercase ls-1"><thead className="bg-light position-sticky top-0 z-index-1"><tr><th className="p-3 ps-4 text-muted smallest">Subject</th><th className="p-3 text-center text-muted smallest opacity-50">Prev</th><th className="p-3 text-center text-muted smallest">Curr</th><th className="p-3 text-end pe-4 text-muted smallest">Grade</th></tr></thead><tbody>{comparisons.map((s, i) => (<tr key={i} className="border-bottom"><td className="p-3 ps-4 text-dark">{s.name}</td><td className="p-3 text-center text-secondary opacity-50">{s.previous}</td><td className="p-3 text-center text-primary">{s.current}</td><td className="p-3 text-end pe-4"><Badge bg="white" text="dark" className="fw-bold smallest px-3 py-2 rounded-pill border">{s.grade}</Badge></td></tr>))}</tbody></Table></div></Card></Col>
               <Col lg={12}><Card className="border shadow-none rounded-4 p-4 bg-white"><h6 className="fw-bold text-dark mb-4 text-uppercase smallest ls-1 border-bottom pb-2 opacity-75">Cumulative Trend</h6><div style={{ height: '300px' }}><Line data={lineData} options={chartOpts} /></div></Card></Col>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;

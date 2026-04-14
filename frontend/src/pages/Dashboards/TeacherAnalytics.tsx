import React, { useState, useEffect, useCallback } from 'react';
import TeacherSidebar from '../../components/TeacherSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Badge, Form, Button, Table, Spinner } from 'react-bootstrap';

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Filler, Title, Tooltip, Legend);

const REFRESH_INTERVAL = 30_000;

const TeacherAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Final');
  const [selectedYear, setSelectedYear] = useState('2026');

  const [performance, setPerformance] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [resultData, setResultData] = useState<any>(null);
  const [classData, setClassData] = useState<any>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard/teacher', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setStudents(data.students || []);
          setClasses(data.assignedClassesList || data.classes || []);
        }
      } catch { setError('Failed to load filter options'); }
    };
    load();
  }, [token]);

  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!selectedStudent && !selectedClass) return;
    if (!silent) setLoading(true);
    setError(null);

    try {
      if (selectedStudent) {
        const [compRes, trendRes, resultRes] = await Promise.all([
          fetch(`/api/analytics/comprehensive/${selectedStudent}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/analytics/trend/${selectedStudent}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/analytics/result-with-attendance/${selectedStudent}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const comp = await compRes.json();
        const trend = await trendRes.json();
        const result = await resultRes.json();

        if (comp.success) setPerformance(comp.data.performance);
        if (trend.success) setTrendData(trend.data || []);
        if (result.success) setResultData(result.data);
        setClassData(null);
      } else if (selectedClass) {
        const res = await fetch(`/api/analytics/class/${selectedClass}?term=${selectedTerm}&year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setClassData(data.data);
        setPerformance(null); setTrendData([]); setResultData(null);
      }
      setLastUpdated(new Date());
    } catch { setError('Failed to fetch analytics data'); }
    finally { if (!silent) setLoading(false); }
  }, [selectedStudent, selectedClass, selectedTerm, selectedYear, token]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const attendPct = resultData?.attendancePercentage ?? null;
  const allSubjects = resultData?.subjects ?? performance?.subjects ?? [];
  const subjects = allSubjects.filter((s: any) => s.term === selectedTerm && String(s.year) === selectedYear);

  const sortedTrendData = [...trendData]
    .filter(t => String(t.year) === selectedYear)
    .sort((a, b) => {
      const order = ['first', 'second', 'third', 'final'];
      const aRank = order.findIndex(o => (a.term || '').toLowerCase().includes(o));
      const bRank = order.findIndex(o => (b.term || '').toLowerCase().includes(o));
      return aRank - bRank;
    });

  const termOrderList = ['First Term', 'Second Term', 'Final'];
  const selectedTermIndex = termOrderList.indexOf(selectedTerm);
  const visibleTrendData = sortedTrendData.filter(t => termOrderList.indexOf((t.term || '').replace(/\s\d{4}$/, '')) <= selectedTermIndex);

  const prevTerm = visibleTrendData.length >= 2 ? visibleTrendData[visibleTrendData.length - 2] : null;
  const currentTerm = visibleTrendData.length >= 1 ? visibleTrendData[visibleTrendData.length - 1] : null;
  const termDiff = prevTerm && currentTerm ? +(currentTerm.percentage - prevTerm.percentage).toFixed(1) : null;

  const barData = {
    labels: subjects.map((s: any) => s.name || s.subject),
    datasets: [
      { label: 'Marks', data: subjects.map((s: any) => s.marks ?? s.obtainedMarks ?? 0), backgroundColor: '#2563eb', borderRadius: 4 },
      { label: 'Average', data: subjects.map((s: any) => s.avgMarks ?? s.classAvg ?? 0), backgroundColor: '#cbd5e1', borderRadius: 4 }
    ],
  };

  const lineData = {
    labels: visibleTrendData.map((t: any) => (t.term ?? '').replace(/\s\d{4}$/, '')),
    datasets: [{
      label: 'Progress',
      data: visibleTrendData.map((t: any) => t.percentage ?? t.score ?? 0),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.05)',
      tension: 0.35,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: '#2563eb',
    }],
  };

  const chartOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 12, weight: '600' }, padding: 20 } },
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <TeacherSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Analytics" error={error} />

        <div className="container-fluid p-4 p-lg-5">
           <div className="card shadow-sm border-0 rounded-4 mb-5">
             <div className="card-body p-4">
               <Row className="g-4 align-items-end">
                 <Col xl={3}>
                   <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Class</Form.Label>
                   <Form.Select className="py-2 border-light-dark shadow-none" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); }}>
                     <option value="">Choose class...</option>
                     {classes.map(c => <option key={c._id} value={c._id}>{c.name} — {c.section}</option>)}
                   </Form.Select>
                 </Col>
                 <Col xl={3}>
                   <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Student</Form.Label>
                   <Form.Select className="py-2 border-light-dark shadow-none" value={selectedStudent} onChange={e => { setSelectedStudent(e.target.value); setSelectedClass(''); }}>
                     <option value="">Choose student...</option>
                     {students.filter(s => {
                       if (!selectedClass) return true;
                       const cls = classes.find(c => c._id === selectedClass);
                       return cls ? (`${s.class} — ${s.section}` === `${cls.name} — ${cls.section}`) : true;
                     }).map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>)}
                   </Form.Select>
                 </Col>
                 <Col xl={2}>
                   <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Term</Form.Label>
                   <Form.Select className="py-2 border-light-dark shadow-none" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
                     <option value="First Term">First Term</option>
                     <option value="Second Term">Second Term</option>
                     <option value="Final">Final</option>
                   </Form.Select>
                 </Col>
                 <Col xl={2}>
                   <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Year</Form.Label>
                   <Form.Select className="py-2 border-light-dark shadow-none" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                     <option value="2025">2025</option>
                     <option value="2026">2026</option>
                   </Form.Select>
                 </Col>
                 <Col xl={2}>
                    <Button variant="primary" className="w-100 py-2 fw-bold shadow-sm rounded-pill ls-1 smallest text-uppercase" onClick={() => fetchAnalytics()} disabled={loading || (!selectedStudent && !selectedClass)}>
                      {loading ? 'Syncing...' : 'Refresh'}
                    </Button>
                 </Col>
               </Row>
             </div>
           </div>

           {!performance && !classData && !loading && (
             <div className="card shadow-sm border-0 rounded-4 py-5 text-center bg-white">
               <div className="card-body">
                 <h4 className="fw-bold">Ready to Analyze</h4>
                 <p className="text-secondary small">Select a student or a class above to see performance insights.</p>
               </div>
             </div>
           )}

           {performance && (
             <Row className="g-4">
               <Col md={4}>
                 <Card className="h-100 shadow-sm border-0 rounded-4 p-4">
                   <span className="smallest text-muted fw-bold text-uppercase mb-2">Previous Average</span>
                   <h2 className="mb-0 fw-bold">{prevTerm ? `${Math.round(prevTerm.percentage)}%` : '—'}</h2>
                   <div className="text-muted small mt-1">{prevTerm?.term || 'No history'}</div>
                 </Card>
               </Col>
               <Col md={4}>
                 <Card className="h-100 shadow-sm border-0 rounded-4 p-4">
                   <span className="smallest text-muted fw-bold text-uppercase mb-2">Current Average</span>
                   <h2 className="mb-0 fw-bold text-primary">{currentTerm ? `${Math.round(currentTerm.percentage)}%` : '—'}</h2>
                   <div className={`smallest fw-bold mt-1 ${ (termDiff || 0) >= 0 ? 'text-success' : 'text-danger' } text-uppercase ls-1`}>
                      {(termDiff || 0) >= 0 ? 'Growth' : 'Decline'} ({termDiff || 0}%)
                   </div>
                 </Card>
               </Col>
               <Col md={4}>
                 <Card className="h-100 shadow-sm border-0 rounded-4 p-4">
                   <span className="smallest text-muted fw-bold text-uppercase mb-2">Attendance</span>
                   <h2 className="mb-0 fw-bold">{attendPct ? `${Math.round(attendPct)}%` : '—'}</h2>
                   <div className={`smallest fw-bold mt-1 ${ (attendPct || 0) >= 75 ? 'text-success' : 'text-danger' } text-uppercase ls-1`}>
                     {(attendPct || 0) >= 75 ? 'Good' : 'Low'}
                   </div>
                 </Card>
               </Col>

               <Col lg={8}>
                 <Card className="shadow-sm border-0 rounded-4 p-4 mb-4">
                   <h6 className="fw-bold mb-4 text-uppercase smallest ls-1 text-muted">Marks Breakdown</h6>
                   <div style={{ height: '350px' }}><Bar data={barData} options={chartOpts} /></div>
                 </Card>
                 <Card className="shadow-sm border-0 rounded-4 p-4">
                   <h6 className="fw-bold mb-4 text-uppercase smallest ls-1 text-muted">Term Progress</h6>
                   <div style={{ height: '350px' }}><Line data={lineData} options={chartOpts} /></div>
                 </Card>
               </Col>

               <Col lg={4}>
                 <Card className="shadow-sm border-0 rounded-4 p-4 mb-4">
                    <h6 className="fw-bold text-uppercase smallest mb-3 text-muted">Summary</h6>
                    <p className="small mb-4 lh-lg text-dark">
                      Student is currently at <strong>{currentTerm?.percentage}%</strong>. 
                      {termDiff && termDiff > 0 ? " Showing steady growth." : " Needs more focus."}
                    </p>
                    <div className="bg-light p-3 rounded-3 border">
                      <div className="smallest fw-bold text-uppercase mb-1 text-secondary">Attendance</div>
                      <div className="small text-dark">{attendPct && attendPct < 75 ? "Warning: Low presence." : "Good attendance."}</div>
                    </div>
                 </Card>

                 <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                   <div className="p-3 border-bottom bg-white fw-bold smallest text-uppercase ls-1">Subjects</div>
                   <div className="p-0">
                     {subjects.map((s: any, idx: number) => (
                       <div key={idx} className="d-flex align-items-center justify-content-between p-3 border-bottom last-border-0">
                         <div>
                           <div className="fw-bold small text-dark">{s.subject ?? s.name}</div>
                           <div className="text-muted smallest">{s.marksObtained}/{s.totalMarks}</div>
                         </div>
                         <div className={`fw-bold small ${ (s.percentage) >= 75 ? 'text-success' : 'text-dark' }`}>{s.percentage}%</div>
                       </div>
                     ))}
                   </div>
                 </Card>
               </Col>
             </Row>
           )}

           {classData && (
             <Row className="g-4">
               <Col md={3}><Card className="shadow-sm border-0 rounded-4 p-4"><span className="smallest fw-bold text-muted text-uppercase mb-2">Class Average</span><h3 className="fw-bold mb-0">{classData.averageScore?.toFixed(1)}%</h3></Card></Col>
               <Col md={3}><Card className="shadow-sm border-0 rounded-4 p-4"><span className="smallest fw-bold text-muted text-uppercase mb-2">Pass Rate</span><h3 className="fw-bold mb-0">{classData.passRate?.toFixed(1)}%</h3></Card></Col>
               <Col md={3}><Card className="shadow-sm border-0 rounded-4 p-4"><span className="smallest fw-bold text-muted text-uppercase mb-2">Top Student</span><div className="fw-bold text-truncate small">{classData.topper?.studentName || '—'}</div></Card></Col>
               <Col md={3}><Card className="shadow-sm border-0 rounded-4 p-4"><span className="smallest fw-bold text-muted text-uppercase mb-2">Total Students</span><h3 className="fw-bold mb-0">{classData.totalStudents}</h3></Card></Col>

               <Col lg={8}>
                 <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                   <div className="p-4 border-bottom bg-white"><h6 className="fw-bold mb-0 text-uppercase smallest ls-1">Student Ranking</h6></div>
                   <Table hover borderless className="align-middle mb-0">
                     <thead className="bg-light">
                       <tr>
                         <th className="px-4 py-3 smallest fw-bold text-secondary text-uppercase">Rank</th>
                         <th className="px-4 py-3 smallest fw-bold text-secondary text-uppercase">Student</th>
                         <th className="px-4 py-3 smallest fw-bold text-secondary text-uppercase">Average</th>
                         <th className="px-4 py-3 smallest fw-bold text-secondary text-uppercase text-end">Result</th>
                       </tr>
                     </thead>
                     <tbody>
                       {classData.studentPerformance?.map((s: any, i: number) => (
                         <tr key={s.studentId} className="border-bottom border-light">
                           <td className="px-4 py-3 fw-bold text-muted small">#{i + 1}</td>
                           <td className="px-4 py-3 fw-bold text-dark small">{s.studentName}</td>
                           <td className="px-4 py-3">
                             <div className="d-flex align-items-center gap-3">
                               <div className="progress flex-grow-1" style={{ height: '6px' }}><div className="progress-bar bg-primary rounded-pill" style={{ width: `${s.average}%` }}></div></div>
                               <span className="smallest fw-bold">{s.average}%</span>
                             </div>
                           </td>
                           <td className="px-4 py-3 text-end"><Badge bg={s.passed ? 'success-soft' : 'danger-soft'} text={s.passed ? 'success' : 'danger'} className="rounded-pill px-3 py-2 border fw-bold smallest">{s.passed ? 'PASSED' : 'FAIL'}</Badge></td>
                         </tr>
                       ))}
                     </tbody>
                   </Table>
                 </Card>
               </Col>

               <Col lg={4}>
                 <Card className="shadow-sm border-0 rounded-4 p-4">
                   <h6 className="fw-bold mb-4 text-uppercase smallest ls-1 text-muted">Subject Averages</h6>
                   <div style={{ height: '300px' }}>
                     <Bar 
                       data={{
                         labels: classData.subjectAverages?.map((sa: any) => sa.subject),
                         datasets: [{ label: 'Avg %', data: classData.subjectAverages?.map((sa: any) => sa.average), backgroundColor: '#2563eb', borderRadius: 4 }]
                       }} 
                       options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } } }} 
                     />
                   </div>
                 </Card>
               </Col>
             </Row>
           )}
        </div>
      </main>
    </div>
  );
};

export default TeacherAnalytics;

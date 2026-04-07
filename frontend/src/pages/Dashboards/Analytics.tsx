import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

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

const REFRESH_INTERVAL = 30_000;

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses]   = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass,   setSelectedClass]   = useState('');
  const [selectedTerm,    setSelectedTerm]    = useState('Final');
  const [selectedYear,    setSelectedYear]    = useState(new Date().getFullYear().toString());

  const [performance,      setPerformance]      = useState<any>(null);
  const [trendData,        setTrendData]        = useState<any[]>([]);

  const [resultData,       setResultData]       = useState<any>(null);
  const [classData,        setClassData]        = useState<any>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, cRes] = await Promise.all([
          fetch('/api/users',   { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const uData = await uRes.json();
        const cData = await cRes.json();
        if (uData.success) setStudents(uData.users.filter((u: any) => u.role === 'student'));
        if (cData.classes) setClasses(cData.classes);
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
          fetch(`/api/analytics/comprehensive/${selectedStudent}`,          { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/analytics/trend/${selectedStudent}`,                  { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/analytics/result-with-attendance/${selectedStudent}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const comp   = await compRes.json();
        const trend  = await trendRes.json();
        const result = await resultRes.json();

        if (comp.success)   { setPerformance(comp.data.performance); }
        if (trend.success)  setTrendData(trend.data || []);
        if (result.success) setResultData(result.data);
        setClassData(null);

      } else if (selectedClass) {
        const res  = await fetch(`/api/analytics/class/${selectedClass}?term=${selectedTerm}&year=${selectedYear}`, {
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

  useEffect(() => {
    if (!selectedStudent && !selectedClass) return;
    const id = setInterval(() => fetchAnalytics(true), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchAnalytics, selectedStudent, selectedClass]);

  const attendPct     = resultData?.attendancePercentage ?? null;
  const allSubjects   = resultData?.subjects ?? performance?.subjects ?? [];
  const subjects      = allSubjects.filter((s: any) => s.term === selectedTerm && String(s.year) === selectedYear);

  const sortedTrendData = [...trendData]
    .filter(t => String(t.year) === selectedYear)
    .sort((a, b) => {
      const order = ['first', 'second', 'third', 'final'];
      const aLower = (a.term || '').toLowerCase();
      const bLower = (b.term || '').toLowerCase();
      const aRank = order.findIndex(o => aLower.includes(o));
      const bRank = order.findIndex(o => bLower.includes(o));
      if (aRank !== -1 && bRank !== -1) return aRank - bRank;
      return aLower.localeCompare(bLower);
  });

  const termOrderList = ['First Term', 'Second Term', 'Final'];
  const selectedTermIndex = termOrderList.indexOf(selectedTerm);
  const visibleTrendData = sortedTrendData.filter(t => {
      const tTerm = (t.term || '').replace(/\s\d{4}$/, '');
      return termOrderList.indexOf(tTerm) <= selectedTermIndex;
  });

  const prevTerm    = visibleTrendData.length >= 2 ? visibleTrendData[visibleTrendData.length - 2] : null;
  const currentTerm = visibleTrendData.length >= 1 ? visibleTrendData[visibleTrendData.length - 1] : null;
  const termDiff    = prevTerm && currentTerm ? +(currentTerm.percentage - prevTerm.percentage).toFixed(1) : null;

  const barData = {
    labels: subjects.map((s: any) => s.name || s.subject),
    datasets: [
      {
        label: 'Obtained Score',
        data: subjects.map((s: any) => s.marks ?? s.obtainedMarks ?? 0),
        backgroundColor: 'rgba(37,99,235,0.7)',
        borderRadius: 4,
      },
      {
        label: 'Peer Average',
        data: subjects.map((s: any) => s.avgMarks ?? s.classAvg ?? 0),
        backgroundColor: 'rgba(203, 213, 225, 0.6)',
        borderRadius: 4,
      },
    ],
  };

  const termScores   = visibleTrendData.map((t: any) => t.percentage ?? t.score ?? 0);
  const termLabels   = visibleTrendData.map((t: any) => (t.term ?? '').replace(/\s\d{4}$/, ''));

  const lineData = {
    labels: termLabels,
    datasets: [{
      label: 'Success Trajectory',
      data: termScores,
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
      tooltip: { padding: 12, cornerRadius: 8 },
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  const hasData = performance || classData;

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Performance Analytics" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Dynamic Control Panel ── */}
          <div className="card shadow-sm border-0 rounded-4 mb-5">
            <div className="card-body p-4">
              <div className="row g-4 align-items-end">
                <div className="col-12 col-xl-4">
                  <label className="form-label small fw-bold text-secondary text-uppercase mb-2">Subject Focus (Student)</label>
                  <select 
                    className="form-select border-light-dark shadow-none py-2"
                    value={selectedStudent}
                    onChange={e => { setSelectedStudent(e.target.value); setSelectedClass(''); }}
                  >
                    <option value="">Choose a student profile...</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                  </select>
                </div>

                <div className="col-12 col-xl-4">
                  <label className="form-label small fw-bold text-secondary text-uppercase mb-2">Cohort View (Class)</label>
                  <select 
                    className="form-select border-light-dark shadow-none py-2"
                    value={selectedClass}
                    onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
                  >
                    <option value="">Choose a classroom cohort...</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name} — {c.section}</option>)}
                  </select>
                </div>

                <div className="col-12 col-md-6 col-md-2">
                  <label className="form-label small fw-bold text-secondary text-uppercase mb-2">Academic Term</label>
                  <select className="form-select border-light-dark shadow-none py-2" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Final">Final Examination</option>
                  </select>
                </div>

                <div className="col-12 col-md-6 col-md-2">
                  <label className="form-label small fw-bold text-secondary text-uppercase mb-2">Year</label>
                  <select className="form-select border-light-dark shadow-none py-2" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>

                <div className="col-12 col-md-6 col-xl-2">
                  <div className="d-flex flex-column align-items-xl-end">
                    <button 
                      onClick={() => fetchAnalytics()}
                      disabled={loading || (!selectedStudent && !selectedClass)}
                      className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                    >
                      {loading ? 'Syncing...' : 'Refresh Records'}
                    </button>
                    {lastUpdated && (
                      <span className="smaller text-muted mt-2 d-none d-xl-block">
                        Sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── State Handling ── */}
          {!hasData && !loading && (
            <div className="card shadow-sm border-0 rounded-4 py-5 text-center">
              <div className="card-body">
                <div className="bg-light d-inline-flex p-4 rounded-circle mb-4 text-primary opacity-50">
                   <div style={{ width: '48px', height: '48px', border: '5px solid currentColor', borderRadius: '50%', borderTopColor: 'transparent' }}></div>
                </div>
                <h4 className="fw-bold">Ready to Analyze</h4>
                <p className="text-secondary mx-auto" style={{ maxWidth: '400px' }}>
                  Please select a student profile or a class cohort from the panel above to generate real-time performance insights.
                </p>
              </div>
            </div>
          )}

          {/* ── Student Perspective ── */}
          {performance && (
            <div className="row g-4">
              <div className="col-12">
                <div className="row g-4 mb-4">
                  <div className="col-12 col-md-4">
                    <div className="card h-100 shadow-sm border-0 rounded-4 p-4 border-start border-4 border-secondary">
                      <span className="text-muted smaller fw-bold text-uppercase mb-2">Previous Average</span>
                      <h2 className="mb-0 fw-bold">{prevTerm ? `${Math.round(prevTerm.percentage)}%` : '—'}</h2>
                      <div className="text-muted small mt-1">{prevTerm?.term || 'No history'}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="card h-100 shadow-sm border-0 rounded-4 p-4 border-start border-4 border-primary">
                      <span className="text-muted smaller fw-bold text-uppercase mb-2">Active Average</span>
                      <h2 className="mb-0 fw-bold text-primary">{currentTerm ? `${Math.round(currentTerm.percentage)}%` : '—'}</h2>
                      <div className={`small fw-bold mt-1 ${ (termDiff || 0) >= 0 ? 'text-success' : 'text-danger' }`}>
                         {(termDiff || 0) >= 0 ? 'Growth' : 'Decline'} ({termDiff || 0}%)
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="card h-100 shadow-sm border-0 rounded-4 p-4 border-start border-4 border-warning">
                      <span className="text-muted smaller fw-bold text-uppercase mb-2">Attendance State</span>
                      <h2 className="mb-0 fw-bold">{attendPct ? `${Math.round(attendPct)}%` : '—'}</h2>
                      <div className={`small fw-bold mt-1 ${ (attendPct || 0) >= 75 ? 'text-success' : 'text-danger' }`}>
                        {(attendPct || 0) >= 75 ? 'Optimal Presence' : 'Critical Low'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Visual Intelligence ── */}
              <div className="col-12 col-lg-8">
                <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                  <h5 className="fw-bold mb-4">Relative Academic Position</h5>
                  <div style={{ height: '350px' }}>
                    <Bar data={barData} options={chartOpts} />
                  </div>
                </div>

                <div className="card shadow-sm border-0 rounded-4 p-4">
                  <h5 className="fw-bold mb-4">Success Pathway (Term-over-Term)</h5>
                  <div style={{ height: '350px' }}>
                    <Line data={lineData} options={chartOpts} />
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-primary text-white">
                  <h6 className="fw-bold text-uppercase smaller mb-3 opacity-75">Intelligence Summary</h6>
                  <p className="small mb-4 lh-lg">
                    The subject is currently performing at <strong>{currentTerm?.percentage}%</strong>. 
                    {termDiff && termDiff > 0 ? " Showing steady academic growth." : " Recent results indicate a need for focus."}
                  </p>
                  <div className="bg-white bg-opacity-10 p-3 rounded-3 mb-3 border border-white border-opacity-10">
                    <div className="smaller fw-bold text-uppercase mb-1">Attendance Impact</div>
                    <div className="small fw-medium">
                      {attendPct && attendPct < 75 ? "Warning: Low presence is hindering capability." : "Full attendance is reinforcing concepts."}
                    </div>
                  </div>
                </div>

                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                  <div className="card-header bg-white border-bottom p-3 fw-bold small text-uppercase">Subject Breakdown</div>
                  <div className="p-0">
                    {subjects.map((s: any, idx: number) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between p-3 border-bottom last-border-0 hover-bg-light transition-base">
                        <div>
                          <div className="fw-bold small text-dark">{s.subject ?? s.name}</div>
                          <div className="text-muted smaller">{s.grade} - {s.marksObtained}/{s.totalMarks}</div>
                        </div>
                        <div className={`fw-bold small ${ (s.rawPercentage || s.percentage) >= 75 ? 'text-success' : 'text-dark' }`}>
                          {s.rawPercentage || s.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Cohort Perspective ── */}
          {classData && (
            <div className="row g-4">
              <div className="col-12 col-md-3">
                <div className="card shadow-sm border-0 rounded-4 p-4 border-start border-4 border-primary">
                  <span className="text-muted smaller fw-bold text-uppercase mb-2">Class Median</span>
                  <h3 className="fw-bold mb-0">{classData.averageScore?.toFixed(1)}%</h3>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="card shadow-sm border-0 rounded-4 p-4 border-start border-4 border-success">
                  <span className="text-muted smaller fw-bold text-uppercase mb-2">Success Rate</span>
                  <h3 className="fw-bold mb-0">{classData.passRate?.toFixed(1)}%</h3>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="card shadow-sm border-0 rounded-4 p-4 border-start border-4 border-warning">
                  <span className="text-muted smaller fw-bold text-uppercase mb-2">Elite Rank (#1)</span>
                  <div className="fw-bold text-truncate text-dark small">{classData.topper?.studentName || '—'}</div>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="card shadow-sm border-0 rounded-4 p-4 border-start border-4 border-secondary">
                  <span className="text-muted smaller fw-bold text-uppercase mb-2">Cohort Size</span>
                  <h3 className="fw-bold mb-0">{classData.totalStudents}</h3>
                </div>
              </div>

              <div className="col-12 col-lg-8">
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                  <div className="card-header bg-white border-bottom p-4">
                    <h5 className="fw-bold mb-0 text-dark">Learner Performance Board</h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table hover-bg-light mb-0 align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Standing</th>
                          <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Learner Identity</th>
                          <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Mean Evaluation</th>
                          <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary text-end">Eligibility</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classData.studentPerformance?.map((s: any, i: number) => (
                          <tr key={s.studentId}>
                            <td className="px-4 py-3 fw-bold text-muted">#{i + 1}</td>
                            <td className="px-4 py-3 fw-bold text-dark">{s.studentName}</td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center gap-3">
                                <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                  <div className="progress-bar bg-primary rounded-pill" style={{ width: `${s.average}%` }}></div>
                                </div>
                                <span className="small fw-bold">{s.average}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-end">
                              <span className={`badge rounded-pill fw-bold ${s.passed ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                                {s.passed ? 'PASSED' : 'RETAKE'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                  <h5 className="fw-bold mb-4">Curriculum Averages</h5>
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={{
                        labels: classData.subjectAverages?.map((sa: any) => sa.subject),
                        datasets: [{
                          label: 'Class Avg %',
                          data: classData.subjectAverages?.map((sa: any) => sa.average),
                          backgroundColor: 'rgba(37,99,235,0.7)',
                          borderRadius: 4
                        }]
                      }} 
                      options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } } }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;


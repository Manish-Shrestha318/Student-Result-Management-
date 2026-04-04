import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import {
  TrendingUp, TrendingDown, User, Layers,
  AlertTriangle, RefreshCw, Activity
} from 'lucide-react';
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

const REFRESH_INTERVAL = 30_000; // 30-second auto-refresh

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

  // All data buckets
  const [performance,      setPerformance]      = useState<any>(null);
  const [trendData,        setTrendData]        = useState<any[]>([]);
  const [attendanceImpact, setAttendanceImpact] = useState<any>(null);
  const [subjectAnalysis,  setSubjectAnalysis]  = useState<any>(null);
  const [resultData,       setResultData]       = useState<any>(null);  // attendance-aware result
  const [classData,        setClassData]        = useState<any>(null);

  const token = localStorage.getItem('token');

  // ── Bootstrap dropdowns ──────────────────────────────────────────────
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
  }, []);

  // ── Core fetch ────────────────────────────────────────────────────────
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

        if (comp.success)   { setPerformance(comp.data.performance); setSubjectAnalysis(comp.data.subjectAnalysis); setAttendanceImpact(comp.data.attendanceImpact); }
        if (trend.success)  setTrendData(trend.data || []);
        if (result.success) setResultData(result.data);
        setClassData(null);

      } else if (selectedClass) {
        const res  = await fetch(`/api/analytics/class/${selectedClass}?term=${selectedTerm}&year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setClassData(data.data);
        setPerformance(null); setTrendData([]); setAttendanceImpact(null); setSubjectAnalysis(null); setResultData(null);
      }
      setLastUpdated(new Date());
    } catch { setError('Failed to fetch analytics data'); }
    finally { if (!silent) setLoading(false); }
  }, [selectedStudent, selectedClass, token]);

  // ── Auto-fetch when selection changes ────────────────────────────────
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics, selectedTerm, selectedYear]);

  // ── Auto-refresh every 30 s ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedStudent && !selectedClass) return;
    const id = setInterval(() => fetchAnalytics(true), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchAnalytics, selectedStudent, selectedClass]);

  // ── Derived stats ────────────────────────────────────────────────────  // Derived stats from the real eligibility result
  const attendPct     = resultData?.attendancePercentage ?? null;
  const allSubjects   = resultData?.subjects ?? performance?.subjects ?? [];
  const subjects      = allSubjects.filter((s: any) => s.term === selectedTerm && String(s.year) === selectedYear);

  // Previous-vs-current term comparison logic based on selected term
  const sortedTrendData = [...trendData]
    .filter(t => String(t.year) === selectedYear) // only consider the selected year's trend
    .sort((a, b) => {
      const order = ['first', 'second', 'third', 'final'];
      const aLower = (a.term || '').toLowerCase();
      const bLower = (b.term || '').toLowerCase();
      const aRank = order.findIndex(o => aLower.includes(o));
      const bRank = order.findIndex(o => bLower.includes(o));
      if (aRank !== -1 && bRank !== -1) return aRank - bRank;
      return aLower.localeCompare(bLower);
  });

  // Keep only terms up to the selected term
  const termOrderList = ['First Term', 'Second Term', 'Final'];
  const selectedTermIndex = termOrderList.indexOf(selectedTerm);
  const visibleTrendData = sortedTrendData.filter(t => {
      const tTerm = (t.term || '').replace(/\s\d{4}$/, '');
      return termOrderList.indexOf(tTerm) <= selectedTermIndex;
  });

  // Calculate prev/current from visible sequence
  const prevTerm    = visibleTrendData.length >= 2 ? visibleTrendData[visibleTrendData.length - 2] : null;
  const currentTerm = visibleTrendData.length >= 1 ? visibleTrendData[visibleTrendData.length - 1] : null;
  const termDiff    = prevTerm && currentTerm ? +(currentTerm.percentage - prevTerm.percentage).toFixed(1) : null;

  // ── Chart configs ────────────────────────────────────────────────────
  const barData = {
    labels: subjects.map((s: any) => s.name || s.subject),
    datasets: [
      {
        label: 'Current Marks',
        data: subjects.map((s: any) => s.marks ?? s.obtainedMarks ?? 0),
        backgroundColor: 'rgba(37,99,235,0.75)',
        borderRadius: 6,
      },
      {
        label: 'Class Average',
        data: subjects.map((s: any) => s.avgMarks ?? s.classAvg ?? 0),
        backgroundColor: 'rgba(156,163,175,0.4)',
        borderRadius: 6,
      },
    ],
  };

  // Term comparison bar
  const termLabels   = visibleTrendData.map((t: any) => {
    const rawLabel = t.term ?? t.label ?? '';
    // Strip trailing year (e.g. " 2024" or " 2025")
    return rawLabel.replace(/\s\d{4}$/, '');
  });
  const termScores   = visibleTrendData.map((t: any) => t.percentage ?? t.score ?? 0);
  const termColors   = termScores.map((_: number, i: number) =>
    i === termScores.length - 1 ? 'rgba(37,99,235,0.8)' : 'rgba(156,163,175,0.45)'
  );

  const termBarData = {
    labels: termLabels,
    datasets: [{
      label: '% Score per Term',
      data: termScores,
      backgroundColor: termColors,
      borderRadius: 6,
    }],
  };

  const lineData = {
    labels: termLabels,
    datasets: [{
      label: 'Performance %',
      data: termScores,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.08)',
      tension: 0.4,
      fill: true,
      pointRadius: 6,
      pointHoverRadius: 9,
      pointBackgroundColor: '#2563eb',
    }],
  };



  const chartOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8 },
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  const hasData = performance || classData;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Performance Analytics" error={error} />

        <div style={{ padding: '2.5rem' }}>

          {/* ── Filter bar ── */}
          <div className="card" style={{ marginBottom: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>Filter by Student</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <select
                  value={selectedStudent}
                  onChange={e => { setSelectedStudent(e.target.value); setSelectedClass(''); }}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#f8fafc' }}
                >
                  <option value="">Select Student...</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>Or Filter by Class</label>
              <div style={{ position: 'relative' }}>
                <Layers size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <select
                  value={selectedClass}
                  onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#f8fafc' }}
                >
                  <option value="">Select Class...</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name} — {c.section}</option>)}
                </select>
              </div>
            </div>

            <div style={{ width: '150px' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>Term</label>
              <select
                value={selectedTerm}
                onChange={e => setSelectedTerm(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '100px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff' }}
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Final">Final</option>
              </select>
            </div>

            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>Year</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '100px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff' }}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            {/* Live indicator + manual refresh */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
              {lastUpdated && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {loading && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--primary)' }}>
                    <Activity size={14} className="animate-pulse" /> Syncing...
                  </span>
                )}
                <button
                  onClick={() => fetchAnalytics()}
                  disabled={loading || (!selectedStudent && !selectedClass)}
                  style={{ padding: '0.7rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>
            </div>
          </div>

          {/* ── Empty state ── */}
          {!hasData && !loading && (
            <div className="card" style={{ height: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Activity size={38} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Select a Student or Class</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '380px' }}>Data loads instantly — no button press needed. Analytics auto-refresh every 30 seconds.</p>
            </div>
          )}

          {/* ── Student analytics ── */}
          {performance && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Performance & Growth Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ borderLeft: '5px solid #64748b' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.4rem' }}>Previous Term Avg</p>
                  <h3 style={{ fontSize: '1.8rem', margin: '0' }}>{prevTerm ? `${Math.round(prevTerm.percentage)}%` : 'N/A'}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Term: {prevTerm?.term || 'None'}</span>
                </div>
                <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.4rem' }}>Current Term Avg</p>
                  <h3 style={{ fontSize: '1.8rem', margin: '0' }}>{currentTerm ? `${Math.round(currentTerm.percentage)}%` : 'N/A'}</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: (termDiff || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                    {(termDiff || 0) >= 0 ? '↑ Improving' : '↓ Declining'} ({(termDiff || 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="card" style={{ borderLeft: '5px solid #f59e0b' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.4rem' }}>Attendance Overall</p>
                  <h3 style={{ fontSize: '1.8rem', margin: '0' }}>{attendPct ? `${Math.round(attendPct)}%` : '—'}</h3>
                  <span style={{ fontSize: '0.75rem', color: (attendPct || 0) < 75 ? '#dc2626' : '#16a34a' }}>
                    {(attendPct || 0) < 75 ? '⚠ Warning: Impacting Performance' : '✓ Sufficient for Learning'}
                  </span>
                </div>
              </div>

              {/* Explicit Comparison & Attendance Impact Section */}
              <div className="card" style={{ background: '#f8fafc' }}>
                <h3 style={{ margin: '0 0 1.5rem' }}>Term Performance Analysis & Attendance Impact</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  
                  {/* Detailed Comparison Text */}
                  <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={18} color="var(--primary)" /> Academic Progression
                    </h4>
                    <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                      In the <strong>{prevTerm?.term || 'previous term'}</strong>, the student achieved a score of <strong>{prevTerm ? prevTerm.percentage : '0'}%</strong>. 
                      In the <strong>{currentTerm?.term || 'current term'}</strong>, this has {termDiff && termDiff > 0 ? "risen" : "dropped"} to <strong>{currentTerm ? currentTerm.percentage : '0'}%</strong>.
                    </p>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: (termDiff || 0) >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: (termDiff || 0) >= 0 ? '#166534' : '#991b1b' }}>
                        Conclusion: {termDiff && termDiff > 0 ? "The student is showing consistent improvement." : "Performance has noticeably decreased."}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Correlation Text */}
                  <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={18} color="#f59e0b" /> Attendance correlation
                    </h4>
                    <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                      The current attendance rate is <strong>{attendPct?.toFixed(1)}%</strong>. 
                      {attendPct && attendPct < 75 && termDiff && termDiff < 0 ? (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}> ⚠ Analysis confirms that the drop in performance is heavily correlated with low attendance and absence in class sessions.</span>
                      ) : attendPct && attendPct >= 90 ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}> ✓ Excellent attendance is supporting the student's learning outcomes.</span>
                      ) : (
                        <span> Attendance is at a moderate level and is contributing to steady performance.</span>
                      )}
                    </p>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fefce8', borderRadius: '8px', border: '1px solid #fef08a' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#854d0e' }}>
                         Observer Note: {attendPct && attendPct < 75 ? "Absence from class has directly resulted in missed concepts and lower test scores." : "The student is engaged and present in class."}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Subject-wise Comparison Bar Chart */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Subject-wise Comparison</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Student vs Class Average</span>
                  </div>
                  <div style={{ height: '300px' }}>
                    <Bar data={barData} options={chartOpts} />
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ margin: '0 0 1.5rem' }}>Performance Comparison Trend</h3>
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={termBarData} 
                      options={{ 
                        ...chartOpts, 
                        plugins: { ...chartOpts.plugins, legend: { display: false } },
                        scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, title: { display: true, text: 'Final Score %' } } }
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Term comparison */}
              {trendData.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Bar comparison */}
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0 }}>Term Comparison</h3>
                      {termDiff !== null && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: termDiff >= 0 ? '#16a34a' : '#dc2626' }}>
                          {termDiff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          {termDiff >= 0 ? '+' : ''}{termDiff}% from last term
                        </span>
                      )}
                    </div>
                    <div style={{ height: '260px' }}>
                      <Bar data={termBarData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } } }} />
                    </div>
                    {/* Term breakdown table */}
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: 'var(--text-secondary)' }}>
                            <th style={{ textAlign: 'left', padding: '0.4rem 0' }}>Term</th>
                            <th style={{ textAlign: 'right', padding: '0.4rem 0' }}>Score</th>
                            <th style={{ textAlign: 'right', padding: '0.4rem 0' }}>Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trendData.map((t: any, i: number) => {
                            const prev = trendData[i - 1];
                            const diff = prev ? +((t.percentage - prev.percentage).toFixed(1)) : null;
                            return (
                              <tr key={i} style={{ borderTop: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.5rem 0', fontWeight: i === trendData.length - 1 ? 700 : 400 }}>{t.term ?? t.label}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{(t.percentage ?? 0).toFixed(1)}%</td>
                                <td style={{ textAlign: 'right', color: diff === null ? 'var(--text-secondary)' : diff >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                  {diff === null ? '—' : `${diff >= 0 ? '+' : ''}${diff}%`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Line trend */}
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0 }}>Performance Trend</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All terms</span>
                    </div>
                    <div style={{ height: '260px' }}>
                      <Line data={lineData} options={chartOpts} />
                    </div>
                  </div>
                </div>
              )}

              {/* Attendance impact correlation analysis */}
              {attendanceImpact?.monthlyAnalysis && attendanceImpact.monthlyAnalysis.length > 0 && (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Attendance vs Performance Analytics</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Overall Correlation: <strong style={{ color: attendanceImpact.summary?.overallImpact === 'Positive' ? '#16a34a' : attendanceImpact.summary?.overallImpact === 'Negative' ? '#dc2626' : 'inherit' }}>{attendanceImpact.summary?.overallImpact}</strong>
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: '-1rem' }}>
                    Insight: {attendanceImpact.summary?.recommendation}
                  </p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Month/Year</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Monthly Attendance</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Monthly Avg Score</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Behavioral Impact / Correlation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceImpact.monthlyAnalysis.map((a: any, i: number) => {
                          const attVal = parseFloat(a.attendanceRate);
                          const ok = attVal >= 75;
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{a.month} {a.year}</td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ width: '60px', height: '6px', borderRadius: '50px', background: '#e2e8f0' }}>
                                    <div style={{ width: `${Math.min(attVal, 100)}%`, height: '100%', borderRadius: '50px', background: ok ? '#16a34a' : '#dc2626' }} />
                                  </div>
                                  <span style={{ fontWeight: 600, color: ok ? '#16a34a' : '#dc2626' }}>{a.attendanceRate}</span>
                                </div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: a.avgScore !== 'No data' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                {a.avgScore !== 'No data' ? `${a.avgScore}%` : '—'}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: a.impact.includes('⚠️') ? '#dc2626' : 'var(--text-primary)' }}>
                                {a.impact}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Term Marks Breakdown */}
              {subjects.length > 0 && (
                <div className="card">
                  <h3 style={{ margin: '0 0 1.5rem' }}>Term-wise Subject Performance</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Subject</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Term & Year</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Marks</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Percentage</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Grade</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Achievement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((s: any, i: number) => {
                          const pct = s.rawPercentage || s.percentage || 0;
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{s.subject ?? s.name}</td>
                              <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{s.term} {s.year}</td>
                              <td style={{ padding: '0.85rem 1rem' }}>{s.marksObtained} / {s.totalMarks}</td>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{pct}%</td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem',
                                  background: s.grade === 'F' ? '#fee2e2' : '#dcfce7',
                                  color:      s.grade === 'F' ? '#dc2626' : '#15803d' }}>
                                  {s.grade ?? '—'}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{ padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                  background: pct >= 80 ? '#dcfce7' : pct >= 50 ? '#f0f9ff' : '#fff7ed',
                                  color:      pct >= 80 ? '#15803d' : pct >= 50 ? '#0369a1' : '#9a3412' }}>
                                  {pct >= 90 ? 'Exceptional' : pct >= 75 ? 'Good' : pct >= 50 ? 'Average' : 'Needs Improvement'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Class view ── */}
          {classData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Class Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.4rem' }}>Class Average</p>
                  <h3 style={{ fontSize: '1.8rem', margin: '0' }}>{classData.averageScore?.toFixed(1)}%</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Term: {classData.term}</span>
                </div>
                <div className="card" style={{ borderLeft: '5px solid #16a34a' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.4rem' }}>Pass Rate</p>
                  <h3 style={{ fontSize: '1.8rem', margin: '0' }}>{classData.passRate?.toFixed(1)}%</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{classData.totalStudents} students total</span>
                </div>
                <div className="card" style={{ borderLeft: '5px solid #f59e0b' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.4rem' }}>Class Topper</p>
                  <h3 style={{ fontSize: '1.2rem', margin: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{classData.topper?.studentName || 'N/A'}</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>Score: {classData.topper?.average}%</span>
                </div>
                <div className="card" style={{ borderLeft: '5px solid #64748b' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.4rem' }}>Total Students</p>
                  <h3 style={{ fontSize: '1.8rem', margin: '0' }}>{classData.totalStudents}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Academic Year {classData.year}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Students List */}
                <div className="card">
                  <h3 style={{ margin: '0 0 1.5rem' }}>Student Performance List</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Rank</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Avg Score</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classData.studentPerformance?.map((s: any, i: number) => (
                          <tr key={s.studentId} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: i === 0 ? '#fffbeb' : 'transparent' }}>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>#{i + 1}</td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{s.studentName}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '60px', height: '6px', borderRadius: '50px', background: '#e2e8f0' }}>
                                  <div style={{ width: `${s.average}%`, height: '100%', borderRadius: '50px', background: 'var(--primary)' }} />
                                </div>
                                <span style={{ fontWeight: 600 }}>{s.average}%</span>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem',
                                background: s.passed ? '#dcfce7' : '#fee2e2',
                                color:      s.passed ? '#15803d' : '#dc2626' }}>
                                {s.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Subject Averages Chart */}
                <div className="card">
                  <h3 style={{ margin: '0 0 1.5rem' }}>Subject Performance</h3>
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={{
                        labels: classData.subjectAverages?.map((sa: any) => sa.subject),
                        datasets: [{
                          label: 'Avg Score %',
                          data: classData.subjectAverages?.map((sa: any) => sa.average),
                          backgroundColor: 'rgba(37,99,235,0.7)',
                          borderRadius: 6
                        }]
                      }} 
                      options={{
                        ...chartOpts,
                        plugins: { ...chartOpts.plugins, legend: { display: false } }
                      }} 
                    />
                  </div>
                  <div style={{ marginTop: '1.5rem' }}>
                     {classData.subjectAverages?.map((sa: any, i: number) => (
                       <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                         <span style={{ fontSize: '0.85rem' }}>{sa.subject}</span>
                         <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{sa.average}%</span>
                       </div>
                     ))}
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

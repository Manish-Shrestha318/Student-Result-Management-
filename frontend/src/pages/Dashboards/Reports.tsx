import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar,
  Filter,
  BarChart3,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'results' | 'class' | 'attendance'>('results');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [term, setTerm] = useState('First Term');
  const [year, setYear] = useState('2026');

  // Data states
  const [reportData, setReportData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [uRes, cRes] = await Promise.all([
        fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/classes', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const uData = await uRes.json();
      const cData = await cRes.json();
      
      if (uData.success) setStudents(uData.users.filter((u: any) => u.role === 'student'));
      if (cData.classes) setClasses(cData.classes);
    } catch (err) {
      setError('Failed to load filter options');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchReport = async () => {
    if (!selectedStudent && activeTab === 'results') {
      alert('Please select a student first');
      return;
    }

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    
    try {
      let url = '';
      if (activeTab === 'results') {
        url = `/api/reports/data?studentId=${selectedStudent}&term=${term}&year=${year}`;
      } else if (activeTab === 'class' && selectedClass) {
        url = `/api/analytics/class/${selectedClass}?term=${term}&year=${year}`;
      } else if (activeTab === 'attendance' && selectedStudent) {
        // Just as an example, fetch attendance report for the current month
        const now = new Date();
        url = `/api/academics/attendance/report/${selectedStudent}?month=${now.getMonth()+1}&year=${now.getFullYear()}`;
      }

      if (!url) {
        setLoading(false);
        return;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setReportData(data.data || data.stats);
      } else {
        setError(data.message || 'Failed to fetch report data');
      }
    } catch (err) {
      setError('An error occurred while fetching report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedStudent || !term || !year) {
      alert('Please select student, term and year');
      return;
    }

    setDownloading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`/api/reports/generate?studentId=${selectedStudent}&term=${term}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to download report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-card-${selectedStudent}-${term}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading report PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Academic Reports & Analytics" error={error} />

        <div style={{ padding: '2.5rem' }}>
          {/* Main Tabs */}
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <TabButton icon={<FileText size={18} />} label="Student Results" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
            <TabButton icon={<BarChart3 size={18} />} label="Class Performance" active={activeTab === 'class'} onClick={() => setActiveTab('class')} />
            <TabButton icon={<Calendar size={18} />} label="Attendance Overview" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
            {/* Filters Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={18} color="var(--primary)" /> Filters
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(activeTab === 'results' || activeTab === 'attendance') && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Select Student</label>
                      <select 
                        value={selectedStudent} 
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                      >
                        <option value="">Choose Student...</option>
                        {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}

                  {activeTab === 'class' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Select Class</label>
                      <select 
                        value={selectedClass} 
                        onChange={(e) => setSelectedClass(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                      >
                        <option value="">Choose Class...</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  {(activeTab === 'results' || activeTab === 'class') && (
                    <>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Academic Term</label>
                        <select 
                          value={term} 
                          onChange={(e) => setTerm(e.target.value)}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                        >
                          <option value="First Term">First Term</option>
                          <option value="Mid Term">Mid Term</option>
                          <option value="Final Term">Final Term</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Academic Year</label>
                        <select 
                          value={year} 
                          onChange={(e) => setYear(e.target.value)}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                        >
                          <option value="2025">2025</option>
                          <option value="2026">2026</option>
                        </select>
                      </div>
                    </>
                  )}

                  <button 
                    onClick={fetchReport}
                    disabled={loading}
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    {loading ? 'Fetching...' : 'Generate Report'}
                  </button>
                </div>
              </div>

              {activeTab === 'results' && reportData && (
                <div className="card" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Quick Download</h4>
                  <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '1.25rem' }}>Download the official PDF report card for this student.</p>
                  <button 
                    onClick={handleDownloadReport}
                    disabled={downloading}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: 'none', 
                      backgroundColor: '#fff', 
                      color: 'var(--primary)', 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {downloading ? 'Preparing...' : <><Download size={18} /> Official PDF</>}
                  </button>
                </div>
              )}
            </aside>

            {/* Results Display Area */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {!reportData && !loading && (
                <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <FileSpreadsheet size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>Select filters and click "Generate Report" to view analytics.</p>
                </div>
              )}

              {loading && <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading report data...</div>}

              {reportData && activeTab === 'results' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <SummaryCard label="Total Percentage" value={`${reportData.summary.overallPercentage}%`} color="#2563eb" />
                    <SummaryCard label="GPA / Grade" value={reportData.summary.overallGrade} color="#16a34a" />
                    <SummaryCard label="Final Result" value={reportData.summary.result} color={reportData.summary.result === 'PASS' ? '#16a34a' : '#dc2626'} />
                  </div>

                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)' }}>Marks Breakdown</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem' }}>Subject</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem' }}>Marks</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem' }}>Total</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem' }}>Grade</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.marks.map((m: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{m.subject}</td>
                              <td style={{ padding: '1rem 1.5rem' }}>{m.marksObtained}</td>
                              <td style={{ padding: '1rem 1.5rem' }}>{m.totalMarks}</td>
                              <td style={{ padding: '1rem 1.5rem' }}><span style={{ fontWeight: 700 }}>{m.grade}</span> ({m.percentage}%)</td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                {m.marksObtained >= (m.totalMarks * 0.4) ? 
                                  <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600 }}><CheckCircle2 size={14}/> Pass</span> : 
                                  <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600 }}><XCircle size={14}/> Fail</span>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {reportData && activeTab === 'attendance' && (
                <div className="card">
                  <h3 style={{ marginBottom: '1.5rem' }}>Attendance Analytics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Attendance Rate</p>
                      <h2 style={{ fontSize: '3rem', margin: 0, color: 'var(--primary)' }}>{reportData.percentage}%</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                      <AttendanceRow label="Days Present" value={reportData.present} color="#16a34a" />
                      <AttendanceRow label="Days Absent" value={reportData.absent} color="#dc2626" />
                      <AttendanceRow label="Total Working Days" value={reportData.totalDays} color="#64748b" />
                    </div>
                  </div>
                </div>
              )}

              {reportData && activeTab === 'class' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <SummaryCard label="Class Average" value={`${reportData.averageScore}%`} color="#2563eb" />
                    <SummaryCard label="Pass Rate" value={`${reportData.passRate.toFixed(1)}%`} color="#16a34a" />
                    <SummaryCard label="Top Student" value={reportData.topper?.name || 'N/A'} color="#8b5cf6" />
                  </div>

                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)' }}>Student Rankings</h3>
                    <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                          <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem' }}>Rank</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem' }}>Roll No</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem' }}>Name</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem' }}>Average</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.studentPerformance.map((s: any, i: number) => (
                            <tr key={s.studentId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>#{i + 1}</td>
                              <td style={{ padding: '1rem 1.5rem' }}>{s.rollNumber}</td>
                              <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{s.name}</td>
                              <td style={{ padding: '1rem 1.5rem' }}>{s.average}%</td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                {s.passed ? 
                                  <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>Pass</span> : 
                                  <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem' }}>Fail</span>
                                }
                              </td>
                            </tr>
                          ))}
                          {reportData.studentPerformance.length === 0 && (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No performance data for this class.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

// Subcomponents
const TabButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem', 
      padding: '0.5rem 0', 
      border: 'none', 
      background: 'none', 
      color: active ? 'var(--primary)' : 'var(--text-secondary)', 
      fontWeight: active ? 700 : 500,
      fontSize: '1rem',
      cursor: 'pointer',
      borderBottom: active ? '3px solid var(--primary)' : '3px solid transparent',
      transition: 'all 0.2s'
    }}
  >
    {icon}
    {label}
  </button>
);

const SummaryCard: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="card" style={{ borderLeft: `5px solid ${color}` }}>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.4rem 0' }}>{label}</p>
    <h3 style={{ fontSize: '1.75rem', margin: 0, color }}>{value}</h3>
  </div>
);

const AttendanceRow: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontWeight: 700, color }}>{value}</span>
  </div>
);

export default Reports;

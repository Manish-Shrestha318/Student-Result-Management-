import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Calendar, 
  Bell, 
  FileText,
  LogOut,
  Download,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';

interface ReportData {
  student: {
    name: string;
    rollNumber: string;
    class: string;
    section: string;
  };
  marks: Array<{
    subject: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    remarks: string;
  }>;
  summary: {
    totalMarksObtained: number;
    totalMarks: number;
    overallPercentage: number;
    overallGrade: string;
    attendance: string;
    result: 'PASS' | 'FAIL';
  };
  academicDetails: {
    term: string;
    year: number;
  };
}

const StudentReports: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState('First Term');
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchReportData = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/reports/data?studentId=${user._id}&term=${term}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        setReportData(null);
        setError(data.message || 'No report found for the selected term');
      }
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!user?._id) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/reports/generate?studentId=${user._id}&term=${term}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ReportCard_${term}_${year}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Failed to download PDF');
      }
    } catch (err) {
      alert('Error downloading report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>SmartResults</h1>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => navigate('/dashboard/student')} />
          <NavItem icon={<GraduationCap size={20} />} label="Results" onClick={() => navigate('/dashboard/student/results')} />
          <NavItem icon={<Calendar size={20} />} label="Attendance" onClick={() => navigate('/dashboard/student/attendance')} />
          <NavItem icon={<Bell size={20} />} label="Notices" onClick={() => navigate('/dashboard/student/notices')} />
          <NavItem icon={<FileText size={20} />} label="Reports" active />
        </nav>

        <button 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', color: '#dc2626', border: 'none', background: 'none', fontSize: '1rem', cursor: 'pointer', marginTop: 'auto' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Academic Reports" error={error} />

        <div style={{ padding: '2.5rem' }}>
          {/* Controls */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Term</label>
              <select 
                value={term} 
                onChange={(e) => setTerm(e.target.value)}
                style={inputStyle}
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Final">Final Board</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Year</label>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value))}
                style={inputStyle}
              />
            </div>
            <button 
              onClick={fetchReportData} 
              disabled={loading}
              style={{ ...btnStyle, backgroundColor: 'var(--primary)', color: '#fff' }}
            >
              {loading ? 'Loading...' : <><Eye size={18} /> View Report</>}
            </button>
            {reportData && (
              <button 
                onClick={handleDownloadPDF}
                style={{ ...btnStyle, backgroundColor: '#059669', color: '#fff' }}
              >
                <Download size={18} /> Download PDF
              </button>
            )}
          </div>

          {reportData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <StatCard label="Overall %" value={`${reportData.summary.overallPercentage}%`} color="var(--primary)" icon={<AwardIcon />} />
                <StatCard label="Grade" value={reportData.summary.overallGrade} color="#7c3aed" icon={<MedalIcon />} />
                <StatCard label="Attendance" value={reportData.summary.attendance} color="#ca8a04" icon={<Calendar size={20} />} />
                <StatCard 
                  label="Result Status" 
                  value={reportData.summary.result} 
                  color={reportData.summary.result === 'PASS' ? '#059669' : '#dc2626'} 
                  icon={reportData.summary.result === 'PASS' ? <CheckCircle2 size={20} /> : <XCircle size={20} />} 
                />
              </div>

              {/* Marks Table */}
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Subject-wise Breakdown</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Generated for {reportData.student.name}</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                      <th style={thStyle}>Subject</th>
                      <th style={thStyle}>Marks</th>
                      <th style={thStyle}>Total</th>
                      <th style={thStyle}>Percentage</th>
                      <th style={thStyle}>Grade</th>
                      <th style={thStyle}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.marks.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={tdStyle}>{m.subject}</td>
                        <td style={tdStyle}>{m.marksObtained}</td>
                        <td style={tdStyle}>{m.totalMarks}</td>
                        <td style={tdStyle}>{m.percentage}%</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: getGradeColor(m.grade) }}>{m.grade}</td>
                        <td style={tdStyle}>{m.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800 }}>
                      <td style={tdStyle}>TOTAL</td>
                      <td style={tdStyle}>{reportData.summary.totalMarksObtained}</td>
                      <td style={tdStyle}>{reportData.summary.totalMarks}</td>
                      <td style={tdStyle}>{reportData.summary.overallPercentage}%</td>
                      <td style={{ ...tdStyle, color: getGradeColor(reportData.summary.overallGrade) }}>{reportData.summary.overallGrade}</td>
                      <td style={tdStyle}>{reportData.summary.result}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : !loading && !error ? (
            <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
              <FileText size={64} color="var(--border-color)" style={{ marginBottom: '1.5rem' }} />
              <h3>No Report Card Loaded</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Select a term and click "View Report" to see your academic breakdown.</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

// Styles & Helpers
const inputStyle = {
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  fontSize: '0.9rem',
  outline: 'none',
  backgroundColor: '#fff'
};

const btnStyle = {
  padding: '0.75rem 1.5rem',
  borderRadius: '10px',
  border: 'none',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s'
};

const thStyle = { padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' };
const tdStyle = { padding: '1.25rem 1.5rem', fontSize: '0.9rem' };

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', borderRadius: 'var(--btn-radius)', border: 'none', 
    backgroundColor: active ? '#f1f5f9' : 'transparent', color: active ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.95rem',
    fontWeight: active ? 600 : 500, cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s'
  }}>
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, color, icon }: any) => (
  <div className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${color}` }}>
    <div style={{ color, marginBottom: '0.75rem' }}>{icon}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
  </div>
);

const AwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

const MedalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><circle cx="12" cy="18" r="4"/><path d="M12 14v8"/><path d="M9 18h6"/>
  </svg>
);

const getGradeColor = (grade: string) => {
  if (['A+', 'A', 'B+'].includes(grade)) return '#059669';
  if (['B', 'C+', 'C'].includes(grade)) return '#ca8a04';
  return '#dc2626';
};

export default StudentReports;

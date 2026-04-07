import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner } from 'react-bootstrap';
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

  const getGradeVariant = (grade: string) => {
    if (['A+', 'A', 'B+'].includes(grade)) return 'success';
    if (['B', 'C+', 'C'].includes(grade)) return 'warning';
    return 'danger';
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <aside className="bg-white border-end d-flex flex-column px-4 py-5" style={{ width: '280px' }}>
        <div className="mb-5 text-center">
           <h4 className="fw-bold text-primary ls-1">SMARTRESULTS</h4>
           <span className="smallest text-muted fw-bold text-uppercase ls-1">Student</span>
        </div>
        
        <nav className="flex-grow-1 d-flex flex-column gap-1">
          <NavItem label="Dashboard" onClick={() => navigate('/dashboard/student')} />
          <NavItem label="Results" onClick={() => navigate('/dashboard/student/results')} />
          <NavItem label="Attendance" onClick={() => navigate('/dashboard/student/attendance')} />
          <NavItem label="Notices" onClick={() => navigate('/dashboard/student/notices')} />
          <NavItem label="Reports" active />
        </nav>
      </aside>

      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Student Reports" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Select Term ── */}
          <Card className="border-0 shadow-sm rounded-4 p-4 mb-5">
             <Row className="g-3 align-items-end text-uppercase smallest ls-1 fw-bold">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="text-muted mb-2">Term</Form.Label>
                    <Form.Select 
                      value={term} 
                      onChange={(e) => setTerm(e.target.value)}
                      className="smallest fw-bold py-3 border-light-dark rounded-4 shadow-none ls-1 bg-light text-uppercase"
                    >
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Final">Final Term</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="text-muted mb-2">Year</Form.Label>
                    <Form.Control 
                      type="number" 
                      value={year} 
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      className="smallest fw-bold py-3 border-light-dark rounded-4 shadow-none ls-1 bg-light text-uppercase"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Button 
                    onClick={fetchReportData} 
                    disabled={loading}
                    variant="primary"
                    className="w-100 fw-bold smallest py-3 rounded-pill ls-1 text-uppercase shadow-sm"
                  >
                    {loading ? 'BUFFERING...' : 'PULL ANALYTICS'}
                  </Button>
                </Col>
                <Col md={3}>
                  {reportData && (
                    <Button 
                      onClick={handleDownloadPDF}
                      variant="success"
                      className="w-100 fw-bold smallest py-3 rounded-pill ls-1 text-uppercase shadow-sm"
                    >
                      DOWNLOAD PDF
                    </Button>
                  )}
                </Col>
             </Row>
          </Card>

          {reportData ? (
            <div className="d-flex flex-column gap-5">
              {/* ── Aggregate Performance Visualization ── */}
              <Row className="g-4">
                <Col sm={3}>
                   <MetricCard label="AGGREGATE SCORE" value={`${reportData.summary.overallPercentage}%`} variant="primary" trend="SCALED PERCENTILE" />
                </Col>
                <Col sm={3}>
                   <MetricCard label="LETTER GRADE" value={reportData.summary.overallGrade} variant="info" trend="ACADEMIC STANDING" />
                </Col>
                <Col sm={3}>
                   <MetricCard label="INSTITUTIONAL ATTENDANCE" value={reportData.summary.attendance} variant="warning" trend="PRESENCE RATIO" />
                </Col>
                <Col sm={3}>
                   <MetricCard label="DETERMINATION RESULT" value={reportData.summary.result} variant={reportData.summary.result === 'PASS' ? 'success' : 'danger'} trend="STATE EVALUATION" />
                </Col>
              </Row>

              {/* ── Granular Subject Breakdown ── */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden border-top border-4 border-primary">
                <Card.Header className="bg-white p-4 border-0 d-flex justify-content-between align-items-center">
                   <h6 className="fw-bold text-dark mb-0 smallest text-uppercase ls-1">Instructional Breakdown Matrix</h6>
                   <span className="smallest text-muted fw-bold text-uppercase ls-1 border-start ps-3 ms-3">Authenticated: <strong className="text-primary">{reportData.student.name.toUpperCase()}</strong></span>
                </Card.Header>
                <div className="table-responsive">
                  <Table borderless hover className="align-middle mb-0 smallest fw-medium">
                    <thead className="bg-light-soft text-uppercase smallest fw-bold ls-1 opacity-75">
                      <tr className="border-bottom border-light">
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3 text-center">Marks Obtained</th>
                        <th className="px-4 py-3 text-center">Total Marks</th>
                        <th className="px-4 py-3 text-center">Grade</th>
                        <th className="px-4 py-3 text-end">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.marks.map((m, idx) => (
                        <tr key={idx} className="border-bottom border-light shadow-sm-hover transition-all">
                          <td className="px-4 py-4 fw-bold text-dark ls-1 text-uppercase">{m.subject}</td>
                          <td className="px-4 py-4 text-center fw-bold fs-6">{m.marksObtained}</td>
                          <td className="px-4 py-4 text-center text-muted fw-bold">{m.totalMarks}</td>
                          <td className="px-4 py-4 text-center">
                             <Badge bg={`${getGradeVariant(m.grade)}-soft`} text={getGradeVariant(m.grade)} className="fw-bold smaller text-uppercase px-3 py-2 rounded-pill ls-1 border">{m.grade} - {m.percentage}%</Badge>
                          </td>
                          <td className="px-4 py-4 text-end fw-bold text-muted text-uppercase smallest ls-1">{m.remarks || 'SATISFACTORY'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-light-soft border-top border-primary border-2 fw-bold">
                      <tr>
                        <td className="px-4 py-4 ls-1">AGGREGATE TOTAL</td>
                        <td className="px-4 py-4 text-center fs-5 text-primary">{reportData.summary.totalMarksObtained}</td>
                        <td className="px-4 py-4 text-center text-muted">{reportData.summary.totalMarks}</td>
                        <td className="px-4 py-4 text-center fs-6 text-dark">{reportData.summary.overallPercentage}%</td>
                        <td className="px-4 py-4 text-end">
                           <Badge bg={reportData.summary.result === 'PASS' ? 'success' : 'danger'} className="fw-bold px-4 py-2 text-uppercase ls-1 rounded-1">{reportData.summary.result}</Badge>
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </Card>
            </div>
          ) : !loading && !error ? (
            <Card className="border-0 shadow-sm rounded-4 d-flex align-items-center justify-content-center p-5 text-center bg-white" style={{ minHeight: '400px' }}>
               <div className="max-width-400">
                  <h6 className="text-secondary fw-bold smallest text-uppercase ls-1 opacity-50 mb-3">Void Terminal State</h6>
                  <p className="text-muted smaller fw-medium ls-1 px-4 opacity-75 uppercase">Specify evaluation parameters and pull analytics to initialize state visualization.</p>
               </div>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ label: string, active?: boolean, onClick?: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`btn w-100 text-start py-2 px-3 rounded-pill border-0 mb-1 transition-all ${active ? 'bg-primary-soft text-primary fw-bold shadow-sm' : 'bg-transparent text-secondary fw-semibold'}`} style={{ fontSize: '0.94rem' }}>
    <span className="ls-1 text-uppercase smallest">{label}</span>
  </button>
);

const MetricCard: React.FC<{ label: string, value: string, variant: string, trend: string }> = ({ label, value, variant, trend }) => (
  <Card className={`border-0 shadow-sm rounded-4 h-100 border-start border-5 border-${variant}`}>
    <Card.Body className="p-4 py-3 text-center text-sm-start">
      <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1">{label}</span>
      <h3 className="fw-bold text-dark mb-1 ls-1">{value}</h3>
      <div className={`smallest fw-bold text-uppercase ls-1 text-${variant}`}>{trend}</div>
    </Card.Body>
  </Card>
);

export default StudentReports;


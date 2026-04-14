import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/TeacherSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Table, Badge, Button, Form, Nav, Spinner } from 'react-bootstrap';

const TeacherStudents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'results' | 'class'>('results');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [term, setTerm] = useState('First Term');
  const [year, setYear] = useState('2025');

  const [reportData, setReportData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/dashboard/teacher', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
            setClasses(data.assignedClassesList || []);
            setStudents(data.students || []); 
        }
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
    if (!selectedClass && activeTab === 'class') {
      alert('Please select a class first');
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
        url = `/api/analytics/class/${selectedClass}?term=${encodeURIComponent(term)}&year=${encodeURIComponent(year)}`;
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
      a.download = `ReportCard_${reportData.student.name.replace(/\s+/g, '_')}_${term}.pdf`;
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
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <TeacherSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Students" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Operational Tab Bar ── */}
          <Nav className="nav-underline mb-5 border-bottom gap-4">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'results'} 
                onClick={() => { setActiveTab('results'); setReportData(null); setError(null); }}
                className={`fw-bold smallest px-0 py-3 ls-1 text-uppercase border-0 shadow-none ${activeTab === 'results' ? 'text-primary border-bottom border-3 border-primary' : 'text-muted opacity-75'}`}
              >
                Student Results
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'class'} 
                onClick={() => { setActiveTab('class'); setReportData(null); setError(null); }}
                className={`fw-bold smallest px-0 py-3 ls-1 text-uppercase border-0 shadow-none ${activeTab === 'class' ? 'text-primary border-bottom border-3 border-primary' : 'text-muted opacity-75'}`}
              >
                Class Record
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Row className="g-5">
            {/* ── Analytical Parameters Sidebar ── */}
            <Col lg={4} xl={3}>
              <div className="d-flex flex-column gap-4 position-sticky" style={{ top: '2rem' }}>
                <Card className="border-0 shadow-sm rounded-4 p-4 p-xl-5">
                  <h6 className="fw-bold text-dark mb-4 smallest text-uppercase ls-1 border-start border-4 border-primary ps-3">Filters</h6>
                  
                  <div className="d-flex flex-column gap-4">
                    {activeTab === 'results' && (
                      <Form.Group>
                        <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1 mb-2">Student</Form.Label>
                        <Form.Select 
                          value={selectedStudent} 
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          className="smallest fw-bold py-3 border-light-dark rounded-4 shadow-none ls-1 bg-light text-uppercase"
                        >
                          <option value="">SELECT STUDENT...</option>
                          {students.filter(s => {
                            if (!selectedClass) return true;
                            const cls = classes.find(c => c._id === selectedClass);
                            return cls ? (`${s.class} — ${s.section}` === `${cls.name} — ${cls.section}`) : true;
                          }).map(s => <option key={s._id} value={s._id}>{s.class} {s.section} — {s.name.toUpperCase()}</option>)}
                        </Form.Select>
                      </Form.Group>
                    )}

                    {activeTab === 'class' && (
                      <Form.Group>
                        <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1 mb-2">Class</Form.Label>
                        <Form.Select 
                          value={selectedClass} 
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="smallest fw-bold py-3 border-light-dark rounded-4 shadow-none ls-1 bg-light text-uppercase"
                        >
                          <option value="">SELECT CLASS...</option>
                          {classes.map((c: any) => <option key={c._id} value={c._id}>{c.name.toUpperCase()} — {c.section}</option>)}
                        </Form.Select>
                      </Form.Group>
                    )}

                    {(activeTab === 'results' || activeTab === 'class') && (
                      <>
                        <Form.Group>
                          <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1 mb-2">Term</Form.Label>
                          <Form.Select 
                            value={term} 
                            onChange={(e) => setTerm(e.target.value)}
                            className="smallest fw-bold py-3 border-light-dark rounded-4 shadow-none ls-1 bg-light text-uppercase"
                          >
                             <option value="First Term">FIRST TERM</option>
                             <option value="Second Term">SECOND TERM</option>
                             <option value="Final">FINAL TERM</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group>
                          <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1 mb-2">Year</Form.Label>
                          <Form.Select 
                            value={year} 
                            onChange={(e) => setYear(e.target.value)}
                            className="smallest fw-bold py-3 border-light-dark rounded-4 shadow-none ls-1 bg-light text-uppercase"
                          >
                            <option value="2025">YEAR 2025</option>
                            <option value="2026">YEAR 2026</option>
                          </Form.Select>
                        </Form.Group>
                      </>
                    )}

                    <Button 
                      onClick={fetchReport}
                      disabled={loading}
                      variant="primary"
                      className="w-100 fw-bold smallest py-3 rounded-pill ls-1 text-uppercase mt-2 shadow-sm"
                    >
                      {loading ? 'LOADING...' : 'SHOW REPORT'}
                    </Button>
                  </div>
                </Card>

                {activeTab === 'results' && reportData && (
                  <Card className="border-0 shadow-sm rounded-4 p-4 py-xl-5 bg-primary text-white overflow-hidden">
                    <h6 className="fw-bold mb-2 smallest text-uppercase ls-1">Download Report</h6>
                    <p className="smallest opacity-75 fw-medium mb-4 lh-base uppercase ls-1">Download a PDF copy of this report.</p>
                    <Button 
                      onClick={handleDownloadReport}
                      disabled={downloading}
                      variant="light"
                      className="w-100 fw-bold smallest py-3 rounded-pill ls-1 text-uppercase text-primary shadow-sm"
                    >
                      {downloading ? 'LOADING PDF...' : 'DOWNLOAD PDF'}
                    </Button>
                  </Card>
                )}
              </div>
            </Col>

            {/* ── Results Output Console ── */}
            <Col lg={8} xl={9}>
              {!reportData && !loading && (
                <Card className="border-0 shadow-sm rounded-4 d-flex align-items-center justify-content-center p-5 text-center bg-white" style={{ minHeight: '500px' }}>
                  <div className="max-width-400">
                    <h6 className="text-secondary fw-bold smallest text-uppercase ls-1 opacity-50 mb-3">No Data</h6>
                    <p className="text-muted smaller fw-medium ls-1 px-4 opacity-75">Select student/class, term, and year to view the report.</p>
                  </div>
                </Card>
              )}

              {loading && (
                <Card className="border-0 shadow-sm rounded-4 d-flex align-items-center justify-content-center p-5 bg-white" style={{ minHeight: '500px' }}>
                   <Spinner animation="grow" variant="primary" size="sm" className="mb-4" />
                   <h6 className="fw-bold text-primary smallest text-uppercase ls-1">Loading report...</h6>
                </Card>
              )}

              {reportData && activeTab === 'results' && (
                <div className="d-flex flex-column gap-5 animate-fade-in">
                  <Row className="g-4">
                    <Col sm={4}>
                       <SummaryCard label="TOTAL SCORE" value={`${reportData.summary.overallPercentage}%`} variant="primary" trend="PERCENTAGE" />
                    </Col>
                    <Col sm={4}>
                       <SummaryCard label="GRADE" value={reportData.summary.overallGrade} variant="success" trend="GRADE" />
                    </Col>
                    <Col sm={4}>
                       <SummaryCard label="RESULT" value={reportData.summary.result} variant={reportData.summary.result === 'PASS' ? 'success' : 'danger'} trend="PASS/FAIL" />
                    </Col>
                  </Row>

                  <Card className="border-0 shadow-sm rounded-4 overflow-hidden shadow-sm bg-white">
                    <Card.Header className="bg-white p-4 border-0 border-bottom">
                       <h6 className="fw-bold text-dark mb-0 smallest text-uppercase ls-1">Subject Marks</h6>
                    </Card.Header>
                    <div className="table-responsive">
                      <Table borderless hover className="align-middle mb-0 smallest fw-medium">
                        <thead className="bg-light-soft">
                          <tr className="border-bottom border-light">
                            <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Subject</th>
                            <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Marks Obtained</th>
                            <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Total Marks</th>
                            <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Percentage</th>
                            <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-end">Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.marks.map((m: any, i: number) => (
                            <tr key={i} className="border-bottom border-light">
                              <td className="px-4 py-3 fw-bold text-dark ls-1 text-uppercase">{m.subject}</td>
                              <td className="px-4 py-3 text-center fw-bold fs-6">{m.marksObtained}</td>
                              <td className="px-4 py-3 text-center text-muted fw-bold">{m.totalMarks}</td>
                              <td className="px-4 py-3 text-center">
                                <Badge bg="light" text="dark" className="fw-bold smaller border px-3 py-1 rounded-pill ls-1">
                                  {m.grade || 'N/A'} ({m.percentage}%)
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-end">
                                <span className={`fw-bold ls-1 text-uppercase smallest ${m.grade !== 'F' ? 'text-success' : 'text-danger'}`}>
                                  {m.grade !== 'F' ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card>
                </div>
              )}



              {reportData && activeTab === 'class' && (
                <div className="d-flex flex-column gap-5 animate-fade-in">
                  <Row className="g-4">
                    <Col sm={4}>
                       <SummaryCard label="CLASS AVERAGE" value={`${Number(reportData.averageScore).toFixed(1)}%`} variant="primary" trend="AVERAGE" />
                    </Col>
                    <Col sm={4}>
                       <SummaryCard label="PASS RATE" value={`${Number(reportData.passRate).toFixed(1)}%`} variant="success" trend="PERCENTAGE" />
                    </Col>
                    <Col sm={4}>
                       <SummaryCard label="TOP STUDENT" value={reportData.topper?.studentName?.toUpperCase() || 'N/A'} variant="warning" trend="TOPPER" />
                    </Col>
                  </Row>

                  <Card className="border-0 shadow-sm rounded-4 overflow-hidden shadow-sm bg-white">
                    <Card.Header className="bg-white p-4 border-0 border-bottom">
                       <h6 className="fw-bold text-dark mb-0 smallest text-uppercase ls-1">Class Rankings</h6>
                    </Card.Header>
                    <div className="table-responsive" style={{ maxHeight: '500px' }}>
                      <Table borderless hover className="align-middle mb-0 smallest fw-medium">
                        <thead className="bg-light-soft position-sticky top-0 z-2 shadow-sm">
                          <tr className="border-bottom border-light">
                            <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Rank</th>
                            <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Student Name</th>
                            <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Average Score</th>
                            <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-end">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.studentPerformance.map((s: any, i: number) => (
                            <tr key={String(s.studentId)} className="border-bottom border-light">
                              <td className="px-4 py-4"><Badge bg="light" text="primary" className="fw-bold p-2 border smallest ls-1">#{i + 1}</Badge></td>
                              <td className="px-4 py-4">
                                <div className="fw-bold text-dark ls-1 text-uppercase">{s.studentName || s.name || 'Unknown'}</div>
                                <div className="smallest text-muted fw-bold ls-1 opacity-50">ROLL: {s.rollNumber || 'N/A'}</div>
                              </td>
                              <td className="px-4 py-4 text-center fw-bold fs-6">{Number(s.average).toFixed(1)}%</td>
                              <td className="px-4 py-4 text-end">
                                <Badge bg={s.passed ? 'success-soft' : 'danger-soft'} text={s.passed ? 'success' : 'danger'} className="fw-bold smaller text-uppercase px-3 py-2 rounded-pill border ls-1">
                                  {s.passed ? 'Pass' : 'Fail'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card>
                </div>
              )}
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string, value: string, variant: string, trend: string }> = ({ label, value, variant, trend }) => (
  <Card className="border-0 shadow-sm rounded-4 h-100">
    <Card.Body className="p-4 py-3 text-center text-sm-start">
      <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1">{label}</span>
      <h3 className="fw-bold text-dark mb-1 ls-1">{value}</h3>
      <div className="smallest fw-bold text-uppercase ls-1 text-secondary">{trend}</div>
    </Card.Body>
  </Card>
);

export default TeacherStudents;


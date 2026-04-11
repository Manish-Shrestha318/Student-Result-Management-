import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Badge, Spinner, Table } from 'react-bootstrap';
import AdminHeader from '../../components/AdminHeader';
import StudentSidebar from '../../components/StudentSidebar';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [activeResults, setActiveResults] = useState<any[]>([]); // specifically latest term results
  const [attendance, setAttendance] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        // Enriched user object with studentProfile
        setUser(data.user);
        // Also update localStorage so it's fresh for next page loads
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error("Failed to fetch full profile", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [resultsRes, attendanceRes, trendsRes, noticesRes] = await Promise.all([
        fetch(`/api/academics/marks/marks/student/${user._id}`, { headers }),
        fetch(`/api/academics/attendance/student/${user._id}`, { headers }),
        fetch(`/api/academics/marks/trends/${user._id}`, { headers }),
        fetch('/api/notices', { headers })
      ]);

      const [resultsData, attendanceData, trendsData, noticesData] = await Promise.all([
        resultsRes.json(),
        attendanceRes.json(),
        trendsRes.json(),
        noticesRes.json()
      ]);

      if (resultsData.success) {
        const allResults = resultsData.data || [];
        setResults(allResults);
        
        if (allResults.length > 0) {
           const termOrder: any = { 'Final Term': 3, 'Third Term': 3, 'Second Term': 2, 'First Term': 1 };
           const sorted = [...allResults].sort((a, b) => {
              if (a.year !== b.year) return b.year - a.year;
              return (termOrder[b.term] || 0) - (termOrder[a.term] || 0);
           });
           const latestYear = sorted[0].year;
           const latestTerm = sorted[0].term;
           setActiveResults(sorted.filter(r => r.year === latestYear && r.term === latestTerm));
        }
      }
      if (attendanceData.success) setAttendance(attendanceData.data);
      if (trendsData.success) setTrends(trendsData.data);
      if (noticesData.success) {
        setAnnouncements(Array.isArray(noticesData.data) ? noticesData.data.slice(0, 3) : []);
      }

    } catch (err) {
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };




  const averageMarksValue = activeResults.length > 0 ? (activeResults.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0) / activeResults.reduce((acc, curr) => acc + (curr.totalMarks || 100), 0) * 100).toFixed(1) : '0';
  const calculateAttendance = () => {
    if (!Array.isArray(attendance) || attendance.length === 0) return '0';
    
    // Filter to only include valid student presence records (ignore weekday holidays)
    const validRecords = attendance.filter((a: any) => {
      const day = new Date(a.date).getDay();
      if (a.status === 'holiday' && day !== 6) return false;
      return true;
    });

    if (validRecords.length === 0) return '0';

    const present = validRecords.filter((a: any) => a.status === 'present').length;
    const totalInstructional = validRecords.filter((a: any) => a.status === 'present' || a.status === 'absent').length;

    return totalInstructional > 0 ? ((present / totalInstructional) * 100).toFixed(1) : '0';
  };

  const attendancePercentage = calculateAttendance();

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <StudentSidebar />

      {/* ── Primary Terminal ── */}
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Student Dashboard" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Status Header ── */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">
                Welcome: {user?.name || 'Student'} 
                {user?.studentProfile && (
                  <span className="text-primary ms-3 smallest text-uppercase ls-1 fw-bold opacity-75">
                    ({user.studentProfile.class} — {user.studentProfile.section})
                  </span>
                )}
              </h3>
              <p className="text-secondary small mb-0 fw-medium">
                Status: Logged In | {user?.studentProfile ? `${user.studentProfile.class} — ${user.studentProfile.section}` : 'Grade N/A'}
              </p>
            </div>
          </div>

          {/* ── Analytical Scorecards ── */}
          <Row className="g-4 mb-5">
            {[
              { label: 'GRADE', value: `${averageMarksValue}%`, color: 'primary' },
              { label: 'ATTENDANCE', value: `${attendancePercentage}%`, color: 'info' },
              { label: 'STATUS', value: Number(averageMarksValue) >= 40 ? 'VERIFIED' : 'AT RISK', color: 'dark' },
            ].map((stat, i) => (
              <Col key={i} sm={12} xl={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-4">
                    <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1">{stat.label}</span>
                    <h3 className="fw-bold text-dark mb-0 ls-1">{stat.value}</h3>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            <Col xl={8}>
               {/* ── Subject Evaluations ── */}
               <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                  <div className="card-header bg-white border-bottom p-4">
                     <h5 className="fw-bold mb-0 text-dark smallest text-uppercase ls-1">
                       Subject Results {activeResults.length > 0 && <span className="text-primary ms-2 opacity-75">({activeResults[0].term} {activeResults[0].year})</span>}
                     </h5>
                  </div>
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0 smallest fw-medium">
                      <thead className="bg-light-soft border-bottom">
                        <tr>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Subject</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Exam Type</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Marks</th>
                          <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-end">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeResults.length === 0 ? (
                          <tr><td colSpan={4} className="px-4 py-5 text-center text-muted fw-bold italic opacity-50 uppercase ls-1">No results available yet.</td></tr>
                        ) : (
                          activeResults
                            .filter((row, index, self) => 
                              self.findIndex(r => (r.subjectId?.name || r.subject) === (row.subjectId?.name || row.subject)) === index
                            )
                            .map((row, i) => (
                            <tr key={i} className="border-bottom border-light">
                              <td className="px-4 py-3 fw-bold text-dark text-uppercase">{row.subjectId?.name || 'Subject'}</td>
                              <td className="px-4 py-3 text-secondary text-uppercase smallest fw-bold ls-1">{row.examType}</td>
                              <td className="px-4 py-3 text-center fw-bold ls-1">{row.marksObtained} / {row.totalMarks}</td>
                              <td className="px-4 py-3 text-end">
                                <Badge bg={['A', 'B', 'PASS'].includes(row.grade) ? 'success-soft' : 'danger-soft'} text={['A', 'B', 'PASS'].includes(row.grade) ? 'success' : 'danger'} className="fw-bold smallest px-3 py-2 rounded-pill border">
                                  {row.grade || 'N/A'}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card>
            </Col>

            <Col xl={4}>
               <div className="d-flex flex-column gap-4 pb-5">
                  {/* ── Institutional Directives ── */}
                  <Card className="border-0 shadow-sm rounded-4 p-4">
                     <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 border-light-dark">
                         <h6 className="fw-bold text-dark mb-0 text-uppercase smallest ls-2">Notices</h6>
                         <Link to="/dashboard/student/notices" className="text-primary text-decoration-none fw-bold smallest text-uppercase ls-1">VIEW ALL</Link>
                     </div>
                     <div className="d-flex flex-column gap-3">
                        {loading ? (
                           <div className="py-5 text-center"><Spinner animation="border" variant="primary" size="sm" /></div>
                        ) : announcements.length === 0 ? (
                            <div className="py-5 text-center text-muted smallest fw-bold ls-2 opacity-50 uppercase border border-dashed rounded-4">No notices yet</div>
                        ) : (
                           announcements.map((notice, i) => (
                              <div key={i} className="p-3 bg-light-soft rounded-4 border border-light-dark transition-all last-mb-0">
                                 <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="smallest fw-bold text-dark mb-0 ls-1 text-uppercase">{notice.title}</h6>
                                    <span className="smallest text-muted fw-bold ls-1 text-uppercase opacity-50">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                 </div>
                                 <p className="smallest text-secondary fw-medium mb-0 lh-base text-truncate">{notice.content}</p>
                              </div>
                           ))
                        )}
                     </div>
                  </Card>



                  {/* ── Standing Insights ── */}
                  <Card className="border-0 shadow-sm rounded-4 p-4">
                     <h6 className="fw-bold text-dark mb-4 border-bottom pb-3 border-light-dark smallest text-uppercase ls-2">Academic Status</h6>
                     <div className="p-3 bg-light-soft rounded-4 border border-light-dark">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                           <span className="smallest fw-bold text-secondary text-uppercase ls-1">STATUS TREND</span>
                            <Badge bg="success-soft" text="success" className="fw-bold smallest border border-success-soft">GOOD</Badge>
                         </div>
                         <p className="smallest text-secondary fw-medium mb-0 lh-base">You are doing well. Keep up the good work and stay consistent with your studies.</p>
                     </div>
                  </Card>
               </div>
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'holiday';
  remarks?: string;
}

const StudentAttendance: React.FC = () => {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    holiday: 0,
    percentage: '0'
  });

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
      fetchAttendanceData();
    }
  }, [user, currentMonth, currentYear]);

  const fetchAttendanceData = async () => {
    const token = localStorage.getItem('token');
    try {
      const month = currentMonth + 1;
      const response = await fetch(`/api/academics/attendance/report/${user._id}?month=${month}&year=${currentYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAttendance(data.data.details || []);
        setStats({
          present: data.data.present || 0,
          absent: data.data.absent || 0,
          late: data.data.late || 0,
          holiday: data.data.holiday || 0,
          percentage: data.data.percentage || '0'
        });
      } else {
        setError(data.message || 'Failed to synchronize presence hub.');
      }
    } catch (err) {
      setError('Operational error: Could not establish secure socket to presence engine.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const changeMonth = (offset: number) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getDayStatus = (dayNum: number) => {
    const dateStr = new Date(currentYear, currentMonth, dayNum).toISOString().split('T')[0];
    return attendance.find(a => a.date.startsWith(dateStr));
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(currentYear, currentMonth));

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      {/* ── Scholar Console ── */}
      <aside className="d-flex flex-column bg-white border-end p-4 shadow-sm" style={{ width: '280px', zIndex: 10 }}>
        <div className="mb-5 px-3">
          <h4 className="fw-bold text-primary ls-1 mb-0">SMARTRESULTS</h4>
          <span className="smallest text-muted fw-bold text-uppercase ls-1">Student</span>
        </div>
        
        <nav className="nav flex-column gap-1 flex-grow-1 overflow-auto custom-scrollbar">
          <Link to="/dashboard/student" className="nav-link text-secondary fw-semibold hover-bg-light rounded-pill py-3 px-4 mb-1">
             <span className="ls-1 text-uppercase smallest">Dashboard</span>
          </Link>
          <Link to="/dashboard/student/results" className="nav-link text-secondary fw-semibold hover-bg-light rounded-pill py-3 px-4 mb-1">
             <span className="ls-1 text-uppercase smallest">Results</span>
          </Link>
          <Link to="/dashboard/student/attendance" className="nav-link bg-primary text-white rounded-pill py-3 px-4 fw-bold shadow-sm mb-1">
             <span className="ls-1 text-uppercase smallest">Attendance</span>
          </Link>
          <Link to="/dashboard/student/notices" className="nav-link text-secondary fw-semibold hover-bg-light rounded-pill py-3 px-4 mb-1">
             <span className="ls-1 text-uppercase smallest">Notices</span>
          </Link>
        </nav>
      </aside>

      {/* ── Primary Terminal ── */}
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Attendance" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Numerical Intelligence ── */}
          <Row className="g-4 mb-5">
            {[
              { label: 'PRESENT', value: stats.present, color: 'success' },
              { label: 'ABSENCE VECTOR', value: stats.absent, color: 'danger' },
              { label: 'CONSISTENCY INDEX', value: `${stats.percentage}%`, color: 'primary' },
            ].map((stat, i) => (
              <Col key={i} md={4}>
                <Card className={`border-0 shadow-sm rounded-4 p-4 border-start border-5 border-${stat.color}`}>
                  <Card.Body className="p-0">
                    <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-2">{stat.label}</span>
                    <h2 className="mb-0 fw-bold ls-1">{stat.value}</h2>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            {/* ── Interactive Presence Grid ── */}
            <Col xl={8}>
              <Card className="border-0 shadow-sm rounded-4 p-4">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-5 gap-3 border-bottom pb-4">
                  <h5 className="fw-bold text-dark mb-0 smallest text-uppercase ls-2">{monthName} {currentYear}</h5>
                  <div className="btn-group btn-group-sm shadow-sm rounded-pill overflow-hidden border">
                    <Button variant="white" className="px-3 fw-bold smallest ls-1 border-end" onClick={() => changeMonth(-1)}>PREV</Button>
                    <Button variant="white" className="px-3 fw-bold smallest ls-1 border-end" onClick={() => setCurrentMonth(new Date().getMonth())}>SYNC</Button>
                    <Button variant="white" className="px-3 fw-bold smallest ls-1" onClick={() => changeMonth(1)}>NEXT</Button>
                  </div>
                </div>

                <div className="row g-1 text-center mb-3">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="col smallest fw-bold text-secondary ls-1 py-2 opacity-50">{day}</div>
                  ))}
                </div>

                <div className="row g-2">
                  {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="col" style={{ minHeight: '90px' }} />
                  ))}

                  {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, i) => {
                    const dayNum = i + 1;
                    const status = getDayStatus(dayNum);
                    return (
                      <div key={dayNum} className="col" style={{ minWidth: '14%', minHeight: '90px' }}>
                        <div 
                          className={`h-100 rounded-4 p-3 d-flex flex-column justify-content-between transition-all border shadow-sm-hover ${
                            status?.status === 'present' ? 'bg-success-soft border-success text-success' :
                            status?.status === 'absent' ? 'bg-danger-soft border-danger text-danger' :
                            status?.status === 'late' ? 'bg-warning-soft border-warning text-warning' :
                            'bg-white border-light-dark opacity-75'
                          }`}
                        >
                          <span className="fw-bold smallest ls-1">{dayNum}</span>
                          {status && (
                            <span className="fw-bold smallest text-uppercase text-center ls-1 opacity-75">{status.status}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {/* Fill remaining space to keep grid consistent */}
                  {Array.from({ length: (7 - (new Date(currentYear, currentMonth, 1).getDay() + getDaysInMonth(currentMonth, currentYear)) % 7) % 7 }).map((_, i) => (
                    <div key={`end-empty-${i}`} className="col" />
                  ))}
                </div>
              </Card>
            </Col>

            {/* ── Status intelligence pod ── */}
            <Col xl={4}>
              <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                <h6 className="fw-bold mb-4 text-dark smallest text-uppercase ls-2 border-bottom pb-3">Status Definition HUB</h6>
                <div className="d-flex flex-column gap-4">
                  {[
                    { label: 'Present Engagement', color: 'success' },
                    { label: 'Absent Delta', color: 'danger' },
                    { label: 'Late Arrival Vector', color: 'warning' },
                    { label: 'Institutional Holiday', color: 'dark opacity-25' },
                  ].map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-3">
                      <div className={`bg-${item.color} rounded-circle border`} style={{ width: '14px', height: '14px' }}></div>
                      <span className="smallest fw-bold text-secondary text-uppercase ls-1">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-0 shadow-sm rounded-4 p-4 bg-dark text-white border-bottom border-5 border-primary">
                <h6 className="fw-bold text-uppercase smallest ls-2 mb-4 opacity-50 border-bottom border-white border-opacity-10 pb-3">Operational Consistency Index</h6>
                <div className="display-5 fw-bold mb-2 ls-1">{stats.percentage}%</div>
                <p className="smallest mb-4 opacity-75 fw-medium ls-1 lh-base">Make sure to maintain above 75% attendance for exam eligibility.</p>
                <div className="mb-4">
                   <ProgressBar now={parseFloat(stats.percentage)} variant="primary" style={{ height: '8px' }} className="bg-white bg-opacity-10 border-0 shadow-none rounded-pill" />
                </div>
                <div className="d-flex flex-column gap-2 mt-2">
                   <Button variant="outline-light" className="w-100 fw-bold smallest py-3 rounded-pill border-light border-opacity-25 shadow-none text-uppercase ls-1">Contact Support</Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
};

export default StudentAttendance;

import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Badge, Spinner } from 'react-bootstrap';

// Custom CSS to enforce 7-column grid and calendar styling
const calendarStyles = `
  .attendance-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    width: 100%;
  }
  .attendance-cell {
    min-height: 100px;
  }
`;

const StudentAttendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({ present: 0, absent: 0, percentage: '0' });

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth, currentYear]);

  const fetchAttendance = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!user?._id) return;

    try {
      const month = currentMonth + 1;
      const res = await fetch(`/api/academics/attendance/report/${user._id}?month=${month}&year=${currentYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setAttendance(data.data.details || []);
        setSummary({
          present: data.data.present || 0,
          absent: data.data.absent || 0,
          percentage: data.data.percentage || '0'
        });
      } else {
        setError(data.message || 'Failed to synchronize presence hub.');
      }
    } catch (err) {
      setError('Operational error: Could not load presence data.');
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (offset: number) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    else if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  
  const getDayStatus = (dayNum: number) => {
    const d = dayNum.toString().padStart(2, '0');
    const m = (currentMonth + 1).toString().padStart(2, '0');
    const targetDateStr = `${currentYear}-${m}-${d}`;
    return attendance.find(a => a.date.split('T')[0] === targetDateStr);
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(currentYear, currentMonth));
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <style>{calendarStyles}</style>
      <StudentSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Attendance Ledger" error={error} />

        <div className="container-fluid p-4 p-lg-5">
           {/* ── Summary Visualization ── */}
           <Row className="g-4 mb-5">
              {[
                { label: 'PRESENT DAYS', value: summary.present, color: 'success' },
                { label: 'ABSENT DAYS', value: summary.absent, color: 'danger' },
              ].map((stat, i) => (
                <Col key={i} md={6}>
                  <Card className="border-0 shadow-sm rounded-4 p-4 text-center bg-white">
                    <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1 opacity-50">{stat.label}</span>
                    <h4 className={`fw-bold mb-0 text-${stat.color}`}>{stat.value}</h4>
                  </Card>
                </Col>
              ))}
           </Row>

           {/* ── Attendance Register (Calendar) ── */}
           <Card className="border-0 shadow-sm rounded-4 p-4 p-lg-5 bg-white shadow-sm overflow-hidden">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-5 gap-3 border-bottom pb-4">
                 <h5 className="fw-bold text-dark mb-0 ls-1 text-uppercase smallest">{monthName} {currentYear}</h5>
                 <div className="btn-group btn-group-sm shadow-sm rounded-pill overflow-hidden border">
                    <button className="btn btn-white px-4 py-2 fw-bold smallest ls-1 border-end" onClick={() => changeMonth(-1)}>PREV</button>
                    <button className="btn btn-white px-4 py-2 fw-bold smallest ls-1 border-end" onClick={() => { setCurrentMonth(new Date().getMonth()); setCurrentYear(new Date().getFullYear()); }}>SYNC</button>
                    <button className="btn btn-white px-4 py-2 fw-bold smallest ls-1" onClick={() => changeMonth(1)}>NEXT</button>
                 </div>
              </div>

              {/* ── Labels ── */}
              <div className="attendance-grid text-center mb-1">
                 {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="smallest fw-bold text-secondary ls-1 py-3 opacity-50">{day}</div>
                 ))}
              </div>

              {/* ── Grid ── */}
              <div className="position-relative min-vh-50">
                 {loading ? (
                    <div className="py-5 text-center"><Spinner animation="grow" variant="primary" size="sm" /></div>
                 ) : (
                    <div className="attendance-grid">
                      {/* Empty slots for month alignment */}
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="attendance-cell rounded-4 bg-light opacity-25" />
                      ))}

                      {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, i) => {
                        const dayNum = i + 1;
                        const status = getDayStatus(dayNum);
                        const dayOfWeek = (firstDayOfMonth + i) % 7;
                        const isHoliday = dayOfWeek === 6; // Only Saturday
                        
                        // Ignore non-Saturday holidays from DB
                        const displayStatus = (status?.status === 'holiday' && !isHoliday) ? null : status?.status;

                        return (
                          <div key={dayNum} className="attendance-cell">
                            <div 
                               className={`h-100 rounded-4 p-3 d-flex flex-column justify-content-between border ${
                                displayStatus === 'present' ? 'bg-success-soft border-success text-success' :
                                displayStatus === 'absent' ? 'bg-danger-soft border-danger text-danger' :
                                displayStatus === 'holiday' ? 'bg-dark-soft border-dark text-dark border-2' :
                                isHoliday ? 'bg-dark-soft border-dark opacity-50' : 
                                'bg-white border-light text-muted'
                              }`}
                            >
                              <span className="fw-bold smallest ls-1">{dayNum}</span>
                              <div className="text-center">
                                <span className="fw-bold smallest text-uppercase ls-1 opacity-75">
                                  {displayStatus || (isHoliday ? 'holiday' : '')}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                 )}
              </div>

              {/* ── Key ── */}
              {!loading && (
                <div className="mt-5 pt-4 border-top d-flex gap-4 justify-content-center flex-wrap">
                    {[
                      { label: 'Present', color: 'success' },
                      { label: 'Absent', color: 'danger' },
                      { label: 'Holiday', color: 'dark opacity-25' },
                    ].map(k => (
                      <div key={k.label} className="d-flex align-items-center gap-2">
                        <Badge bg={k.color} className={`p-1 rounded-circle`}>&nbsp;</Badge>
                        <span className="smallest fw-bold text-muted text-uppercase ls-1 opacity-75">{k.label}</span>
                      </div>
                    ))}
                </div>
              )}
           </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentAttendance;

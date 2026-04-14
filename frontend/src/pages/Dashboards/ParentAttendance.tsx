import React, { useState, useEffect, useCallback } from 'react';
import ParentSidebar from '../../components/ParentSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Spinner } from 'react-bootstrap';

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

const ParentAttendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  
  const [attendance, setAttendance] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({ present: 0, absent: 0, percentage: '0' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    if (user?._id) fetchParentProfile();
    const sync = () => {
      const id = localStorage.getItem('selectedChildId');
      if (id) fetchParentProfile(id);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [user]);

  const fetchParentProfile = async (forceId?: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.user) {
        const list = data.user.parentProfile?.children || [];
        const storedId = localStorage.getItem('selectedChildId');
        const match = forceId 
          ? list.find((c: any) => c._id === forceId) 
          : (list.find((c: any) => c._id === storedId) || list[0]);
        if (match) setSelectedChild(match);
      }
    } catch (err) { console.error(err); }
  };

  const fetchAttendance = useCallback(async () => {
    if (!selectedChild?._id) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const studentUserId = selectedChild.userId?._id || selectedChild.userId;
      const res = await fetch(`/api/academics/attendance/report/${studentUserId}?month=${currentMonth + 1}&year=${currentYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAttendance(data.data.details || []);
        setSummary({ present: data.data.present || 0, absent: data.data.absent || 0, percentage: data.data.percentage || '0' });
      }
    } catch (err) { setError('Failed to load presence data.'); }
    finally { setLoading(false); }
  }, [selectedChild, currentMonth, currentYear]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const changeMonth = (offset: number) => {
    let newM = currentMonth + offset;
    let newY = currentYear;
    if (newM < 0) { newM = 11; newY--; } else if (newM > 11) { newM = 0; newY++; }
    setCurrentMonth(newM);
    setCurrentYear(newY);
  };

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getDayStatus = (dNum: number) => {
    const dStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dNum.toString().padStart(2, '0')}`;
    return attendance.find(a => a.date.split('T')[0] === dStr);
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(currentYear, currentMonth));
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <style>{calendarStyles}</style>
      <ParentSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Attendance Registry" error={error} />
        <div className="container-fluid p-4 p-lg-5">
           <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4 border-bottom pb-4">
              <div>
                 <h5 className="fw-bold text-dark mb-0 uppercase ls-1">{selectedChild?.userId?.name || 'Loading...'}</h5>
                 <span className="smallest text-muted fw-bold text-uppercase ls-1">Monthly Presence Monitor</span>
              </div>
              <div className="btn-group btn-group-sm shadow-sm rounded-pill overflow-hidden border bg-white">
                <button className="btn btn-white px-4 py-2 fw-bold smallest ls-1 border-end" onClick={() => changeMonth(-1)}>PREV</button>
                <button className="btn btn-white px-4 py-2 fw-bold smallest ls-1" onClick={() => changeMonth(1)}>NEXT</button>
              </div>
           </div>

           <Row className="g-4 mb-5">
              {[
                { label: 'PRESENT', value: summary.present, color: 'success' },
                { label: 'ABSENT', value: summary.absent, color: 'danger' },
                { label: 'RATE', value: `${summary.percentage}%`, color: 'primary' },
              ].map((stat, i) => (
                <Col key={i} md={4}>
                  <Card className="border-0 shadow-sm rounded-4 p-4 text-center bg-white">
                    <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1 opacity-50">{stat.label}</span>
                    <h4 className={`fw-bold mb-0 text-${stat.color}`}>{stat.value}</h4>
                  </Card>
                </Col>
              ))}
           </Row>

           <Card className="border-0 shadow-sm rounded-4 p-4 p-lg-5 bg-white shadow-sm overflow-hidden">
              <h5 className="fw-bold text-dark mb-5 ls-1 text-uppercase smallest border-bottom pb-4">{monthName} {currentYear}</h5>
              <div className="attendance-grid text-center mb-1">
                 {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="smallest fw-bold text-secondary ls-1 py-3 opacity-50">{day}</div>
                 ))}
              </div>
              <div className="position-relative min-vh-50">
                 {loading ? <div className="py-5 text-center"><Spinner animation="grow" variant="primary" size="sm" /></div> : (
                    <div className="attendance-grid">
                      {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="attendance-cell rounded-4 bg-light opacity-25" />)}
                      {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, i) => {
                        const dNum = i + 1;
                        const status = getDayStatus(dNum);
                        const isHoliday = (firstDay + i) % 7 === 6;
                        const dStat = (status?.status === 'holiday' && !isHoliday) ? null : status?.status;
                        return (
                          <div key={dNum} className="attendance-cell">
                             <div className={`h-100 rounded-4 p-3 d-flex flex-column justify-content-between border ${dStat === 'present' ? 'bg-success-soft border-success text-success' : dStat === 'absent' ? 'bg-danger-soft border-danger text-danger' : dStat === 'holiday' ? 'bg-dark-soft border-dark text-dark border-2' : isHoliday ? 'bg-dark-soft border-dark opacity-50' : 'bg-white border-light text-muted'}`}>
                                <span className="fw-bold smallest ls-1">{dNum}</span>
                                <div className="text-center"><span className="fw-bold smallest text-uppercase ls-1 opacity-75">{dStat || (isHoliday ? 'holiday' : '')}</span></div>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                 )}
              </div>
           </Card>
        </div>
      </main>
    </div>
  );
};

export default ParentAttendance;

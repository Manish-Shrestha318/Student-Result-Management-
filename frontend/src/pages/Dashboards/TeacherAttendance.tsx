import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Spinner, Button } from 'react-bootstrap';
import TeacherSidebar from '../../components/TeacherSidebar';
import AdminHeader from '../../components/AdminHeader';

const calendarStyles = `
  .attendance-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    width: 100%;
  }
  .attendance-cell {
    min-height: 100px;
    transition: all 0.2s ease;
  }
  .attendance-cell:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
`;

const TeacherAttendance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA')); 

  const [records, setRecords] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({ present: 0, absent: 0, percentage: '0' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/dashboard/teacher', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
          setClasses(data.assignedClassesList || data.classes || []);
          setStudents(data.students || []);
      }
    } catch (err) {
      setError("Failed to load attendance data.");
    }
  };

  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number);
      if (parts.length === 3) {
        setCurrentMonth(parts[1] - 1);
        setCurrentYear(parts[0]);
      }
    }
  }, [selectedDate]);

  const fetchRecords = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const month = currentMonth + 1;
      const res = await fetch(`/api/academics/attendance/report/${selectedStudent}?month=${month}&year=${currentYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
          setRecords(data.data.details || []);
          setStats({
            present: data.data.present || 0,
            absent: data.data.absent || 0,
            percentage: data.data.percentage || '0'
          });
      }
    } catch (err) {
      setError("Failed to load attendance logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudent) fetchRecords();
  }, [selectedStudent, currentMonth, currentYear]);

  const changeMonth = (offset: number) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    else if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(`${newYear}-${(newMonth + 1).toString().padStart(2, '0')}-01`);
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  
  // ROBUST DATE MATCHING Logic
  const getDayStatus = (dayNum: number) => {
    return records.find(a => {
      // Use the actual Date object parts to match the day exactly, avoiding UTC-flip issues
      const recordDate = new Date(a.date);
      return recordDate.getDate() === dayNum && 
             recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear;
    });
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(currentYear, currentMonth));

  const handleToggleAttendance = async (dayNum: number) => {
    if (!selectedStudent || loading) return; 
    
    // Construct local date string
    const dStr = dayNum.toString().padStart(2, '0');
    const mStr = (currentMonth + 1).toString().padStart(2, '0');
    const dateStr = `${currentYear}-${mStr}-${dStr}`;
    
    setSelectedDate(dateStr);

    const existing = getDayStatus(dayNum);
    // FULL CYCLE Logic: present -> absent -> holiday -> normal -> present
    let nextStatus: string = 'present';
    if (!existing) nextStatus = 'present';
    else if (existing.status === 'present') nextStatus = 'absent';
    else if (existing.status === 'absent') nextStatus = 'holiday';
    else if (existing.status === 'holiday') nextStatus = 'normal';
    else nextStatus = 'present';
    
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/academics/attendance/mark', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          date: dateStr,
          status: nextStatus,
          remarks: ''
        })
      });
      const data = await res.json();
      if (data.success) {
        // Force the record list to update locally to prevent "stuck" UI
        const updatedRecords = [...records];
        const recordIndex = updatedRecords.findIndex(a => {
             const rd = new Date(a.date);
             return rd.getDate() === dayNum && rd.getMonth() === currentMonth && rd.getFullYear() === currentYear;
        });
        
        if (nextStatus === 'normal') {
            if (recordIndex !== -1) {
                updatedRecords.splice(recordIndex, 1);
            }
        } else {
            if (recordIndex !== -1) {
                updatedRecords[recordIndex] = { ...updatedRecords[recordIndex], status: nextStatus };
            } else {
                updatedRecords.push({ date: new Date(currentYear, currentMonth, dayNum).toISOString(), status: nextStatus });
            }
        }
        setRecords(updatedRecords);
        // Also fetch from server to be sure
        fetchRecords(); 
      }
    } catch (err) {
      alert("System Busy: Please wait before toggling again.");
    } finally {
      setLoading(false);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <style>{calendarStyles}</style>
      <TeacherSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Attendance" error={error} />

        <div className="container-fluid p-4 p-lg-5">
            <Row className="g-4">
               {/* ── Selection HUB ── */}
               <Col lg={4}>
                  <Card className="border-0 shadow-sm rounded-4 p-4 bg-white sticky-top shadow-sm" style={{ top: '2rem' }}>
                    <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-0 text-uppercase smallest ls-2">Attendance Form</h6>
                        <span className="smallest text-muted fw-bold ls-1 opacity-50 uppercase">Options</span>
                        {loading && <Spinner animation="border" variant="primary" size="sm" className="ms-2 opacity-50" />}
                    </div>
                    
                    <Form onSubmit={(e) => e.preventDefault()}>
                       <Form.Group className="mb-4">
                          <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Class</Form.Label>
                          <Form.Select className="py-3 border-light shadow-none bg-light rounded-4 smallest fw-bold" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                             <option value="">CHOOSE CLASS</option>
                             {classes.map(c => <option key={c._id} value={`${c.name} — ${c.section}`}>{c.name} — {c.section}</option>)}
                          </Form.Select>
                       </Form.Group>

                       <Form.Group className="mb-4">
                          <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Select Student</Form.Label>
                          <Form.Select required className="py-3 border-light shadow-none bg-light rounded-4 smallest fw-bold" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                             <option value="">CHOOSE STUDENT</option>
                             {students.filter(s => !selectedClass || `${s.class} — ${s.section}` === selectedClass).map(s => (
                                <option key={s._id} value={s._id}>{s.class} {s.section} — {s.name} ({s.rollNumber})</option>
                             ))}
                          </Form.Select>
                       </Form.Group>

                       <Form.Group className="mb-0">
                          <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Selected Date</Form.Label>
                          <Form.Control type="date" className="py-3 border-light shadow-none bg-light fw-bold smallest ls-1 rounded-4" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                          <div className="mt-4 p-3 rounded-4 bg-light border">
                            <span className="smallest text-secondary fw-bold d-block ls-1 mb-1">HOW TO USE</span>
                            <span className="smallest text-dark opacity-75 d-block italic fw-medium px-1">
                              Click on any date in the calendar to toggle attendance status.
                            </span>
                          </div>
                       </Form.Group>
                    </Form>
                  </Card>
               </Col>

               {/* ── Attendance Calendar ── */}
               <Col lg={8}>
                  {selectedStudent && (
                    <Row className="g-4 mb-4">
                      <Col md={4}>
                        <Card className="border-0 shadow-sm rounded-4 p-4 text-center bg-white">
                          <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1">PRESENT</span>
                          <h4 className="fw-bold mb-0 text-dark">{stats.present}</h4>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="border-0 shadow-sm rounded-4 p-4 text-center bg-white">
                          <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1">ABSENT</span>
                          <h4 className="fw-bold mb-0 text-dark">{stats.absent}</h4>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="border-0 shadow-sm rounded-4 p-4 text-center bg-white">
                          <span className="smallest text-muted fw-bold text-uppercase ls-1 d-block mb-1">PERCENTAGE</span>
                          <h4 className="fw-bold mb-0 text-dark">{stats.percentage}%</h4>
                        </Card>
                      </Col>
                    </Row>
                  )}

                  <Card className="border-0 shadow-sm rounded-4 p-4 bg-white shadow-sm overflow-hidden min-vh-50">
                     <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4 gap-3 border-bottom pb-4">
                        <h6 className="fw-bold text-dark mb-0 text-uppercase smallest ls-2">{monthName} {currentYear}</h6>
                        <div className="btn-group btn-group-sm shadow-sm rounded-pill overflow-hidden border">
                          <Button variant="white" className="px-4 py-2 fw-bold smallest ls-1 border-end" onClick={() => changeMonth(-1)}>PREV</Button>
                          <Button variant="white" className="px-4 py-2 fw-bold smallest ls-1 border-end" onClick={() => { setCurrentMonth(new Date().getMonth()); setCurrentYear(new Date().getFullYear()); setSelectedDate(new Date().toLocaleDateString('en-CA')); }}>TODAY</Button>
                          <Button variant="white" className="px-4 py-2 fw-bold smallest ls-1" onClick={() => changeMonth(1)}>NEXT</Button>
                        </div>
                     </div>

                     <div className="attendance-grid text-center mb-1">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                          <div key={day} className="smallest fw-bold text-secondary ls-1 py-3 opacity-50">{day}</div>
                        ))}
                     </div>

                     <div className="position-relative">
                        {!selectedStudent ? (
                           <div className="py-5 text-center text-muted opacity-50 smallest fw-bold ls-1 uppercase italic px-3">Select a student first to unlock the calendar</div>
                        ) : (
                          <div className="attendance-grid">
                             {/* Empty slots */}
                             {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                               <div key={`empty-${i}`} className="attendance-cell rounded-4 bg-light opacity-25" />
                             ))}

                             {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, i) => {
                               const dayNum = i + 1;
                               const status = getDayStatus(dayNum);
                               const dayOfWeek = (firstDayOfMonth + i) % 7;
                               const isHoliday = dayOfWeek === 6; 
                               
                               const displayStatus = (status?.status === 'holiday' && !isHoliday) ? null : status?.status;

                               return (
                                 <div 
                                   key={dayNum}
                                   onClick={() => handleToggleAttendance(dayNum)}
                                   className={`attendance-cell rounded-4 p-3 d-flex flex-column justify-content-between cursor-pointer border ${
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
                               );
                             })}
                          </div>
                        )}
                     </div>
                  </Card>
               </Col>
            </Row>
        </div>
      </main>
    </div>
  );
};

export default TeacherAttendance;

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Spinner } from 'react-bootstrap';
import TeacherSidebar from '../../components/TeacherSidebar';
import AdminHeader from '../../components/AdminHeader';

const TeacherResults: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [subtopics, setSubtopics] = useState<{ name: string, marks: string }[]>([]);
  const [remarks, setRemarks] = useState('');
  const [totalPossible, setTotalPossible] = useState('100');

  const totalScored = subtopics.reduce((acc, curr) => acc + (parseFloat(curr.marks) || 0), 0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/dashboard/teacher', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();

        if (data.success) {
            setClasses(data.assignedClassesList || []);
            setStudents(data.students || []); 
            setSubjects(data.subjects || []); // Using synchronized subjects directly from dashboard API
        }
    } catch (err) {
        setError("Failed to load records.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find(s => s._id === selectedSubject);
      if (subject && subject.subtopics && subject.subtopics.length > 0) {
        setSubtopics(subject.subtopics.map((name: string) => ({ name, marks: '' })));
        if (subject.fullMarks) setTotalPossible(subject.fullMarks.toString());
      } else {
        setSubtopics([{ name: 'General', marks: '' }]);
      }
    } else {
      setSubtopics([]);
    }
  }, [selectedSubject, subjects]);

  const updateSubtopic = (index: number, value: string) => {
    const next = [...subtopics];
    next[index].marks = value;
    setSubtopics(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject) return alert("Select student and subject.");
    
    const anyMarkEntered = subtopics.some(s => s.marks.trim() !== '' && !isNaN(parseFloat(s.marks)));
    if (!anyMarkEntered) {
      return alert("Enter marks for at least one topic.");
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/academics/marks/marks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            studentId: selectedStudent,
            subjectId: selectedSubject,
            marksObtained: totalScored,
            totalMarks: parseFloat(totalPossible),
            term: selectedTerm,
            year: parseInt(selectedYear),
            remarks,
            examType: selectedTerm,
            topicWise: subtopics.map(s => ({
                topicName: s.name,
                marksObtained: parseFloat(s.marks) || 0,
                totalMarks: parseFloat(totalPossible) / subtopics.length
            }))
          })
        });
        const data = await res.json();
        if (res.ok || data.success) {
            alert("Marks saved.");
            setSubtopics(subtopics.map(s => ({ ...s, marks: '' })));
            setRemarks('');
        } else {
            alert(data.message || "Failed.");
        }
    } catch (err) {
        alert("Error saving.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <TeacherSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Enter Marks" error={error} />

        <div className="container-fluid p-4 p-lg-5">
           <Card className="border-0 shadow-sm rounded-4 bg-white mb-5 p-4 p-md-5">
              <div className="mb-5 border-bottom pb-4">
                 <h4 className="fw-bold text-dark mb-1">Enter Marks</h4>
                 <p className="text-secondary small mb-0 fw-medium">Select student and subject to add results.</p>
              </div>

              <Form onSubmit={handleSubmit}>
                 <Row className="g-4 mb-5">
                    <Col md={3}>
                       <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Year</Form.Label>
                       <Form.Select className="py-2 border-light shadow-none bg-light" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                         <option value="2025">2025</option>
                         <option value="2026">2026</option>
                       </Form.Select>
                    </Col>
                    <Col md={3}>
                       <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Term</Form.Label>
                       <Form.Select className="py-2 border-light shadow-none bg-light" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
                         <option value="First Term">First Term</option>
                         <option value="Second Term">Second Term</option>
                         <option value="Final">Final</option>
                       </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Class / Section</Form.Label>
                        <Form.Select className="py-2 border-light shadow-none bg-light" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                           <option value="">Select Class...</option>
                           {classes.map((c: any) => (
                              <option key={c._id} value={`${c.name} — ${c.section}`}>
                                 {c.name} — {c.section}
                              </option>
                           ))}
                        </Form.Select>
                     </Col>
                     <Col md={3}>
                        <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Student</Form.Label>
                        <Form.Select required className="py-2 border-light shadow-none bg-light" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                           <option value="">Select Student...</option>
                           {students.filter(s => !selectedClass || `${s.class} — ${s.section}` === selectedClass).map(s => (
                              <option key={s._id} value={s._id}>{s.rollNumber} — {s.name}</option>
                           ))}
                        </Form.Select>
                    </Col>
                 </Row>

                 <Row className="g-4 mb-5 pt-4 border-top">
                     <Col md={9}>
                       <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Subject</Form.Label>
                       <Form.Select required className="py-3 border-light shadow-none bg-light fw-bold" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                          <option value="">Select Subject...</option>
                          {subjects.filter(s => !selectedClass || `${s.class} — ${s.section}` === selectedClass).map(s => (
                              <option key={s._id} value={s._id}>{s.name} - {s.class} ({s.section})</option>
                           ))}
                       </Form.Select>
                    </Col>
                    <Col md={3}>
                       <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Full Marks</Form.Label>
                       <Form.Control type="number" className="py-3 border-light shadow-none bg-light fw-bold text-dark" value={totalPossible} onChange={e => setTotalPossible(e.target.value)} />
                    </Col>
                 </Row>

                 <div className="mb-5">
                    <h6 className="fw-bold text-dark mb-4 text-uppercase smallest ls-1 border-bottom pb-2">Topics</h6>
                    <div className="table-responsive rounded-4 border overflow-hidden">
                       <Table hover borderless className="align-middle mb-0 smallest fw-bold text-uppercase ls-1">
                          <thead className="bg-light">
                             <tr>
                                <th className="p-4">Topic Name</th>
                                <th className="p-4 text-center" style={{ width: '220px' }}>Marks</th>
                             </tr>
                          </thead>
                          <tbody>
                             {subtopics.map((item, idx) => (
                                <tr key={idx} className="border-bottom bg-white">
                                   <td className="p-4">
                                      <span className="text-dark fw-bold">{item.name}</span>
                                   </td>
                                   <td className="p-3">
                                       <Form.Control 
                                          type="number" 
                                          step="0.5"
                                          placeholder="0.0" 
                                          className="text-center py-2 border-light shadow-none bg-light smallest fw-bold" 
                                          value={item.marks} 
                                          onChange={e => updateSubtopic(idx, e.target.value)} 
                                       />
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                          {subtopics.length > 0 && (
                            <tfoot className="bg-light border-top">
                                <tr>
                                   <td className="p-4 text-secondary">Total Scored</td>
                                   <td className="p-4 text-center fs-5 text-primary fw-bold">{totalScored} / {totalPossible}</td>
                                </tr>
                            </tfoot>
                          )}
                       </Table>
                    </div>
                 </div>

                 <Form.Group className="mb-5">
                    <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Remarks</Form.Label>
                    <Form.Control as="textarea" rows={2} className="py-3 border-light shadow-none bg-light" placeholder="Internal remarks..." value={remarks} onChange={e => setRemarks(e.target.value)} />
                 </Form.Group>

                 <div className="d-flex justify-content-end gap-3 pt-4 border-top">
                    {loading ? (
                       <Button variant="primary" disabled className="fw-bold px-5 py-3 rounded-pill ls-1 smallest text-uppercase shadow-sm">
                          <Spinner animation="border" size="sm" className="me-2" /> Saving...
                       </Button>
                    ) : (
                       <>
                          <Button variant="light" className="fw-bold px-5 py-3 rounded-pill ls-1 smallest text-uppercase shadow-none border bg-white" onClick={() => setSubtopics(subtopics.map(s => ({ ...s, marks: '' })))}>Clear</Button>
                          <Button type="submit" variant="primary" className="fw-bold px-5 py-3 rounded-pill ls-1 smallest text-uppercase shadow-sm">Save Marks</Button>
                       </>
                    )}
                 </div>
              </Form>
           </Card>
        </div>
      </main>
    </div>
  );
};

export default TeacherResults;


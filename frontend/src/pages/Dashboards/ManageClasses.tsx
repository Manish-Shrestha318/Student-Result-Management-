import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Modal, Button, Form, Row, Col, Card, Badge, Pagination } from 'react-bootstrap';

const ManageClasses: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentClasses = classes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(classes.length / itemsPerPage);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    section: '',
    academicYear: '',
    classTeacher: '',
    roomNumber: '',
  });

  const token = localStorage.getItem('token');

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setClasses(data.classes || data || []);
    } catch {
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/users?role=teacher', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTeachers(data.users || data || []);
    } catch {
      setError('Failed to load teachers list');
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setForm({ name: '', section: '', academicYear: new Date().getFullYear().toString(), classTeacher: '', roomNumber: '' });
    setShowModal(true);
  };

  const openEditModal = (cls: any) => {
    setModalMode('edit');
    setSelectedClass(cls);
    setForm({
      name: cls.name || '',
      section: cls.section || '',
      academicYear: cls.academicYear || '',
      classTeacher: cls.classTeacher?._id || cls.classTeacher || '',
      roomNumber: cls.roomNumber || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const url = modalMode === 'add' ? '/api/classes' : `/api/classes/${selectedClass._id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';
    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok || data.success) {
        setShowModal(false);
        fetchClasses();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch {
      alert('Error saving class');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this class? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchClasses();
      else alert('Failed to delete class');
    } catch {
      alert('Error deleting class');
    }
  };

  const getTeacherName = (classTeacher: any) => {
    if (!classTeacher) return 'Unassigned';
    if (typeof classTeacher === 'object') return classTeacher.name || 'Unknown';
    const t = teachers.find(t => t._id === classTeacher);
    return t ? t.name : 'Unknown';
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Class Governance" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Directory Header ── */}
          <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-light-dark">
            <div>
              <h3 className="fw-bold text-dark mb-1">Classroom Directory</h3>
              <p className="text-secondary small mb-0">System-wide registry of all academic cohorts and physical room assignments.</p>
            </div>
            <Button variant="primary" className="fw-bold px-4 py-2 rounded-pill shadow-sm" onClick={openAddModal}>
              ADD NEW CLASS
            </Button>
          </div>

          {/* ── Analysis Grid ── */}
          {loading ? (
            <div className="py-5 text-center text-muted fw-bold">Synchronizing classroom data...</div>
          ) : classes.length === 0 ? (
            <div className="card shadow-sm border-0 rounded-4 py-5 text-center">
              <div className="card-body">
                <h5 className="text-secondary fw-bold mb-2">No active cohorts detected</h5>
                <p className="text-muted small mb-0">Initiate the first academic class to begin management.</p>
              </div>
            </div>
          ) : (
            <>
              <Row className="g-4">
                {currentClasses.map((cls) => (
                  <Col key={cls._id} xs={12} md={6} xl={4}>
                    <Card className="h-100 shadow-sm border-0 rounded-4 hover-lift transition-all border-top border-4 border-primary">
                      <Card.Body className="p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                          <div>
                            <h5 className="fw-bold text-dark mb-1">{cls.name} — {cls.section}</h5>
                            <Badge bg="light" text="primary" className="fw-bold smaller border py-2 px-3 rounded-pill text-uppercase">
                              Academic Year {cls.academicYear}
                            </Badge>
                          </div>
                          <div className="d-flex gap-1">
                            <Button variant="outline-primary" size="sm" className="fw-bold border-0 bg-light" onClick={() => openEditModal(cls)}>
                              EDIT
                            </Button>
                            <Button variant="outline-danger" size="sm" className="fw-bold border-0 bg-danger-soft text-danger" onClick={() => handleDelete(cls._id)}>
                              REMOVE
                            </Button>
                          </div>
                        </div>

                        <div className="mt-auto d-flex flex-column gap-2 text-secondary smaller">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">CLASS TEACHER</span>
                            <span className="text-dark bg-white border px-2 py-1 rounded small fw-medium">{getTeacherName(cls.classTeacher)}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">POPULATION</span>
                            <span className="text-dark fw-bold">{cls.students?.length || 0} Learners</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">CURRICULUM</span>
                            <span className="text-dark fw-bold">{cls.subjects?.length || 0} Modules</span>
                          </div>
                          {cls.roomNumber && (
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold">ROOM</span>
                              <span className="badge bg-light text-dark fw-bold border">{cls.roomNumber}</span>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="mt-5 d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm">
                  <span className="smaller text-secondary fw-medium ps-2">Showing {indexOfFirst + 1}–{Math.min(indexOfLast, classes.length)} of {classes.length} entries</span>
                  <Pagination className="mb-0 gap-1 pagination-sm">
                    <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} />
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>
                        {p}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Operational Modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="border-0 shadow-lg">
        <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
          <Modal.Title className="fw-bold text-dark fs-5">
            {modalMode === 'add' ? 'CREATE CLASS' : 'UPDATE CLASS'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Class Name</Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  className="py-2 border-light-dark shadow-none" 
                  placeholder="e.g. Grade 10" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                />
              </Col>
              <Col md={6}>
                <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Section</Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  className="py-2 border-light-dark shadow-none" 
                  placeholder="e.g. A" 
                  value={form.section} 
                  onChange={e => setForm({ ...form, section: e.target.value })} 
                />
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Academic Year</Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  className="py-2 border-light-dark shadow-none" 
                  placeholder="e.g. 2025" 
                  value={form.academicYear} 
                  onChange={e => setForm({ ...form, academicYear: e.target.value })} 
                />
              </Col>
              <Col md={6}>
                <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Room (Optional)</Form.Label>
                <Form.Control 
                  type="text" 
                  className="py-2 border-light-dark shadow-none" 
                  placeholder="e.g. 201" 
                  value={form.roomNumber} 
                  onChange={e => setForm({ ...form, roomNumber: e.target.value })} 
                />
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Class Teacher</Form.Label>
              <Form.Select 
                required 
                className="py-2 border-light-dark shadow-none" 
                value={form.classTeacher} 
                onChange={e => setForm({ ...form, classTeacher: e.target.value })}
              >
                <option value="">Choose a verified teacher profile...</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.name} — {t.email}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-2 pt-2">
              <Button variant="light" className="flex-grow-1 fw-bold rounded-pill border py-2" onClick={() => setShowModal(false)}>
                DISCARD
              </Button>
              <Button variant="primary" type="submit" className="flex-grow-1 fw-bold rounded-pill py-2" disabled={formLoading}>
                {formLoading ? 'PROCESSING...' : (modalMode === 'add' ? 'CONFIRM' : 'SAVE CHANGES')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageClasses;


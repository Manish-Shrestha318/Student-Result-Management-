import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Modal, Button, Form, Row, Col, Table, Badge, Pagination, InputGroup } from 'react-bootstrap';

const ManageSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    class: '',
    teacherId: '',
    fullMarks: 100,
    passMarks: 40,
  });

  const token = localStorage.getItem('token');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSubjects(data.subjects || data || []);
    } catch {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/users?role=teacher', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTeachers(data.users || data || []);
    } catch {}
  };

  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setForm({ name: '', code: '', class: '', teacherId: '', fullMarks: 100, passMarks: 40 });
    setShowModal(true);
  };

  const openEditModal = (sub: any) => {
    setModalMode('edit');
    setSelectedSubject(sub);
    setForm({
      name: sub.name || '',
      code: sub.code || '',
      class: sub.class || '',
      teacherId: sub.teacherId?._id || sub.teacherId || '',
      fullMarks: sub.fullMarks || 100,
      passMarks: sub.passMarks || 40,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const url = modalMode === 'add' ? '/api/subjects' : `/api/subjects/${selectedSubject._id}`;
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
        fetchSubjects();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch {
      alert('Error saving subject');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this subject? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchSubjects();
      else alert('Failed to delete subject');
    } catch {
      alert('Error deleting subject');
    }
  };

  const getTeacherName = (teacherId: any) => {
    if (!teacherId) return 'Unassigned';
    if (typeof teacherId === 'object') return teacherId.name || 'Unknown';
    const t = teachers.find(t => t._id === teacherId);
    return t ? t.name : 'Unknown';
  };

  const filtered = subjects.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSubjects = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Curriculum Authority" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Curriculum Header ── */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-3 border-bottom border-light-dark gap-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">Subjects</h3>
              <p className="text-secondary small mb-0">Manage all subjects, marks, and teacher assignments.</p>
            </div>
            <div className="d-flex gap-3 align-items-center">
              <InputGroup className="shadow-none border-light-dark" style={{ width: '280px' }}>
                <Form.Control
                  placeholder="Filter by subject/code..."
                  className="py-2 border-end-0 shadow-none smaller fw-medium"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Button variant="primary" className="fw-bold px-4 py-2 rounded-pill shadow-sm" onClick={openAddModal}>
                REGISTER SUBJECT
              </Button>
            </div>
          </div>

          {/* ── Data Terminal ── */}
          {loading ? (
            <div className="py-5 text-center text-muted fw-bold">Synchronizing curriculum records...</div>
          ) : filtered.length === 0 ? (
            <div className="card shadow-sm border-0 rounded-4 py-5 text-center">
              <div className="card-body">
                <h5 className="text-secondary fw-bold mb-2">No subjects matched your criteria</h5>
                <p className="text-muted small mb-0">Try refining your filter or creating a new subject record.</p>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light border-bottom border-light-dark">
                    <tr>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Module Name</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Unique Code</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Target Cohort</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Strategic Lead</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Benchmark (Full/Pass)</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary text-end">Governance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubjects.map((sub) => (
                      <tr key={sub._id} className="transition-all">
                        <td className="px-4 py-3">
                          <span className="fw-bold text-dark">{sub.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <code className="bg-secondary bg-opacity-10 text-primary px-2 py-1 rounded small fw-bold">
                            {sub.code}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-secondary smaller fw-medium">{sub.class}</td>
                        <td className="px-4 py-3">
                          <span className="small fw-semibold text-dark">{getTeacherName(sub.teacherId)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-2">
                             <Badge bg="success-soft" text="success" className="fw-bold smaller border px-2 py-1">{sub.fullMarks}</Badge>
                             <span className="text-muted smaller">/</span>
                             <Badge bg="danger-soft" text="danger" className="fw-bold smaller border px-2 py-1">{sub.passMarks}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-end">
                           <div className="d-flex justify-content-end gap-1">
                              <Button variant="outline-primary" size="sm" className="fw-bold border-0 bg-light" onClick={() => openEditModal(sub)}>
                                UPDATE
                              </Button>
                              <Button variant="outline-danger" size="sm" className="fw-bold border-0 bg-danger-soft text-danger" onClick={() => handleDelete(sub._id)}>
                                DELETE
                              </Button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* ── Control Flow Pagination ── */}
              {totalPages > 1 && (
                <div className="p-4 border-top border-light-dark d-flex justify-content-between align-items-center bg-white">
                  <span className="smaller text-secondary fw-medium">Displaying {indexOfFirst + 1}–{Math.min(indexOfLast, filtered.length)} of {filtered.length} resources</span>
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
            </div>
          )}
        </div>
      </main>

      {/* ── Operational Terminal (Modal) ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="border-0 shadow-lg">
        <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
          <Modal.Title className="fw-bold text-dark fs-5">
            {modalMode === 'add' ? 'REGISTER NEW MODULE' : 'RECONFIGURE MODULE'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Subject Full Name</Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  className="py-2 border-light-dark shadow-none" 
                  placeholder="e.g. Mathematics" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                />
              </Col>
              <Col md={6}>
                <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Registry Code</Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  className="py-2 border-light-dark shadow-none" 
                  placeholder="e.g. MATH101" 
                  value={form.code} 
                  onChange={e => setForm({ ...form, code: e.target.value })} 
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Assigned Cohort (Class)</Form.Label>
              <Form.Control 
                required 
                type="text" 
                className="py-2 border-light-dark shadow-none" 
                placeholder="e.g. Grade 10" 
                value={form.class} 
                onChange={e => setForm({ ...form, class: e.target.value })} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Strategic Module Lead (Teacher)</Form.Label>
              <Form.Select 
                required 
                className="py-2 border-light-dark shadow-none" 
                value={form.teacherId} 
                onChange={e => setForm({ ...form, teacherId: e.target.value })}
              >
                <option value="">Choose a verified instructor...</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.name} — {t.email}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Max Capacity (Marks)</Form.Label>
                <Form.Control 
                  type="number" 
                  required 
                  className="py-2 border-light-dark shadow-none" 
                  value={form.fullMarks} 
                  onChange={e => setForm({ ...form, fullMarks: Number(e.target.value) })} 
                  min={1} 
                />
              </Col>
              <Col md={6}>
                <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Threshold (Pass Marks)</Form.Label>
                <Form.Control 
                  type="number" 
                  required 
                  className="py-2 border-light-dark shadow-none" 
                  value={form.passMarks} 
                  onChange={e => setForm({ ...form, passMarks: Number(e.target.value) })} 
                  min={1} 
                />
              </Col>
            </Row>

            <div className="d-flex gap-2 pt-2">
              <Button variant="light" className="flex-grow-1 fw-bold rounded-pill border py-2" onClick={() => setShowModal(false)}>
                DISCARD
              </Button>
              <Button variant="primary" type="submit" className="flex-grow-1 fw-bold rounded-pill py-2" disabled={formLoading}>
                {formLoading ? 'PROCESSING...' : (modalMode === 'add' ? 'CONFIRM REGISTRY' : 'SAVE CHANGES')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageSubjects;


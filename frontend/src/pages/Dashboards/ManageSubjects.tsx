import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Modal, Button, Form, Row, Col, Table, Badge, Pagination, InputGroup } from 'react-bootstrap';

const ManageSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
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
    section: '',
    teacherId: '',
    fullMarks: 100,
    passMarks: 40,
    subtopics: [] as string[]
  });

  const [newSubtopic, setNewSubtopic] = useState('');
  const token = localStorage.getItem('token');

  // Automatic Code Sync [NAME]-[CLASS_ID][SECTION]
  useEffect(() => {
    if (form.name && form.class && form.section) {
      const namePart = form.name.trim().substring(0, 4).toUpperCase();
      const numberMatch = form.class.match(/\d+/);
      const classPart = numberMatch ? numberMatch[0] : form.class.trim().toUpperCase();
      const newCode = `${namePart}-${classPart}`;
      if (form.code !== newCode) {
        setForm(prev => ({ ...prev, code: newCode }));
      }
    }
  }, [form.name, form.class, form.section]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSubjects(data.subjects || data || []);
    } catch {
      setError('Failed to load subjects.');
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

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setClasses(data.classes || data || []);
    } catch {}
  };

  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
    fetchClasses();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setForm({ name: '', code: '', class: '', section: '', teacherId: '', fullMarks: 100, passMarks: 40, subtopics: [] });
    setNewSubtopic('');
    setShowModal(true);
  };

  const openEditModal = (sub: any) => {
    setModalMode('edit');
    setSelectedSubject(sub);
    setForm({
      name: sub.name || '',
      code: sub.code || '',
      class: sub.class || '',
      section: sub.section || '',
      teacherId: sub.teacherId?._id || sub.teacherId || '',
      fullMarks: sub.fullMarks || 100,
      passMarks: sub.passMarks || 40,
      subtopics: sub.subtopics || []
    });
    setNewSubtopic('');
    setShowModal(true);
  };

  const addSubtopic = () => {
    if (newSubtopic.trim()) {
      if (newSubtopic.trim().length > 30) {
        return alert("Topic name cannot exceed 30 characters.");
      }
      setForm({ ...form, subtopics: [...form.subtopics, newSubtopic.trim()] });
      setNewSubtopic('');
    }
  };

  const removeSubtopic = (index: number) => {
    const updated = [...form.subtopics];
    updated.splice(index, 1);
    setForm({ ...form, subtopics: updated });
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
        alert(data.message || 'Error occurred.');
      }
    } catch {
      alert('Error saving.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchSubjects();
      else alert('Failed to delete.');
    } catch {
      alert('Error deleting.');
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
        <AdminHeader title="Manage Subjects" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-3 border-bottom border-light-dark gap-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">Manage Subjects</h3>
              <p className="text-secondary small mb-0">Add, edit, or delete school subjects and topics.</p>
            </div>
            <div className="d-flex gap-3 align-items-center">
              <InputGroup className="shadow-none border-light-dark" style={{ width: '280px' }}>
                <Form.Control
                  placeholder="Search subject or code..."
                  className="py-2 border-end-0 shadow-none smaller fw-medium bg-white"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Button variant="primary" className="fw-bold px-4 py-2 rounded-pill shadow-none smallest text-uppercase ls-1" onClick={openAddModal}>
                Add Subject
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-5 text-center text-muted fw-bold">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="card shadow-sm border-0 rounded-4 py-5 text-center bg-white">
              <div className="card-body">
                <h5 className="text-secondary fw-bold mb-2">No subjects found</h5>
                <p className="text-muted small mb-0">Start by adding a new academic subject.</p>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden border bg-white">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 text-center">
                  <thead className="bg-light border-bottom border-light-dark">
                    <tr>
                      <th className="px-4 py-3 smallest fw-bold text-uppercase text-secondary ls-1">Name</th>
                      <th className="px-4 py-3 smallest fw-bold text-uppercase text-secondary ls-1">Code</th>
                      <th className="px-4 py-3 smallest fw-bold text-uppercase text-secondary ls-1">Class / Section</th>
                      <th className="px-4 py-3 smallest fw-bold text-uppercase text-secondary ls-1">Teacher</th>
                      <th className="px-4 py-3 smallest fw-bold text-uppercase text-secondary ls-1">Marks (F/P)</th>
                      <th className="px-4 py-3 smallest fw-bold text-uppercase text-secondary ls-1 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubjects.map((sub) => (
                      <tr key={sub._id} className="transition-all bg-white">
                        <td className="px-4 py-3">
                          <span className="fw-bold text-dark">{sub.name}</span>
                          {sub.subtopics && sub.subtopics.length > 0 && (
                            <div className="smallest text-muted italic opacity-75 mt-1">{sub.subtopics.length} topics added</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <code className="bg-primary-soft text-primary px-3 py-1 rounded small fw-bold">{sub.code}</code>
                        </td>
                        <td className="px-4 py-3 text-secondary smallest fw-bold uppercase">
                           <Badge bg="light" text="dark" className="border shadow-none">{sub.class}</Badge>
                           <Badge bg="dark" className="ms-1 shadow-none ls-1">{sub.section}</Badge>
                        </td>
                        <td className="px-4 py-3 small fw-semibold text-dark">{getTeacherName(sub.teacherId)}</td>
                        <td className="px-4 py-3">
                           <Badge bg="success-soft" text="success" className="fw-bold border me-1">{sub.fullMarks}</Badge>
                           <Badge bg="danger-soft" text="danger" className="fw-bold border">{sub.passMarks}</Badge>
                        </td>
                        <td className="px-4 py-3 text-end">
                           <div className="d-flex justify-content-end gap-3 px-2">
                              <Button variant="link" className="text-primary fw-bold smallest text-uppercase p-0 text-decoration-none" onClick={() => openEditModal(sub)}>UPDATE</Button>
                              <Button variant="link" className="text-danger fw-bold smallest text-uppercase p-0 text-decoration-none" onClick={() => handleDelete(sub._id)}>DELETE</Button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {totalPages > 1 && (
                 <div className="p-4 border-top border-light-dark d-flex justify-content-between align-items-center bg-white px-5">
                   <span className="smaller text-secondary fw-medium opacity-75">Page {currentPage} of {totalPages}</span>
                   <Pagination className="mb-0 gap-1 pagination-sm shadow-none border-0">
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold text-dark fs-5">{modalMode === 'add' ? 'Add Subject' : 'Update Subject'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Label className="smallest fw-bold text-muted text-uppercase mb-2 ls-1">Subject Name</Form.Label>
                <Form.Control 
                  required 
                  type="text" 
                  className="py-2 border-light shadow-none bg-light fw-bold" 
                  placeholder="e.g. Science" 
                  value={form.name} 
                  onChange={e => {
                    if (e.target.value.length > 30) {
                      alert("Subject name cannot exceed 30 characters.");
                    } else {
                      setForm({ ...form, name: e.target.value });
                    }
                  }} 
                />
              </Col>
              <Col md={6}>
                <Form.Label className="smallest fw-bold text-muted text-uppercase mb-2 ls-1">Subject Code</Form.Label>
                <Form.Control required type="text" className="py-2 border-primary-soft shadow-none bg-primary bg-opacity-10 fw-bold text-primary" readOnly value={form.code} />
                <span className="smallest text-primary opacity-50 mt-1 d-block italic">Matched to Class & Name ID.</span>
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col md={4}>
                <Form.Label className="smallest fw-bold text-muted text-uppercase mb-2 ls-1">Class</Form.Label>
                <Form.Select required className="py-2 border-light shadow-none bg-light fw-bold text-dark" value={form.class} onChange={e => {
                    const className = e.target.value;
                    const availableSections = classes.filter(c => c.name === className).map(c => c.section);
                    setForm({ ...form, class: className, section: availableSections.length > 0 ? availableSections[0] : '' });
                }}>
                  <option value="">Select...</option>
                  {Array.from(new Set(classes.map(c => c.name))).sort((a, b) => {
                    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                    return numA - numB;
                  }).map(name => <option key={name} value={name}>{name}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="smallest fw-bold text-muted text-uppercase mb-2 ls-1">Section</Form.Label>
                <Form.Select required className="py-2 border-primary-soft shadow-none bg-primary bg-opacity-10 fw-bold text-primary" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}>
                   <option value="">Select...</option>
                   {Array.from(new Set(classes.filter(c => c.name === form.class).map(c => c.section))).sort().map(sec => (
                     <option key={sec} value={sec}>{sec}</option>
                   ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="smallest fw-bold text-muted text-uppercase mb-2 ls-1">Teacher</Form.Label>
                <Form.Select required className="py-2 border-light shadow-none bg-light fw-bold" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                  <option value="">Select Teacher...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-3 mb-4 pt-4 border-top">
              <Col md={6}>
                <Form.Label className="smallest fw-bold text-muted text-uppercase mb-2 ls-1">Full Marks</Form.Label>
                <Form.Control type="number" required className="py-2 border-light shadow-none bg-light" value={form.fullMarks} onChange={e => setForm({ ...form, fullMarks: Number(e.target.value) })} min={1} />
              </Col>
              <Col md={6}>
                <Form.Label className="smallest fw-bold text-muted text-uppercase mb-2 ls-1">Pass Marks</Form.Label>
                <Form.Control type="number" required className="py-2 border-light shadow-none bg-light" value={form.passMarks} onChange={e => setForm({ ...form, passMarks: Number(e.target.value) })} min={1} />
              </Col>
            </Row>

            <div className="border-top pt-4 mb-4">
              <Form.Label className="smallest fw-bold text-muted text-uppercase mb-3 ls-1">Topics</Form.Label>
              <div className="d-flex gap-2 mb-3">
                <Form.Control 
                  type="text" 
                  className="py-2 border-light shadow-none bg-light" 
                  placeholder="Topic name..." 
                  value={newSubtopic} 
                  onChange={e => {
                    if (e.target.value.length > 30) {
                      alert("Topic name cannot exceed 30 characters.");
                    } else {
                      setNewSubtopic(e.target.value);
                    }
                  }} 
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSubtopic())} 
                />
                <Button variant="dark" className="fw-bold px-4" onClick={addSubtopic}>ADD</Button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {form.subtopics.map((topic, idx) => (
                  <Badge key={idx} bg="white" text="dark" className="border py-2 px-3 rounded-pill d-flex align-items-center gap-2 shadow-sm">
                    <span className="fw-bold smallest text-uppercase ls-1">{topic}</span>
                    <i className="bi bi-x-circle-fill text-danger cursor-pointer" onClick={() => removeSubtopic(idx)}></i>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="d-flex gap-3 pt-3">
              <Button variant="light" className="flex-grow-1 fw-bold rounded-pill py-3 border-0 bg-light-dark opacity-75" onClick={() => setShowModal(false)}>DISCARD</Button>
              <Button variant="primary" type="submit" className="flex-grow-1 fw-bold rounded-pill py-3 shadow-none border-0 ls-1 uppercase smallest" disabled={formLoading}>
                {formLoading ? 'Saving...' : (modalMode === 'add' ? 'Add Subject' : 'Update Record')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageSubjects;

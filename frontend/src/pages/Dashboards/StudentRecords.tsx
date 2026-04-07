import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Modal, Button, Form, Row, Col, Table, Badge, Pagination, InputGroup } from 'react-bootstrap';

const StudentRecords: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditingStudent, setCurrentEditingStudent] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    rollNumber: '',
    class: '',
    section: '',
    parentPhone: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Classes fetched from Admin's Manage Classes page
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);

  // Derived sections based on currently selected class
  const availableSections = availableClasses
    .filter(c => c.name === editForm.class)
    .map(c => c.section);

  const fetchClasses = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/classes', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setAvailableClasses(data.classes || data || []);
    } catch {
      console.warn('Could not load classes for dropdown');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/users?role=student', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data && data.success && Array.isArray(data.users)) {
        const onlyStudents = data.users.filter((u: any) => u.role === 'student');
        setStudents(onlyStudents);
        setFilteredStudents(onlyStudents);
      } else if (Array.isArray(data)) {
        const onlyStudents = data.filter((u: any) => u.role === 'student');
        setStudents(onlyStudents);
        setFilteredStudents(onlyStudents);
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      setError('An error occurred while fetching student records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    let result = students;

    if (searchTerm) {
      result = result.filter(student => 
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.rollNumber && student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (classFilter !== 'all') {
      result = result.filter(student => student.class === classFilter);
    }

    setFilteredStudents(result);
    setCurrentPage(1);
  }, [searchTerm, classFilter, students]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete student ${name}? This will also delete their user account.`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchStudents();
      } else {
        alert(data.message || 'Failed to delete student');
      }
    } catch (err) {
      alert('Error deleting student');
    }
  };

  const openEditModal = (student: any) => {
    setCurrentEditingStudent(student);
    setEditForm({
      rollNumber: student.rollNumber || '',
      class: student.class || '',
      section: student.section || '',
      parentPhone: student.parentPhone || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditingStudent || !currentEditingStudent.profileId) {
      alert("Error: Cannot find student profile ID to update.");
      return;
    }
    
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/users/students/${currentEditingStudent.profileId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      if (response.ok || data.success) {
        setShowEditModal(false);
        fetchStudents();
      } else {
        alert(data.message || 'Failed to update student data');
      }
    } catch (err) {
      alert('Error saving student data');
    } finally {
      setIsSaving(false);
    }
  };

  const uniqueClasses = Array.from(new Set(students.map(s => s.class).filter(Boolean)));

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Student Records" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {/* ── Directory Header ── */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-3 border-bottom border-light-dark gap-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">Student Directory</h3>
              <p className="text-secondary small mb-0">Manage student profiles and enrollment details.</p>
            </div>
            <div className="d-flex gap-3 align-items-center">
              <InputGroup className="shadow-none border-light-dark" style={{ width: '320px' }}>
                <Form.Control
                  placeholder="Search..."
                  className="py-2 shadow-none smaller fw-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Form.Select 
                className="py-2 border-light-dark shadow-none smaller fw-bold" 
                style={{ width: '180px' }}
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">ALL CLASSES</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>CLASS {cls}</option>
                ))}
              </Form.Select>
            </div>
          </div>

          {/* ── Data Grid ── */}
          {loading ? (
            <div className="py-5 text-center text-muted fw-bold">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="card shadow-sm border-0 rounded-4 py-5 text-center">
              <div className="card-body">
                <h5 className="text-secondary fw-bold mb-2">No students found</h5>
                <p className="text-muted small mb-0">Try searching for a different name or class.</p>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light border-bottom border-light-dark">
                    <tr>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Student</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Class</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Roll No</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Parent Info</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student) => (
                      <tr key={student._id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold small" style={{ width: '38px', height: '38px' }}>
                              {student.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                               <div className="fw-bold text-dark">{student.name}</div>
                               <div className="smaller text-muted">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                           <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill fw-bold smaller">
                              CLASS {student.class} — {student.section}
                           </Badge>
                        </td>
                        <td className="px-4 py-3">
                           <span className="fw-bold text-primary smaller">{student.rollNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                           <div className="d-flex flex-column">
                              <span className="small fw-semibold text-dark">{student.parentName}</span>
                              <span className="smaller text-muted">{student.parentPhone}</span>
                           </div>
                        </td>
                        <td className="px-4 py-3 text-end">
                           <div className="d-flex justify-content-end gap-1">
                              <Button variant="outline-primary" size="sm" className="fw-bold border-0 bg-light" onClick={() => openEditModal(student)}>
                                UPDATE
                              </Button>
                              <Button variant="outline-danger" size="sm" className="fw-bold border-0 bg-danger-soft text-danger" onClick={() => handleDelete(student._id, student.name)}>
                                REMOVE
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
                  <span className="smaller text-secondary fw-medium ps-2">Displaying {indexOfFirst + 1}–{Math.min(indexOfLast, filteredStudents.length)} of {filteredStudents.length} entries</span>
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

      {/* ── Profile Modification Terminal ── */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="border-0 shadow-lg">
        <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
          <Modal.Title className="fw-bold text-dark fs-5">MODIFY LEARNER PROFILE</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSaveEdit}>
            <Row className="g-3 mb-3">
              <Col md={6}>
                 <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Class Assignment</Form.Label>
                 <Form.Select
                   className="py-2 border-light-dark shadow-none"
                   value={editForm.class}
                   onChange={(e) => setEditForm({ ...editForm, class: e.target.value, section: '' })}
                   required
                 >
                   <option value="">Choose Class...</option>
                   {[...new Set(availableClasses.map(c => c.name))].map(name => (
                     <option key={name as string} value={name as string}>{name as string}</option>
                   ))}
                 </Form.Select>
              </Col>
              <Col md={6}>
                 <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Section</Form.Label>
                 <Form.Select
                   className="py-2 border-light-dark shadow-none"
                   value={editForm.section}
                   onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                   required
                   disabled={!editForm.class}
                 >
                   <option value="">Choose Section...</option>
                   {availableSections.map((sec: string) => (
                     <option key={sec} value={sec}>{sec}</option>
                   ))}
                 </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
               <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Administrative ID (Roll No)</Form.Label>
               <Form.Control 
                 type="text" 
                 className="py-2 border-light-dark shadow-none" 
                 value={editForm.rollNumber} 
                 onChange={(e) => setEditForm({...editForm, rollNumber: e.target.value})} 
                 required 
               />
            </Form.Group>

            <Form.Group className="mb-4">
               <Form.Label className="smaller fw-bold text-secondary text-uppercase mb-2">Primary Emergency Contact</Form.Label>
               <Form.Control 
                 type="text" 
                 className="py-2 border-light-dark shadow-none" 
                 value={editForm.parentPhone} 
                 onChange={(e) => setEditForm({...editForm, parentPhone: e.target.value})} 
                 required 
               />
            </Form.Group>

            <div className="d-flex gap-2 pt-2">
              <Button variant="light" className="flex-grow-1 fw-bold rounded-pill border py-2" onClick={() => setShowEditModal(false)}>
                DISCARD
              </Button>
              <Button variant="primary" type="submit" className="flex-grow-1 fw-bold rounded-pill py-2" disabled={isSaving}>
                {isSaving ? 'PROCESSING...' : 'CONFIRM UPDATES'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentRecords;


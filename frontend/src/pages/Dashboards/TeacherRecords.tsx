import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Modal, Button, Form, Table, Badge, Pagination, InputGroup, Spinner, Card, Row, Col } from 'react-bootstrap';

const TeacherRecords: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [systemSubjects, setSystemSubjects] = useState<any[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditingTeacher, setCurrentEditingTeacher] = useState<any>(null);
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editPrimarySubject, setEditPrimarySubject] = useState('');
  const [assignedSubjectIds, setAssignedSubjectIds] = useState<string[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [tchRes, subRes] = await Promise.all([
         fetch('/api/users?role=teacher', { headers: { 'Authorization': `Bearer ${token}` } }),
         fetch('/api/subjects', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const tchData = await tchRes.json();
      const subData = await subRes.json();

      if (tchData && tchData.success && Array.isArray(tchData.users)) {
        setTeachers(tchData.users);
      } else if (Array.isArray(tchData)) {
        setTeachers(tchData);
      }
      
      if (Array.isArray(subData)) {
        setSystemSubjects(subData);
      } else if (subData.subjects && Array.isArray(subData.subjects)) {
        setSystemSubjects(subData.subjects);
      }
      
    } catch (err) {
      setError('An error occurred while fetching records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    let result = teachers;
    if (searchTerm) {
      result = result.filter(t => 
        (t.name && t.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.assignedSubjects?.some((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    setFilteredTeachers(result);
    setCurrentPage(1);
  }, [searchTerm, teachers]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete teacher ${name}?`)) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchInitialData();
      } else {
        alert(data.message || 'Failed to delete teacher');
      }
    } catch (err) {
      alert('Error deleting teacher');
    }
  };

  const openEditModal = (teacher: any) => {
    setCurrentEditingTeacher(teacher);
    setEditPhoneNumber(teacher.phoneNumber || '');
    setEditPrimarySubject(teacher.subject || '');
    
    // Load currently assigned subjects from dynamic Subject match
    const currentSubjects = teacher.assignedSubjects?.map((s: any) => s._id) || [];
    setAssignedSubjectIds(currentSubjects);
    setShowEditModal(true);
  };

  const handleAddSubjectSlot = () => {
    setAssignedSubjectIds([...assignedSubjectIds, '']);
  };

  const handleSubjectChange = (index: number, value: string) => {
    const newAssignments = [...assignedSubjectIds];
    newAssignments[index] = value;
    setAssignedSubjectIds(newAssignments);
  };

  const handleRemoveSubjectSlot = (index: number) => {
    const newAssignments = assignedSubjectIds.filter((_, i) => i !== index);
    setAssignedSubjectIds(newAssignments);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const finalSubjects = assignedSubjectIds.filter(id => id.trim() !== ''); // Remove empty selections
      
      const response = await fetch(`/api/users/${currentEditingTeacher._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
           phoneNumber: editPhoneNumber,
           primarySubject: editPrimarySubject,
           assignedSubjectIds: finalSubjects
        })
      });
      
      const data = await response.json();
      if (response.ok || data.success) {
        setShowEditModal(false);
        fetchInitialData(); // Refresh to get synced data
      } else {
        alert(data.message || 'Failed to update teacher data');
      }
    } catch (err) {
      alert('Error saving teacher data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Teacher Records" error={error} />
        <div className="container-fluid p-4 p-lg-5">
          <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-light-dark">
            <div>
              <h3 className="fw-bold text-dark mb-1">Teacher Directory</h3>
              <p className="text-secondary small mb-0">Manage all teacher profiles and sync subject assignments.</p>
            </div>
            <InputGroup className="shadow-none border-light-dark" style={{ width: '320px' }}>
              <Form.Control
                placeholder="Search name or subject..."
                className="py-2 shadow-none smaller fw-medium bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {loading ? (
            <div className="py-5 text-center"><Spinner animation="border" variant="primary" /></div>
          ) : filteredTeachers.length === 0 ? (
            <Card className="shadow-sm border-0 rounded-4 py-5 text-center bg-white border">
              <Card.Body><h5 className="text-secondary fw-bold mb-0">No records found</h5></Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm border rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light border-bottom border-light-dark">
                    <tr>
                      <th className="px-4 py-3 smallest fw-bold text-uppercase text-secondary ls-1">Teacher</th>
                      <th className="px-4 py-3 smallest fw-bold text-uppercase text-secondary ls-1">Subjects</th>
                      <th className="px-4 py-3 smallest fw-bold text-uppercase text-secondary ls-1">Contact</th>
                      <th className="px-4 py-3 smallest fw-bold text-uppercase text-secondary ls-1 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeachers.map((teacher) => {
                      const subjects = teacher.assignedSubjects || [];
                      const count = subjects.length;
                      return (
                        <tr key={teacher._id} className="bg-white border-bottom">
                          <td className="px-4 py-3">
                            <div className="fw-bold text-dark">{teacher.name}</div>
                            <div className="smallest text-muted fw-bold opacity-50">{teacher.email}</div>
                          </td>
                          <td className="px-4 py-3">
                             <div className="d-flex flex-wrap gap-2">
                               {count === 0 ? (
                                  <Badge bg="danger-soft" text="danger" className="px-3 py-2 rounded-pill fw-bold smallest border">Unassigned</Badge>
                               ) : (
                                  <Badge bg="primary-soft" text="primary" className="px-3 py-2 rounded-pill fw-bold smallest border">
                                    {count} {count === 1 ? 'Subject' : 'Subjects'}
                                  </Badge>
                               )}
                             </div>
                          </td>
                          <td className="px-4 py-3"><span className="smallest fw-bold text-uppercase ls-1">{teacher.phoneNumber || 'N/A'}</span></td>
                          <td className="px-4 py-3 text-end">
                             <div className="d-flex justify-content-end gap-3 px-2">
                                <Button variant="link" className="text-primary fw-bold smallest text-uppercase p-0 text-decoration-none" onClick={() => openEditModal(teacher)}>UPDATE</Button>
                                <Button variant="link" className="text-danger fw-bold smallest text-uppercase p-0 text-decoration-none" onClick={() => handleDelete(teacher._id, teacher.name)}>DELETE</Button>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="p-4 border-top border-light-dark d-flex justify-content-between align-items-center bg-white px-5">
                  <span className="smaller text-secondary fw-medium opacity-75">Page {currentPage} of {totalPages}</span>
                  <Pagination className="mb-0 gap-1 pagination-sm shadow-none border-0">
                    <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} />
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>{p} </Pagination.Item>
                    ))}
                    <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} />
                  </Pagination>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 px-4 pt-4"><Modal.Title className="fw-bold fs-5">Update Teacher Profile</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSaveEdit}>
            <Row className="g-4 mb-4">
               <Col md={6}>
                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Core Primary Subject</Form.Label>
                  <Form.Control type="text" value={editPrimarySubject} onChange={(e) => setEditPrimarySubject(e.target.value)} required className="py-2 border-light shadow-none bg-light fw-bold" placeholder="E.g. Mathematics" />
               </Col>
               <Col md={6}>
                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Contact Phone</Form.Label>
                  <Form.Control type="text" value={editPhoneNumber} onChange={(e) => setEditPhoneNumber(e.target.value)} required className="py-2 border-light shadow-none bg-light fw-bold" placeholder="Teacher Phone..." />
               </Col>
            </Row>

            <div className="border-top pt-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 className="smallest fw-bold text-primary text-uppercase ls-1 mb-0">Class Assignments <span className="text-secondary opacity-50">(Optional)</span></h6>
                    <Button variant="outline-primary" size="sm" className="rounded-pill fw-bold smallest text-uppercase ls-1 py-1 px-3" onClick={handleAddSubjectSlot}>
                        <i className="bi bi-plus-lg me-1"></i> Add Subject
                    </Button>
                </div>
                
                <Row className="g-3">
                   {assignedSubjectIds.map((assignedId, index) => (
                       <Col md={6} key={index}>
                          <div className="d-flex align-items-center gap-2">
                              <div className="flex-grow-1">
                                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Assignment {index + 1}</Form.Label>
                                  <Form.Select 
                                    className="py-2 border-light shadow-none bg-light fw-bold" 
                                    value={assignedId} 
                                    onChange={(e) => handleSubjectChange(index, e.target.value)}
                                  >
                                    <option value="">-- Select Subject & Class --</option>
                                    {systemSubjects.map(sub => (
                                        <option key={sub._id} value={sub._id}>{sub.name} — {sub.class} ({sub.section})</option>
                                    ))}
                                  </Form.Select>
                              </div>
                              <div className="pt-4 mt-1">
                                  <Button variant="light" className="border-0 text-danger" onClick={() => handleRemoveSubjectSlot(index)}>
                                      <i className="bi bi-x-lg"></i>
                                  </Button>
                              </div>
                          </div>
                       </Col>
                   ))}
                   {assignedSubjectIds.length === 0 && (
                       <Col md={12}>
                          <div className="p-4 text-center border rounded-3 bg-light opacity-50">
                             <span className="smallest fw-bold text-muted text-uppercase ls-1">No subjects assigned. Click 'Add Subject' to begin.</span>
                          </div>
                       </Col>
                   )}
                </Row>
            </div>

            <div className="d-flex gap-3 pt-3">
              <Button variant="light" className="flex-grow-1 fw-bold rounded-pill py-3 border-0 bg-light-dark opacity-75 smallest text-uppercase ls-1" onClick={() => setShowEditModal(false)}>Discard</Button>
              <Button variant="primary" type="submit" className="flex-grow-1 fw-bold rounded-pill py-3 shadow-none border-0 smallest text-uppercase ls-1" disabled={isSaving}>{isSaving ? 'Processing...' : 'Update'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TeacherRecords;

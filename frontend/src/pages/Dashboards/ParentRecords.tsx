import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Modal, Button, Form, Table, Badge, Pagination, InputGroup, Spinner, Card } from 'react-bootstrap';

const ParentRecords: React.FC = () => {
  const [parents, setParents] = useState<any[]>([]);
  const [filteredParents, setFilteredParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditingParent, setCurrentEditingParent] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    childName: '',
    studentID: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchParents = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/users?role=parent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data && data.success && Array.isArray(data.users)) {
        setParents(data.users);
        setFilteredParents(data.users);
      } else if (Array.isArray(data)) {
        setParents(data);
        setFilteredParents(data);
      } else {
        setError(data.message || 'Failed to fetch parents');
      }
    } catch (err) {
      setError('An error occurred while fetching parent records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  useEffect(() => {
    let result = parents;
    if (searchTerm) {
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.childName && p.childName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredParents(result);
    setCurrentPage(1);
  }, [searchTerm, parents]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentParents = filteredParents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete parent ${name}?`)) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchParents();
      } else {
        alert(data.message || 'Failed to delete parent');
      }
    } catch (err) {
      alert('Error deleting parent');
    }
  };

  const openEditModal = (parent: any) => {
    setCurrentEditingParent(parent);
    setEditForm({
      childName: parent.childName || '',
      studentID: parent.studentID || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      // Assuming parent profile update endpoint similar to students
      const response = await fetch(`/api/users/parents/${currentEditingParent.profileId || currentEditingParent._id}`, {
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
        fetchParents();
      } else {
        alert(data.message || 'Failed to update parent data');
      }
    } catch (err) {
      alert('Error saving parent data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Parent Records" error={error} />
        <div className="container-fluid p-4 p-lg-5">
          <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-light-dark">
            <div>
              <h3 className="fw-bold text-dark mb-1">Parent Directory</h3>
              <p className="text-secondary small mb-0">Manage all parent profiles and student links.</p>
            </div>
            <InputGroup className="shadow-none border-light-dark" style={{ width: '320px' }}>
              <Form.Control
                placeholder="Search name or student..."
                className="py-2 shadow-none smaller fw-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {loading ? (
            <div className="py-5 text-center"><Spinner animation="border" variant="primary" /></div>
          ) : filteredParents.length === 0 ? (
            <Card className="shadow-sm border-0 rounded-4 py-5 text-center">
              <Card.Body><h5 className="text-secondary fw-bold">No records found</h5></Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light border-bottom border-light-dark">
                    <tr>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Parent</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Child Name</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Student ID</th>
                      <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentParents.map((parent) => (
                      <tr key={parent._id}>
                        <td className="px-4 py-3">
                          <div className="fw-bold text-dark">{parent.name}</div>
                          <div className="smaller text-muted">{parent.email}</div>
                        </td>
                        <td className="px-4 py-3"><span className="smaller fw-medium">{parent.childName || 'N/A'}</span></td>
                        <td className="px-4 py-3"><Badge bg="primary-soft" text="primary" className="border px-3 py-2 rounded-pill fw-bold smaller">{parent.studentID || 'N/A'}</Badge></td>
                        <td className="px-4 py-3 text-end">
                           <Button variant="outline-primary" size="sm" className="fw-bold border-0 bg-light me-1" onClick={() => openEditModal(parent)}>EDIT</Button>
                           <Button variant="outline-danger" size="sm" className="fw-bold border-0 bg-danger-soft text-danger" onClick={() => handleDelete(parent._id, parent.name)}>DELETE</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="p-4 border-top border-light-dark d-flex justify-content-between align-items-center bg-white">
                  <span className="smaller text-secondary fw-medium">Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filteredParents.length)} of {filteredParents.length}</span>
                  <Pagination className="mb-0 gap-1 pagination-sm">
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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="border-0 px-4 pt-4"><Modal.Title className="fw-bold">Edit Parent</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-3">
              <Form.Label className="smaller fw-bold text-secondary">Child's Name</Form.Label>
              <Form.Control type="text" value={editForm.childName} onChange={(e) => setEditForm({...editForm, childName: e.target.value})} required className="py-2 shadow-none" />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="smaller fw-bold text-secondary">Student ID</Form.Label>
              <Form.Control type="text" value={editForm.studentID} onChange={(e) => setEditForm({...editForm, studentID: e.target.value})} required className="py-2 shadow-none" />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="light" className="flex-grow-1 fw-bold rounded-pill border" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" className="flex-grow-1 fw-bold rounded-pill" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ParentRecords;

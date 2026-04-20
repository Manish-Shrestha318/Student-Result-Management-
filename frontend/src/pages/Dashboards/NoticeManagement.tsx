import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Card, Button, Badge, Alert, Modal, Form, Row, Col, Pagination } from 'react-bootstrap';

const NoticeManagement: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentNotices = notices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(notices.length / itemsPerPage);
  
  const [showModal, setShowModal] = useState(false);
  const [newNotice, setNewNotice] = useState<any>({
    title: '',
    content: '',
    category: 'general',
    targetRoles: ['student', 'teacher', 'parent'],
    publishDate: new Date().toISOString().split('T')[0]
  });

  const fetchNotices = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/notices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotices(data.data);
      }
    } catch (err) {
      setError('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNotice)
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Notice published successfully!');
        setShowModal(false);
        setNewNotice({ title: '', content: '', category: 'general', targetRoles: ['student', 'teacher', 'parent'], publishDate: new Date().toISOString().split('T')[0] });
        fetchNotices();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Failed to create notice');
      }
    } catch (err) {
      setError('Error creating notice');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/notices/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotices();
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notice?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Notice" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3 border-bottom pb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">Notice</h3>
              <p className="text-secondary small mb-0 fw-medium">Create and manage school notices.</p>
            </div>
            <Button variant="primary" className="fw-bold px-4 py-2 rounded-pill shadow-sm" onClick={() => setShowModal(true)}>
               New Notice
            </Button>
          </div>

          {successMessage && (
             <Alert variant="success" className="border-0 rounded-4 shadow-sm mb-4 fw-bold smaller text-uppercase px-4 py-3">
                {successMessage}
             </Alert>
          )}

          <div className="d-flex flex-column gap-4 pb-5">
            {loading && notices.length === 0 ? (
              <div className="py-5 text-center text-muted fw-bold italic small">Loading notices...</div>
            ) : notices.length === 0 ? (
              <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                <Card.Body>
                  <h5 className="text-dark fw-bold mb-1 small text-uppercase ls-1">No Notices</h5>
                  <p className="text-secondary smaller mb-0">There are no school notices right now.</p>
                </Card.Body>
              </Card>
            ) : (
              currentNotices.map(notice => (
                <Card key={notice._id} className={`border-0 shadow-sm rounded-4 overflow-hidden transition-all ${notice.isActive ? '' : 'opacity-75'}`}>
                  <Card.Body className="p-4">
                    <Row className="align-items-start g-4">
                      <Col>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <Badge bg="primary-soft" text="primary" className="fw-bold smallest text-uppercase px-3 py-2 border rounded-pill ls-1">
                             {notice.category}
                          </Badge>
                          <h5 className="fw-bold text-dark mb-0 ls-1">{notice.title}</h5>
                        </div>
                        <p className="text-secondary small mb-4 lh-lg fw-medium">{notice.content}</p>
                        <div className="d-flex flex-wrap gap-4 text-muted smallest fw-bold text-uppercase ls-1">
                          <span>Audience: {notice.targetRoles.join(', ')}</span>
                          <span>Date: {new Date(notice.publishDate).toLocaleDateString()}</span>
                          <span className={notice.isActive ? 'text-success' : 'text-warning'}>Status: {notice.isActive ? 'Active' : 'Archived'}</span>
                        </div>
                      </Col>
                      <Col xs="auto" className="d-flex flex-column gap-2">
                        <Button variant="outline-dark" size="sm" className="fw-bold rounded-pill px-4 smaller border-0 bg-light shadow-sm" onClick={() => handleToggleStatus(notice._id)}>
                          {notice.isActive ? "ARCHIVE" : "ACTIVATE"}
                        </Button>
                        <Button variant="outline-danger" size="sm" className="fw-bold border-0 bg-danger-soft text-danger rounded-pill px-4 smaller shadow-sm" onClick={() => handleDelete(notice._id)}>
                          DELETE
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))
            )}

            {/* ── Dynamic Control Pagination ── */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 bg-white p-4 rounded-4 shadow-sm border-0">
                <span className="smaller text-secondary fw-medium">Displaying {indexOfFirst + 1}–{Math.min(indexOfLast, notices.length)} of {notices.length} entries</span>
                <Pagination className="mb-0 gap-1 pagination-sm">
                  <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                      {page}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} />
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Announcement Modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="border-0">
        <Modal.Header closeButton className="border-0 p-4 pb-0">
          <Modal.Title className="fw-bold text-dark ls-1">New Notice</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleCreateNotice}>
            <Row className="g-4 mb-4">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Title</Form.Label>
                  <Form.Control 
                    type="text"
                    required
                    value={newNotice.title} 
                  onChange={(e) => {
                    if (e.target.value.length > 30) {
                      alert("Notice title cannot exceed 30 characters.");
                    } else {
                      setNewNotice({...newNotice, title: e.target.value});
                    }
                  }} 
                  className="py-2 smaller border-light-dark shadow-none"
                  placeholder="e.g., School Holiday"
                />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Category</Form.Label>
                  <Form.Select 
                    value={newNotice.category} 
                    onChange={(e) => setNewNotice({...newNotice, category: e.target.value})}
                    className="py-2 smaller border-light-dark shadow-none fw-bold"
                  >
                    <option value="general">GENERAL</option>
                    <option value="academic">ACADEMIC</option>
                    <option value="exam">EXAM</option>
                    <option value="event">EVENT</option>
                    <option value="urgent">URGENT</option>
                    <option value="holiday">HOLIDAY</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Notice details</Form.Label>
              <Form.Control 
                as="textarea"
                rows={5} 
                required 
                value={newNotice.content}
                onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                className="py-2 smaller border-light-dark shadow-none"
                placeholder="Write notice here..."
              />
            </Form.Group>

            <Row className="g-4 mb-5">
               <Col md={6}>
                 <Form.Group>
                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={newNotice.publishDate}
                    onChange={(e) => setNewNotice({...newNotice, publishDate: e.target.value})}
                    className="py-2 smaller border-light-dark shadow-none"
                  />
                </Form.Group>
               </Col>
               <Col md={6}>
                  <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1 d-block mb-3">Recipients</Form.Label>
                  <div className="d-flex gap-4 pt-1 px-1">
                    {['student', 'teacher', 'parent'].map(role => (
                      <Form.Check 
                        key={role}
                        type="checkbox"
                        label={role.toUpperCase()}
                        className="smaller fw-bold text-secondary"
                        checked={newNotice.targetRoles.includes(role)}
                        onChange={() => {
                          const updated = newNotice.targetRoles.includes(role) 
                            ? newNotice.targetRoles.filter((r: string) => r !== role)
                            : [...newNotice.targetRoles, role];
                          setNewNotice({...newNotice, targetRoles: updated});
                        }}
                      />
                    ))}
                  </div>
               </Col>
            </Row>

            <div className="d-flex justify-content-end gap-3 border-top pt-4">
               <Button variant="light" className="fw-bold border text-secondary px-4 smaller rounded-pill" onClick={() => setShowModal(false)}>
                 Cancel
               </Button>
               <Button variant="primary" type="submit" disabled={loading} className="fw-bold px-5 smaller rounded-pill shadow-sm ls-1">
                 {loading ? 'Processing...' : 'Publish'}
               </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default NoticeManagement;


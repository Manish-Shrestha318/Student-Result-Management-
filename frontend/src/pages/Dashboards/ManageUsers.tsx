import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, Modal, InputGroup, Pagination } from 'react-bootstrap';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    status: 'active'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data && data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setError(data.message || 'Failed to established user bridge.');
      }
    } catch (err) {
      setError('Communication error: User repository unreachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const token = localStorage.getItem('token');
    fetch('/api/subjects', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(data => setAllSubjects(data.subjects || data || []));
  }, []);

  useEffect(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter(user => user.role.toLowerCase() === roleFilter.toLowerCase());
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name_desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, sortBy, users]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('IRREVERSIBLE ACTION: Are you sure you want to terminate this account?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchUsers();
      } else {
        alert('Termination sequence failed.');
      }
    } catch (err) {
      alert('Error: Deletion protocol not established.');
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setModalMode('edit');
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleView = (user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const token = localStorage.getItem('token');
    
    const url = modalMode === 'add' ? '/api/users' : `/api/users/${selectedUser._id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        alert(`Directive failed. Operational status: UNAVAILABLE`);
      }
    } catch (err) {
      alert(`Sync error during record update.`);
    } finally {
      setFormLoading(false);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Account Management Page" error={error} />

        <div className="container-fluid p-4 p-lg-5">
           {/* ── Status Header ── */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4 border-bottom border-light-dark pb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">User Accounts</h3>
              <p className="text-secondary small mb-0 fw-medium">Manage all users, their roles, and account statuses.</p>
            </div>
            <Button variant="primary" className="fw-bold px-4 py-2 rounded-pill shadow-sm ls-1 smallest text-uppercase" onClick={handleOpenAddModal}>
              ADD NEW USER
            </Button>
          </div>

          {/* ── Command Interface ── */}
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <Row className="g-3 align-items-center">
                <Col lg={5}>
                  <InputGroup className="shadow-none rounded-pill overflow-hidden border">
                    <Form.Control 
                      placeholder="Search users..." 
                      className="py-3 px-4 smaller border-0 shadow-none fw-bold ls-1 text-uppercase bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col lg={7}>
                  <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                    <Form.Select 
                      className="w-auto shadow-sm border-light-dark smallest fw-bold py-3 px-4 ls-1 text-uppercase rounded-pill appearance-none"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">LATEST SIGNUPS</option>
                      <option value="oldest">OLDEST FIRST</option>
                      <option value="name_asc">ALPHABETICAL (A-Z)</option>
                      <option value="name_desc">ALPHABETICAL (Z-A)</option>
                    </Form.Select>

                    <Form.Select 
                      className="w-auto shadow-sm border-light-dark smallest fw-bold py-3 px-4 ls-1 text-uppercase rounded-pill appearance-none"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="all">ALL ROLE LEVELS</option>
                      <option value="student">STUDENTS</option>
                      <option value="teacher">TEACHER</option>
                      <option value="parent">PARENT</option>
                      <option value="admin">ADMINISTRATORS</option>
                    </Form.Select>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ── Directory Table ── */}
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 smallest fw-medium">
                <thead className="bg-light-soft border-bottom">
                  <tr>
                    <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1">Name</th>
                    <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Role</th>
                    <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Status</th>
                    <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-center">Registration</th>
                    <th className="px-4 py-3 text-secondary fw-bold text-uppercase ls-1 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-5 text-muted fw-bold italic opacity-50 uppercase ls-1">Synchronizing identity records...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-5 text-muted fw-bold italic opacity-50 uppercase ls-1">No matching nodes identified.</td></tr>
                  ) : (
                    currentItems.map((user) => (
                      <tr key={user._id} className="border-bottom border-light">
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary-soft text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '42px', height: '42px' }}>
                              {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                               <div className="fw-bold text-dark text-uppercase">{user.name}</div>
                               <div className="smallest text-muted fw-bold text-lowercase">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                           <Badge bg="light" text="primary" className="border px-3 py-2 rounded-pill fw-bold smallest text-uppercase ls-1">
                              {user.role}
                           </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                           <div className="d-flex align-items-center justify-content-center gap-2">
                             <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: (user.status === 'active' || user.isVerified) ? '#10b981' : (user.status === 'pending' ? '#f59e0b' : '#ef4444') }}></div>
                             <span className={`smallest fw-bold text-uppercase ls-1 ${ (user.status === 'active' || user.isVerified) ? 'text-success' : (user.status === 'pending' ? 'text-warning' : 'text-danger') }`}>
                               {user.status || (user.isVerified ? 'VERIFIED' : 'PENDING')}
                             </span>
                           </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                           <span className="smallest text-muted fw-bold text-uppercase ls-1">
                              {new Date(user.createdAt).toLocaleDateString()}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                           <div className="d-flex justify-content-end gap-1">
                              <Button variant="link" size="sm" className="text-secondary text-decoration-none fw-bold smallest border px-3 rounded-pill ls-1" onClick={() => handleView(user)}>VIEW</Button>
                              <Button variant="link" size="sm" className="text-primary text-decoration-none fw-bold smallest border px-3 rounded-pill ls-1" onClick={() => handleEdit(user)}>EDIT</Button>
                              <Button variant="link" size="sm" className="text-danger text-decoration-none fw-bold smallest border px-3 rounded-pill ls-1" onClick={() => handleDelete(user._id)}>DELETE</Button>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-top border-light-dark d-flex flex-column flex-sm-row justify-content-between align-items-center bg-white gap-3">
                 <span className="smallest text-secondary fw-bold text-uppercase ls-1">Displaying {indexOfFirst + 1}–{Math.min(indexOfLast, filteredUsers.length)} of {filteredUsers.length} pages</span>
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
          </Card>
        </div>
      </main>

      {/* ── Add/Edit User Portal ── */}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered backdrop="static">
        <Modal.Header className="border-0 p-4 pb-0" closeButton>
           <Modal.Title className="fw-bold text-dark smallest text-uppercase ls-2">{modalMode === 'add' ? 'ADD NEW USER' : 'EDIT USER'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
           <Form onSubmit={handleModalSubmit}>
              <Form.Group className="mb-3">
                 <Form.Label className="smallest fw-bold text-secondary text-uppercase ls-1">Principal Name</Form.Label>
                 <Form.Control 
                    type="text" 
                    required 
                    className="py-2 border-light-dark shadow-none fw-bold text-uppercase smallest ls-1"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                 />
              </Form.Group>
              <Form.Group className="mb-3">
                 <Form.Label className="smallest fw-bold text-secondary text-uppercase ls-1">Communication Path (Email)</Form.Label>
                 <Form.Control 
                    type="email" 
                    required 
                    className="py-2 border-light-dark shadow-none fw-bold text-lowercase smallest ls-1"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                 />
              </Form.Group>

              {modalMode === 'add' && (
                <Form.Group className="mb-3">
                   <Form.Label className="smallest fw-bold text-secondary text-uppercase ls-1">Security Credential (Password)</Form.Label>
                   <Form.Control 
                      type="password" 
                      required 
                      className="py-2 border-light-dark shadow-none"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                   />
                </Form.Group>
              )}

              <Row className="g-3 mb-4">
                 <Col sm={6}>
                    <Form.Label className="smallest fw-bold text-secondary text-uppercase ls-1">Access Level</Form.Label>
                    <Form.Select className="py-2 border-light-dark shadow-none smallest fw-bold text-uppercase ls-1" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                        <option value="student">STUDENT</option>
                        <option value="teacher">TEACHER</option>
                        <option value="parent">PARENT</option>
                        <option value="admin">ADMIN</option>
                    </Form.Select>
                 </Col>
                 {formData.role === 'teacher' && (
                    <Col sm={6}>
                       <Form.Label className="smallest fw-bold text-secondary text-uppercase ls-1">Operational State</Form.Label>
                       <Form.Select className="py-2 border-light-dark shadow-none smallest fw-bold text-uppercase ls-1" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                          <option value="active">VERIFIED</option>
                          <option value="rejected">REJECTED</option>
                       </Form.Select>
                    </Col>
                 )}
              </Row>

              <div className="d-flex gap-2">
                 <Button variant="light" className="flex-grow-1 fw-bold rounded-pill border py-3 smallest ls-1 text-uppercase" onClick={() => setIsModalOpen(false)}>DISCARD</Button>
                 <Button variant="primary" type="submit" disabled={formLoading} className="flex-grow-1 fw-bold rounded-pill py-3 smallest ls-1 text-uppercase shadow-sm">
                    {formLoading ? 'PROCESSING...' : modalMode === 'add' ? 'SYNC NEW IDENTITY' : 'UPDATE IDENTITY'}
                 </Button>
              </div>
           </Form>
        </Modal.Body>
      </Modal>

      {/* ── View Detail Portal ── */}
      <Modal show={isViewModalOpen} onHide={() => setIsViewModalOpen(false)} centered>
         <Modal.Header className="bg-primary text-white border-0 p-4 text-center d-flex flex-column" closeButton closeVariant="white">
            <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center fw-bold mx-auto mb-3 border shadow-sm border-white border-opacity-50" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
              {selectedUser?.name?.[0]?.toUpperCase()}
            </div>
            <Modal.Title className="fw-bold text-white ls-1 text-uppercase fs-5">{selectedUser?.name}</Modal.Title>
            <Badge bg="white" text="primary" className="fw-bold smallest text-uppercase ls-1 px-3 py-2 mt-2 border-0">{selectedUser?.role} ACCOUNT</Badge>
         </Modal.Header>
         <Modal.Body className="p-4 p-lg-5">
                {selectedUser?.role === 'teacher' && (() => {
                   const teacherSubjects = allSubjects.filter(s => (s.teacherId?._id || s.teacherId) === selectedUser._id);
                   const classesMap = teacherSubjects.reduce((acc: any, s: any) => {
                      if (!acc[s.class]) acc[s.class] = [];
                      acc[s.class].push(s.name);
                      return acc;
                   }, {});
                   const distinctClasses = Object.keys(classesMap);

                   return (
                      <div className="p-4 rounded-4 border-start border-5 border-info bg-info bg-opacity-10 mb-4">
                         <div className="smallest fw-bold text-info text-uppercase ls-1 mb-3">Teaching Spectrum</div>
                         {distinctClasses.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                               {distinctClasses.map((cls, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded-4 shadow-sm border">
                                     <div className="smallest fw-bold text-dark text-uppercase ls-1 mb-2 border-bottom pb-1 border-light">
                                        CLASS: {cls}
                                     </div>
                                     <div className="d-flex flex-wrap gap-2">
                                        {classesMap[cls].map((sub: string, sIdx: number) => (
                                           <Badge key={sIdx} bg="primary-soft" text="primary" className="border-0 smallest fw-bold ls-1 px-3 py-2 rounded-pill">
                                              {sub}
                                           </Badge>
                                        ))}
                                     </div>
                                  </div>
                               ))}
                            </div>
                         ) : (
                            <span className="smallest text-muted fw-bold italic opacity-75">No Class or Subject Nodes Assigned</span>
                         )}
                      </div>
                   );
                })()}
                {[
                  { label: 'ELECTRONIC MAIL', value: selectedUser?.email, color: 'primary' },
                  { label: 'OPERATIONAL STANDING', value: selectedUser?.status || (selectedUser?.isVerified ? 'VERIFIED' : 'PENDING'), color: 'success' },
                  { label: 'REGISTRATION LOG', value: new Date(selectedUser?.createdAt).toLocaleDateString(), color: 'warning' },
                  { label: 'IDENTITY ID', value: selectedUser?._id, color: 'dark' },
                ].map((item, i) => (
                   <div key={i} className={`p-4 rounded-4 border-start border-5 border-${item.color} bg-light-soft`}>
                      <div className="smallest fw-bold text-secondary text-uppercase ls-1 mb-1">{item.label}</div>
                      <div className="fw-bold text-dark ls-1 text-wrap word-break">{item.value}</div>
                   </div>
                ))}
            <Button variant="primary" className="w-100 fw-bold py-3 rounded-pill mt-5 shadow-sm smallest ls-1 text-uppercase" onClick={() => { setIsViewModalOpen(false); handleEdit(selectedUser); }}>MODIFY IDENTITY PATH</Button>
         </Modal.Body>
      </Modal>

    </div>
  );
};

export default ManageUsers;

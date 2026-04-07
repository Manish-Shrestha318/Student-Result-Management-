import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Table, Button, Badge, Pagination, Alert } from 'react-bootstrap';

const TeacherApprovals: React.FC = () => {
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTeachers = pendingTeachers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(pendingTeachers.length / itemsPerPage);

  const fetchPendingTeachers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/users/pending-teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data && data.success && Array.isArray(data.users)) {
        setPendingTeachers(data.users);
      } else if (Array.isArray(data)) {
        setPendingTeachers(data);
      } else {
        setError(data.message || 'Failed to fetch pending teachers');
      }
    } catch (err) {
      setError('An error occurred while fetching pending teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/users/verify-teacher/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'approve' })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`Teacher ${name} approved successfully!`);
        fetchPendingTeachers();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(data.message || 'Failed to approve teacher');
      }
    } catch (err) {
      alert('Error approving teacher');
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to reject and delete ${name}'s application?`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/users/verify-teacher/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reject' })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`Teacher ${name} application rejected.`);
        fetchPendingTeachers();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(data.message || 'Failed to reject teacher');
      }
    } catch (err) {
      alert('Error rejecting teacher');
    }
  };

  return (
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      <AdminSidebar />
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Teacher Approvals" error={error} />

        <div className="container-fluid p-4 p-lg-5">
           {/* ── Workflow Header ── */}
          <div className="mb-5 pb-3 border-bottom border-light-dark">
            <h3 className="fw-bold text-dark mb-1">Pending Teacher Approvals</h3>
            <p className="text-secondary small mb-0">Systematic review of educator credentials and onboarding authorization.</p>
          </div>

          {successMessage && (
            <Alert variant="success" className="border-0 rounded-4 shadow-sm mb-4 fw-bold smaller text-uppercase px-4">
               {successMessage}
            </Alert>
          )}

          {/* ── Verification Terminal ── */}
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="bg-light border-bottom border-light-dark">
                  <tr>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Applicant Details</th>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Subject Discipline</th>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Submission Date</th>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary">Verification State</th>
                    <th className="px-4 py-3 smaller fw-bold text-uppercase text-secondary text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-5 text-center text-muted fw-bold italic small">Scanning database for pending credentials...</td>
                    </tr>
                  ) : pendingTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-5 text-center">
                         <div className="py-2">
                            <h5 className="text-dark fw-bold mb-1 small">All Caught Up</h5>
                            <p className="text-secondary smaller mb-0">No pending educator applications require review at this time.</p>
                         </div>
                      </td>
                    </tr>
                  ) : (
                    currentTeachers.map((teacher) => (
                      <tr key={teacher._id} className="transition-all">
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-dark text-white rounded d-flex align-items-center justify-content-center fw-bold smaller" style={{ width: '36px', height: '36px' }}>
                              {teacher.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="d-flex flex-column">
                              <span className="fw-bold text-dark">{teacher.name}</span>
                              <span className="smaller text-muted">{teacher.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-secondary smaller fw-medium italic">
                          {teacher.subject || 'GENERAL STUDIES'}
                        </td>
                        <td className="px-4 py-3 text-muted smaller">
                          {new Date(teacher.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <Badge bg="warning-soft" text="warning" className="fw-bold smaller text-uppercase px-3 py-2 border rounded-pill">
                              Awaiting Review
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-end">
                           <div className="d-flex justify-content-end gap-1">
                              <Button variant="primary" size="sm" className="fw-bold rounded-pill px-3 py-1 shadow-sm border-0 smaller" onClick={() => handleApprove(teacher._id, teacher.name)}>
                                AUTHORIZE
                              </Button>
                              <Button variant="outline-danger" size="sm" className="fw-bold border-0 bg-danger-soft text-danger rounded-pill px-3 py-1 smaller" onClick={() => handleReject(teacher._id, teacher.name)}>
                                REJECT
                              </Button>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* ── Control Flow Pagination ── */}
            {totalPages > 1 && (
              <div className="p-4 border-top border-light-dark d-flex justify-content-between align-items-center bg-white">
                <span className="smaller text-secondary fw-medium">Displaying {indexOfFirst + 1}–{Math.min(indexOfLast, pendingTeachers.length)} of {pendingTeachers.length} entries</span>
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
        </div>
      </main>
    </div>
  );
};

export default TeacherApprovals;


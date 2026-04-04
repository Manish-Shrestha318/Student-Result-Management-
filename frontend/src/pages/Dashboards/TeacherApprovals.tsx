import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MoreVertical,
  Mail,
  BookOpen
} from 'lucide-react';

const TeacherApprovals: React.FC = () => {
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPendingTeachers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/users/pending-teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPendingTeachers(data.users);
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
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`Teacher ${name} approved successfully!`);
        // Refresh data
        fetchPendingTeachers();
        // Clear message after 3s
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
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success || response.ok) {
        setSuccessMessage(`Teacher ${name} application rejected.`);
        // Refresh data
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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Teacher Approvals" error={error} />

        <div style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Pending Teacher Requests</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verify new teacher registrations and grant system access.</p>
          </div>

          {successMessage && (
            <div style={{ padding: '1rem', background: '#dcfce7', color: '#15803d', borderRadius: '10px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, border: '1px solid #bbf7d0' }}>
              <CheckCircle2 size={20} /> {successMessage}
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Teacher Details</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Subject Expertise</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Applied Date</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Management</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <Clock size={32} className="animate-pulse" />
                          <span>Searching for pending requests...</span>
                        </div>
                      </td>
                    </tr>
                  ) : pendingTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <UserCheck size={32} style={{ color: '#22c55e' }} />
                          <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>All Caught Up!</span>
                          <p>There are no pending teacher applications to review.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingTeachers.map((teacher) => (
                      <tr key={teacher._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                              {teacher.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{teacher.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Mail size={12} /> {teacher.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            <BookOpen size={16} color="var(--primary)" />
                            {teacher.subject || 'To Be Assigned'}
                          </div>
                        </td>
                        <td style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {new Date(teacher.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '1.5rem' }}>
                          <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                             <Clock size={12} /> Pending Approval
                          </span>
                        </td>
                        <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button 
                              onClick={() => handleApprove(teacher._id, teacher.name)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#16a34a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                            >
                              <CheckCircle2 size={16} /> Approve
                            </button>
                            <button 
                              onClick={() => handleReject(teacher._id, teacher.name)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', border: '1px solid #fee2e2', color: '#dc2626', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                            >
                              <XCircle size={16} /> Reject
                            </button>
                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherApprovals;

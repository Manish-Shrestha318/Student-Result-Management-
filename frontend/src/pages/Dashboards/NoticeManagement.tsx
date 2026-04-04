import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Flag,
  Calendar,
  Users,
  CheckCircle2
} from 'lucide-react';

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
  
  // New Notice Form Context
  const [showForm, setShowForm] = useState(false);
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
        setShowForm(false);
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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="School Board & Notices" error={error} />

        <div style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Notice Management</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Publish announcements to students, parents, and teachers.</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> {showForm ? 'Cancel' : 'New Announcement'}
            </button>
          </div>

          {successMessage && (
             <div style={{ padding: '1rem', background: '#dcfce7', color: '#15803d', borderRadius: '10px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #bbf7d0' }}>
               <CheckCircle2 size={18} /> {successMessage}
             </div>
          )}

          {showForm && (
            <div className="card" style={{ marginBottom: '2.5rem', border: '1px solid var(--primary)' }}>
              <h4 style={{ marginBottom: '1.5rem' }}>Create New Announcement</h4>
              <form onSubmit={handleCreateNotice} style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Title</label>
                    <input 
                      type="text"
                      className="input-field" 
                      required 
                      value={newNotice.title} 
                      onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} 
                      placeholder="e.g. Annual Sports Day 2025"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Category</label>
                    <select 
                      className="input-field" 
                      value={newNotice.category} 
                      onChange={(e) => setNewNotice({...newNotice, category: e.target.value})}
                    >
                      <option value="general">General</option>
                      <option value="academic">Academic</option>
                      <option value="exam">Exam</option>
                      <option value="event">Event</option>
                      <option value="urgent">Urgent</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Detailed Content</label>
                  <textarea 
                    className="input-field" 
                    rows={4} 
                    required 
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                    placeholder="Write the full announcement details here..."
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Publish Date</label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={newNotice.publishDate}
                      onChange={(e) => setNewNotice({...newNotice, publishDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Target Audience</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                       {['student', 'teacher', 'parent'].map(role => (
                         <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                           <input type="checkbox" checked={newNotice.targetRoles.includes(role)} onChange={() => {
                             const updated = newNotice.targetRoles.includes(role) 
                               ? newNotice.targetRoles.filter((r: string) => r !== role)
                               : [...newNotice.targetRoles, role];
                             setNewNotice({...newNotice, targetRoles: updated});
                           }} />
                           <span style={{ textTransform: 'capitalize' }}>{role}</span>
                         </label>
                       ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary">Publish Announcement</button>
                </div>
              </form>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loading && notices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem' }}>Retrieving bulletin board...</div>
            ) : notices.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
                <Bell size={48} style={{ marginBottom: '1.5rem', color: 'var(--border-color)' }} />
                <h3>No Notices Found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>The school bulletin is currently empty.</p>
              </div>
            ) : (
              currentNotices.map(notice => (
                <div key={notice._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', opacity: notice.isActive ? 1 : 0.6 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: '#eff6ff', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {notice.category}
                      </span>
                      <h4 style={{ margin: 0 }}>{notice.title}</h4>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{notice.content}</p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={14} /> <i>To:</i> {notice.targetRoles.join(', ')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} /> <i>Date:</i> {new Date(notice.publishDate).toLocaleDateString()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Flag size={14} /> {notice.isActive ? 'Active' : 'Archived'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button onClick={() => handleToggleStatus(notice._id)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer' }}>
                      {notice.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button onClick={() => handleDelete(notice._id)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', color: '#dc2626' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Showing {indexOfFirst + 1}–{Math.min(indexOfLast, notices.length)} of {notices.length} notices</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', cursor: currentPage===1?'not-allowed':'pointer', opacity: currentPage===1?0.5:1, fontSize: '0.85rem' }}>Previous</button>
                  {Array.from({length: totalPages},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>setCurrentPage(p)} style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', border: p===currentPage?'none':'1px solid var(--border-color)', background: p===currentPage?'var(--primary)':'#fff', color: p===currentPage?'#fff':'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: p===currentPage?600:400 }}>{p}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', cursor: currentPage===totalPages?'not-allowed':'pointer', opacity: currentPage===totalPages?0.5:1, fontSize: '0.85rem' }}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoticeManagement;

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import {
  Plus, Edit, Trash2, X, Save, BookOpen, UserCheck
} from 'lucide-react';

const ManageSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setIsModalOpen(true);
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
    setIsModalOpen(true);
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
        setIsModalOpen(false);
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

  // color by subject type index  
  const colors = ['#2563eb', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Manage Subjects" error={error} />

        <div style={{ padding: '2.5rem' }}>
          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Subject Directory</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                Define subjects, assign teachers, and set grade thresholds.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem', width: '220px' }}
              />
              <button className="btn-primary" onClick={openAddModal}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                <Plus size={18} /> Add Subject
              </button>
            </div>
          </div>

          {/* Subject Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading subjects...</div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <BookOpen size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ color: 'var(--text-secondary)' }}>No subjects found</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Try adding a subject or changing search terms.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Subject</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Code</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Class</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Teacher</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Marks (Full / Pass)</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubjects.map((sub, idx) => (
                      <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: colors[idx % colors.length] + '20', color: colors[idx % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BookOpen size={16} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{sub.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', backgroundColor: '#f1f5f9', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>
                            {sub.code}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{sub.class}</td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <UserCheck size={15} color="var(--primary)" />
                            {getTeacherName(sub.teacherId)}
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontSize: '0.8rem', fontWeight: 600 }}>{sub.fullMarks}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>/</span>
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>{sub.passMarks}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button onClick={() => openEditModal(sub)} title="Edit"
                              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer', color: 'var(--primary)' }}>
                              <Edit size={15} />
                            </button>
                            <button onClick={() => handleDelete(sub._id)} title="Delete"
                              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', color: '#dc2626' }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                 </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filtered.length)} of {filtered.length} subjects</span>
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
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={22} />
            </button>
            <h3 style={{ margin: '0 0 1.75rem', fontSize: '1.25rem' }}>
              {modalMode === 'add' ? 'Create New Subject' : 'Edit Subject'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Subject Name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Mathematics" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Subject Code</label>
                  <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. MATH101" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Class</label>
                <input required value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}
                  placeholder="e.g. Grade 10" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Assign Teacher
                </label>
                <select required value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="">— Select a Teacher —</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Full Marks</label>
                  <input type="number" required value={form.fullMarks} onChange={e => setForm({ ...form, fullMarks: Number(e.target.value) })}
                    min={1} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Pass Marks</label>
                  <input type="number" required value={form.passMarks} onChange={e => setForm({ ...form, passMarks: Number(e.target.value) })}
                    min={1} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={formLoading}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {formLoading ? 'Saving...' : <><Save size={16} /> {modalMode === 'add' ? 'Create Subject' : 'Save Changes'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;

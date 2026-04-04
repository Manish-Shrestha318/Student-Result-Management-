import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import {
  Plus, Edit, Trash2, X, Save, BookOpen, Users, Home, UserCheck
} from 'lucide-react';

const ManageClasses: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentClasses = classes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(classes.length / itemsPerPage);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    section: '',
    academicYear: '',
    classTeacher: '',
    roomNumber: '',
  });

  const token = localStorage.getItem('token');

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classes', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setClasses(data.classes || data || []);
    } catch {
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/users?role=teacher', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTeachers(data.users || data || []);
    } catch {
      setError('Failed to load teachers list');
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setForm({ name: '', section: '', academicYear: new Date().getFullYear().toString(), classTeacher: '', roomNumber: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cls: any) => {
    setModalMode('edit');
    setSelectedClass(cls);
    setForm({
      name: cls.name || '',
      section: cls.section || '',
      academicYear: cls.academicYear || '',
      classTeacher: cls.classTeacher?._id || cls.classTeacher || '',
      roomNumber: cls.roomNumber || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const url = modalMode === 'add' ? '/api/classes' : `/api/classes/${selectedClass._id}`;
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
        fetchClasses();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch {
      alert('Error saving class');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this class? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchClasses();
      else alert('Failed to delete class');
    } catch {
      alert('Error deleting class');
    }
  };

  const getTeacherName = (classTeacher: any) => {
    if (!classTeacher) return 'Unassigned';
    if (typeof classTeacher === 'object') return classTeacher.name || 'Unknown';
    const t = teachers.find(t => t._id === classTeacher);
    return t ? t.name : 'Unknown';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Manage Classes" error={error} />

        <div style={{ padding: '2.5rem' }}>
          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Class Directory</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                Create and manage all classes, sections, and teacher assignments.
              </p>
            </div>
            <button className="btn-primary" onClick={openAddModal}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
              <Plus size={18} /> Add New Class
            </button>
          </div>

          {/* Class Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading classes...</div>
          ) : classes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <BookOpen size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ color: 'var(--text-secondary)' }}>No classes yet</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click "Add New Class" to get started.</p>
            </div>
          ) : (
            <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {currentClasses.map((cls) => (
                <div key={cls._id} className="card" style={{ padding: '1.75rem', position: 'relative', borderTop: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{cls.name} — Section {cls.section}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                        Academic Year: {cls.academicYear}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(cls)} title="Edit"
                        style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: '#fff', cursor: 'pointer', color: 'var(--primary)' }}>
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(cls._id)} title="Delete"
                        style={{ padding: '0.4rem', border: '1px solid #fee2e2', borderRadius: '6px', background: '#fff', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <UserCheck size={15} color="var(--primary)" />
                      <span><strong>Class Teacher:</strong> {getTeacherName(cls.classTeacher)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Users size={15} color="#0ea5e9" />
                      <span><strong>Students:</strong> {cls.students?.length || 0} enrolled</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <BookOpen size={15} color="#8b5cf6" />
                      <span><strong>Subjects:</strong> {cls.subjects?.length || 0} assigned</span>
                    </div>
                    {cls.roomNumber && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <Home size={15} color="#f59e0b" />
                        <span><strong>Room:</strong> {cls.roomNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Showing {indexOfFirst + 1}–{Math.min(indexOfLast, classes.length)} of {classes.length} classes</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', cursor: currentPage===1?'not-allowed':'pointer', opacity: currentPage===1?0.5:1, fontSize: '0.85rem' }}>Previous</button>
                  {Array.from({length: totalPages},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>setCurrentPage(p)} style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', border: p===currentPage?'none':'1px solid var(--border-color)', background: p===currentPage?'var(--primary)':'#fff', color: p===currentPage?'#fff':'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: p===currentPage?600:400 }}>{p}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', cursor: currentPage===totalPages?'not-allowed':'pointer', opacity: currentPage===totalPages?0.5:1, fontSize: '0.85rem' }}>Next</button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={22} />
            </button>
            <h3 style={{ margin: '0 0 1.75rem', fontSize: '1.25rem' }}>
              {modalMode === 'add' ? 'Create New Class' : 'Edit Class'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Class Name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Grade 10" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Section</label>
                  <input required value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                    placeholder="e.g. A" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Academic Year</label>
                  <input required value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })}
                    placeholder="e.g. 2025" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Room Number</label>
                  <input value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })}
                    placeholder="e.g. 201" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Assign Class Teacher
                </label>
                <select required value={form.classTeacher} onChange={e => setForm({ ...form, classTeacher: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="">— Select a Teacher —</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={formLoading}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {formLoading ? 'Saving...' : <><Save size={16} /> {modalMode === 'add' ? 'Create Class' : 'Save Changes'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClasses;

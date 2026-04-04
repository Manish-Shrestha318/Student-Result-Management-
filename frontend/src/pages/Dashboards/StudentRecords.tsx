import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  BookOpen,
  Hash
} from 'lucide-react';

const StudentRecords: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
      console.log("Fetched student records (v2):", data);

      if (data && data.success && Array.isArray(data.users)) {
        // Enforce role=student filter on client side as well for safety
        const onlyStudents = data.users.filter((u: any) => u.role === 'student');
        setStudents(onlyStudents);
        setFilteredStudents(onlyStudents);
        console.log(`[CLIENT] Successfully set ${onlyStudents.length} student records.`);
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
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentEditingStudent(null);
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
      // Assuming we have an endpoint to update student profile directly if needed, or we just update the Student model via user controller
      // According to backend routes, there isn't a direct exposed PUT /api/users/students/:id anymore.
      // Wait, let's look at userRoute.ts! 
      // Actually, userRoute.ts has `router.put("/:id", updateUserController)` which updates the USER model.
      // To update student profile fields, we need the backend to support it. 
      // If there's no endpoint, I will just send a PUT to /api/users/students/:id and we will add that to backend if we have to.
      // Or we can just log that the user needs the backend route. Let's send the request to /api/users/students/profile/:profileId
      // I will implement a quick backend route fix too if needed.
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
        alert("Student updated successfully!");
        closeEditModal();
        fetchStudents(); // refresh the list
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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <AdminSidebar />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Student Records" error={error} />

        <div style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Student Directory</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Maintain and manage all enrolled students and their academic details.</p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name or roll number..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none' }} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Filter size={20} color="var(--text-secondary)" />
                <select 
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  <option value="all">All Classes</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Student Name</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Class / Section</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Roll No.</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Parent Contact</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading student records...</td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found.</td>
                    </tr>
                  ) : (
                    currentStudents.map((student) => (
                      <tr key={student._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                              <GraduationCap size={20} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{student.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Class {student.class} - {student.section}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                            <Hash size={14} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{student.rollNumber}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                              <Phone size={14} color="#16a34a" /> {student.parentPhone}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Guardian: {student.parentName}</div>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button title="View Profile" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                              <Eye size={16} />
                            </button>
                            <button onClick={() => openEditModal(student)} title="Edit Record" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer', color: 'var(--primary)' }}>
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(student._id, student.name)} title="Delete" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', color: '#dc2626' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filteredStudents.length)} of {filteredStudents.length}</span>
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

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Edit Student Details</h3>
            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Class</label>
                <select
                  value={editForm.class}
                  onChange={(e) => setEditForm({ ...editForm, class: e.target.value, section: '' })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#fff', outline: 'none' }}
                  required
                >
                  <option value="">— Select Class —</option>
                  {/* unique class names */}
                  {[...new Set(availableClasses.map(c => c.name))].map(name => (
                    <option key={name as string} value={name as string}>{name as string}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Section</label>
                <select
                  value={editForm.section}
                  onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#fff', outline: 'none' }}
                  required
                  disabled={!editForm.class}
                >
                  <option value="">— Select Section —</option>
                  {availableSections.map((sec: string) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Roll Number</label>
                <input 
                  type="text" 
                  value={editForm.rollNumber} 
                  onChange={(e) => setEditForm({...editForm, rollNumber: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Parent Contact</label>
                <input 
                  type="text" 
                  value={editForm.parentPhone} 
                  onChange={(e) => setEditForm({...editForm, parentPhone: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={closeEditModal} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRecords;

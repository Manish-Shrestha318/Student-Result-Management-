import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // Basic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Conditional Fields
  const [studentClass, setStudentClass] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [childName, setChildName] = useState('');
  const [studentID, setStudentID] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [dataFetching, setDataFetching] = useState(false);
  const [error, setError] = useState('');
  
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [parentClassFilter, setParentClassFilter] = useState('');
  const [filteredChildren, setFilteredChildren] = useState<any[]>([]);

  // Fetch data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setDataFetching(true);
      try {
        const [clsRes, subjRes, studRes] = await Promise.all([
          fetch('/api/public/classes'),
          fetch('/api/public/subjects'),
          fetch('/api/public/students')
        ]);
        
        const clsData = await clsRes.json();
        const subjData = await subjRes.json();
        const studData = await studRes.json();
        
        if (clsData.success) setAllClasses(clsData.classes);
        // Subject route returns array directly or {success, subjects}? 
        // Based on subjectController it returns the array directly.
        setAllSubjects(Array.isArray(subjData) ? subjData : (subjData.subjects || []));
        if (studData.success) setAllStudents(studData.students);
      } catch (err) {
        console.error("Failed to fetch registration data", err);
      } finally {
        setDataFetching(false);
      }
    };
    fetchData();
  }, []);

  // Filter children when parent selects a class
  useEffect(() => {
    if (parentClassFilter) {
      const filtered = allStudents.filter(s => s.class === parentClassFilter);
      setFilteredChildren(filtered);
    } else {
      setFilteredChildren([]);
    }
    // Clear selection if class changes
    setChildName('');
    setStudentID('');
  }, [parentClassFilter, allStudents]);

  const handleChildSelection = (studentId: string) => {
    const student = allStudents.find(s => s._id === studentId);
    if (student) {
      setChildName(student.name);
      setStudentID(student.studentID || '');
    } else {
      setChildName('');
      setStudentID('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
        confirmPassword: password, // Already checked equality above
        role: role.toLowerCase(),
        ...(role === 'Student' && { class: studentClass, rollNumber }),
        ...(role === 'Parent' && { childName, studentID }),
        ...(role === 'Teacher' && { subject: teacherSubject, phoneNumber }),
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (_err) {
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Back to Home
      </Link>
      <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign up to manage and view school results</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {dataFetching && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
            <Loader2 className="animate-spin" size={20} />
            <span style={{ fontSize: '0.9rem' }}>Loading registration options...</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="Email Address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="input-field" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="input-field" 
                  placeholder="••••••••" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Select Role</label>
            <select 
              className="input-field" 
              required 
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="" disabled>Choose your role...</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Parent">Parent</option>
            </select>
          </div>

          {/* Conditional Fields for Student */}
          {role === 'Student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Class</label>
                <select 
                  className="input-field" 
                  required 
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                >
                  <option value="" disabled>Select Class...</option>
                  {allClasses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Roll Number</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. 101" 
                  required 
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Conditional Fields for Parent */}
           {role === 'Parent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Student's Class</label>
                  <select 
                    className="input-field" 
                    required 
                    value={parentClassFilter}
                    onChange={(e) => setParentClassFilter(e.target.value)}
                  >
                    <option value="">Select Child's Class...</option>
                    {allClasses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Child's Name</label>
                  <select 
                    className="input-field" 
                    required 
                    disabled={!parentClassFilter}
                    value={allStudents.find(s => s.name === childName)?._id || ""}
                    onChange={(e) => handleChildSelection(e.target.value)}
                  >
                    <option value="">{parentClassFilter ? "Select Child..." : "Choose Class First"}</option>
                    {filteredChildren.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentID})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Student ID (Auto-filled)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Select a child above" 
                  readOnly
                  disabled
                  value={studentID}
                  style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                />
              </div>
            </div>
          )}

          {/* Conditional Fields for Teacher */}
          {role === 'Teacher' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Subject Specialty</label>
                <select 
                  className="input-field" 
                  required 
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value)}
                >
                  <option value="" disabled>Select Subject...</option>
                  {allSubjects.map((s: any) => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Phone Number</label>
                <input 
                  type="tel" 
                  className="input-field" 
                  placeholder="+1 234 567 890" 
                  required 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
 

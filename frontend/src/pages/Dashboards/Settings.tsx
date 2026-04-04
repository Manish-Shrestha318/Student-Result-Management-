import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { 
  User, 
  Lock, 
  Camera, 
  Save, 
  ShieldCheck,
  Bell,
  Globe,
  Monitor,
  CheckCircle2,
  LayoutDashboard,
  GraduationCap,
  Calendar,
  FileText,
  LogOut,
  Settings as SettingsIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePicture: ''
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data && data.user) {
        setProfile({
          name: data.user.name || '',
          email: data.user.email || '',
          profilePicture: data.user.profilePicture || ''
        });
      }
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name: profile.name })
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Profile updated successfully!');
        const updatedUser = { ...currentUser, name: profile.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError('Passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (!passwords.current) {
      setError('Current password is required');
      return;
    }

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Password changed successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('photo', e.target.files[0]);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/users/photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await response.json();
      if (data.profilePicture) {
        setProfile({ ...profile, profilePicture: data.profilePicture });
        setSuccessMessage('Profile photo updated!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {currentUser.role === 'admin' ? (
        <AdminSidebar />
      ) : (
        <aside style={{ width: '280px', backgroundColor: '#fff', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>SmartResults</h1>
          </div>
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentUser.role === 'student' ? (
              <>
                <LocalNavItem icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => navigate('/dashboard/student')} />
                <LocalNavItem icon={<GraduationCap size={20} />} label="Results" onClick={() => navigate('/dashboard/student/results')} />
                <LocalNavItem icon={<Calendar size={20} />} label="Attendance" onClick={() => navigate('/dashboard/student/attendance')} />
                <LocalNavItem icon={<Bell size={20} />} label="Notices" onClick={() => navigate('/dashboard/student/notices')} />
                <LocalNavItem icon={<FileText size={20} />} label="Reports" onClick={() => navigate('/dashboard/student')} />
              </>
            ) : (
              <>
                <LocalNavItem icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => navigate('/dashboard/teacher')} />
              </>
            )}
          </nav>
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', color: '#dc2626', border: 'none', background: 'none', fontSize: '1rem', cursor: 'pointer', marginTop: 'auto' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </aside>
      )}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <AdminHeader title="Account Settings" error={error} />

        <div style={{ padding: '2.5rem' }}>
          {successMessage && (
            <div style={{ padding: '1rem', background: '#dcfce7', color: '#15803d', borderRadius: '10px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, border: '1px solid #bbf7d0' }}>
              <CheckCircle2 size={20} /> {successMessage}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
            {/* Profile Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <img 
                    src={profile.profilePicture || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f1f5f9' }} 
                  />
                  <label style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: 'var(--primary)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid #fff' }}>
                    <Camera size={18} />
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                </div>
                <h3 style={{ margin: '0 0 0.25rem 0' }}>{profile.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{currentUser.role}</p>
                <div style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', background: '#eff6ff', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={14} /> Verified Account
                </div>
              </div>

              <div className="card" style={{ padding: '1rem 0' }}>
                <SettingsNav icon={<User size={18} />} label="Personal Information" active />
                <SettingsNav icon={<Lock size={18} />} label="Security & Password" />
                <SettingsNav icon={<Bell size={18} />} label="Notifications" />
                <SettingsNav icon={<Globe size={18} />} label="Regional & Language" />
                <SettingsNav icon={<Monitor size={18} />} label="System Display" />
              </div>
            </aside>

            {/* Main Settings Area */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Profile Details Form */}
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <User size={20} color="var(--primary)" /> {profile.name}'s Profile
                </h3>
                <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Save size={18} /> {loading ? 'Saving...' : 'Update Information'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Password Change Form */}
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <Lock size={20} color="var(--primary)" /> Security & Password
                </h3>
                <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Current Password</label>
                    <input 
                      type="password" 
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>New Password</label>
                      <input 
                        type="password" 
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Confirm New Password</label>
                      <input 
                        type="password" 
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={loading} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={18} /> Update Password
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const SettingsNav: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
  <button style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.75rem', 
    width: '100%', 
    padding: '0.8rem 1.5rem', 
    border: 'none', 
    background: active ? '#eff6ff' : 'none', 
    color: active ? 'var(--primary)' : 'var(--text-secondary)', 
    fontSize: '0.9rem', 
    fontWeight: active ? 700 : 500, 
    cursor: 'pointer',
    borderLeft: active ? '4px solid var(--primary)' : '4px solid transparent'
  }}>
    {icon}
    {label}
  </button>
);

const LocalNavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem', 
      padding: '0.875rem 1.25rem', 
      borderRadius: '8px', 
      border: 'none', 
      backgroundColor: active ? '#f1f5f9' : 'transparent', 
      color: active ? 'var(--primary)' : 'var(--text-secondary)', 
      fontSize: '0.95rem',
      fontWeight: active ? 600 : 500,
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
      transition: 'all 0.2s'
    }}
  >
    {icon}
    {label}
  </button>
);

export default Settings;

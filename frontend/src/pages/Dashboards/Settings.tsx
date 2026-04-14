import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Row, Col, Card, Form, Button, Alert, ListGroup, Image, Badge } from 'react-bootstrap';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

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
      
      if (response.ok) {
        setSuccessMessage('Profile updated successfully!');
        const updatedUser = { ...currentUser, name: profile.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userUpdated')); // Force Header to refresh
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const data = await response.json();
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
      
      if (response.ok) {
        setSuccessMessage('Password changed successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const data = await response.json();
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
        // 1. Update local state
        setProfile({ ...profile, profilePicture: data.profilePicture });
        
        const updatedUser = { ...currentUser, profilePicture: data.profilePicture };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userUpdated')); // Force Header to refresh
        
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
    <div className="d-flex overflow-hidden bg-white" style={{ height: '100vh', width: '100vw' }}>
      {currentUser.role === 'admin' ? <AdminSidebar /> : <StudentSidebar />}
      
      <main className="flex-grow-1 d-flex flex-column overflow-auto bg-light">
        <AdminHeader title="Settings" error={error} />

        <div className="container-fluid p-4 p-lg-5">
          {successMessage && (
            <Alert variant="success" className="border-0 rounded-4 shadow-sm mb-4 fw-bold smaller text-uppercase px-4">
               {successMessage}
            </Alert>
          )}

          <Row className="g-5">
            {/* ── Configuration Sidebar ── */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 text-center p-4 mb-4">
                <Card.Body>
                  <div className="position-relative d-inline-block mb-4">
                    <Image 
                      src={profile.profilePicture || 'https://via.placeholder.com/150'} 
                      roundedCircle 
                      style={{ width: '120px', height: '120px', objectFit: 'cover', border: '5px solid #f8fafc' }} 
                    />
                    <label className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border-3 border-white shadow-sm cursor-pointer" style={{ width: '36px', height: '36px' }}>
                      <span className="smaller">+</span>
                      <input type="file" className="d-none" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                  <h4 className="fw-bold text-dark mb-1 ls-1">{profile.name}</h4>
                  <p className="text-muted smallest fw-bold text-uppercase ls-1 mb-4">{currentUser.role} Account</p>
                  <Badge bg="primary-soft" text="primary" className="fw-bold smaller text-uppercase px-3 py-2 border rounded-pill">
                     IDENTITY VERIFIED
                  </Badge>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <ListGroup variant="flush">
                  <ListGroup.Item action active className="p-4 border-0 border-start border-4 border-primary fw-bold smaller text-uppercase ls-1 px-4">PROFILE SETTINGS</ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>

            {/* ── Main Configuration Terminal ── */}
            <Col lg={8}>
              <div className="d-flex flex-column gap-5">
                {/* ── Identity Form ── */}
                <Card className="border-0 shadow-sm rounded-4 p-4 p-lg-5">
                   <h5 className="fw-bold text-dark mb-4 ls-1 border-bottom pb-3 text-uppercase small">Profile Settings</h5>
                   <Form onSubmit={handleUpdateProfile}>
                      <Form.Group className="mb-4">
                        <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Full Name</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          className="py-2 smaller border-light-dark shadow-none fw-medium"
                          placeholder="REQUIRED FIELD"
                        />
                      </Form.Group>
                      <div className="d-flex justify-content-end pt-2">
                        <Button variant="primary" type="submit" disabled={loading} className="fw-bold px-5 py-2 rounded-pill shadow-sm ls-1 smaller">
                           {loading ? 'SYNCHRONIZING...' : 'SAVE PROFILE'}
                        </Button>
                      </div>
                   </Form>
                </Card>

                {/* Change Password */}
                <Card className="border-0 shadow-sm rounded-4 p-4 p-lg-5">
                  <h5 className="fw-bold text-dark mb-4 ls-1 border-bottom pb-3 text-uppercase small">Change Password</h5>
                  <Form onSubmit={handleChangePassword}>
                    <Form.Group className="mb-4">
                      <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Current Password</Form.Label>
                      <Form.Control 
                        type="password" 
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className="py-2 smaller border-light-dark shadow-none"
                        placeholder="••••••••"
                      />
                    </Form.Group>
                    <Row className="g-4 mb-5">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">New Password</Form.Label>
                          <Form.Control 
                            type="password" 
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            className="py-2 smaller border-light-dark shadow-none"
                            placeholder="••••••••"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="smallest fw-bold text-muted text-uppercase ls-1">Confirm New Password</Form.Label>
                          <Form.Control 
                            type="password" 
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            className="py-2 smaller border-light-dark shadow-none"
                            placeholder="••••••••"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-end">
                      <Button variant="outline-dark" type="submit" disabled={loading} className="fw-bold px-5 py-2 rounded-pill smaller border-0 bg-light shadow-sm ls-1">
                        CHANGE PASSWORD
                      </Button>
                    </div>
                  </Form>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
};

export default Settings;


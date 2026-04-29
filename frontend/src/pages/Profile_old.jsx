import React, { useState } from 'react';
import FAQ from './FAQ';
import OrderHistory from './OrderHistory';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const [tab, setTab] = useState('faq');
  const { user, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(user || {});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Update form state on user change
  React.useEffect(() => {
    setForm(user || {});
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = () => {
    // Ensure gender is always a string and not undefined
    setUser({ ...user, ...form, gender: form.gender || 'Male' });
    setEditMode(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(f => ({ ...f, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPasswordSuccess('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(result.message || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('Error changing password. Please try again.');
      console.error(err);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-page" style={{ maxWidth: 800, margin: '2rem auto', padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>My Profile</h2>

      {user && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
          padding: 32,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            color: '#fff',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {form.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            {editMode ? (
              <>
                <div style={{ marginBottom: 8 }}>
                  <label><strong>Name:</strong> <input name="name" value={form.name || ''} onChange={handleChange} style={{ marginLeft: 8 }} /></label>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label><strong>Phone:</strong> <input name="phone" value={form.phone || ''} onChange={handleChange} style={{ marginLeft: 8 }} /></label>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label><strong>Date of Birth:</strong> <input type="date" name="dob" value={form.dob || ''} onChange={handleChange} style={{ marginLeft: 8 }} /></label>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label><strong>Gender:</strong> <select name="gender" value={form.gender || ''} onChange={handleChange} style={{ marginLeft: 8 }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select></label>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label><strong>Saved Addresses:</strong> <input name="savedAddresses" value={Array.isArray(form.savedAddresses) ? form.savedAddresses.join('; ') : (form.savedAddresses || '')} onChange={e => setForm(f => ({ ...f, savedAddresses: e.target.value.split(';').map(s => s.trim()) }))} style={{ marginLeft: 8, width: 200 }} /></label>
                </div>
                <button onClick={handleSave} style={{ marginRight: 8 }}>Save</button>
                <button onClick={() => { setEditMode(false); setForm(user); }}>Cancel</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{form.name}</div>
                <div style={{ color: '#666', marginBottom: 2 }}><strong>Email:</strong> {form.email}</div>
                {form.phone && <div style={{ color: '#666', marginBottom: 2 }}><strong>Phone:</strong> {form.phone}</div>}
                <div style={{ color: '#666', marginBottom: 2 }}><strong>Date of Birth:</strong> {form.dob}</div>
                <div style={{ color: '#666', marginBottom: 2 }}><strong>Gender:</strong> {form.gender}</div>
                <div style={{ color: '#666', marginBottom: 2 }}><strong>Saved Addresses:</strong> {Array.isArray(form.savedAddresses) ? form.savedAddresses.join('; ') : form.savedAddresses}</div>
                <div style={{ color: '#888', fontSize: 15 }}><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{form.role}</span></div>
                <div style={{ color: (form.accountStatus || 'active') === 'active' ? 'green' : 'red', fontSize: 15, marginTop: 2 }}><strong>Account Status:</strong> {form.accountStatus || 'active'}</div>
                <button 
                  onClick={() => setEditMode(true)} 
                  style={{ 
                    marginTop: 12, 
                    background: 'linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 20px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(161,140,209,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  title="Edit your profile details"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setTab('faq')} style={{ fontWeight: tab === 'faq' ? 'bold' : 'normal' }}>FAQ</button>
        <button onClick={() => setTab('orders')} style={{ fontWeight: tab === 'orders' ? 'bold' : 'normal' }}>Order History</button>
        <button onClick={() => setTab('password')} style={{ fontWeight: tab === 'password' ? 'bold' : 'normal' }}>Change Password</button>
      </div>
      <div>
        {tab === 'faq' && <FAQ />}
        {tab === 'orders' && <OrderHistory />}
        {tab === 'password' && (
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
            padding: 32,
          }}>
            <h3 style={{ marginBottom: 24 }}>Change Password</h3>

            {passwordError && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#dc2626',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                color: '#16a34a',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  disabled={passwordLoading}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  disabled={passwordLoading}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  disabled={passwordLoading}
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  opacity: passwordLoading ? 0.7 : 1
                }}
              >
                {passwordLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

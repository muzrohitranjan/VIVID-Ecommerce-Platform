import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, Store, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OTPVerification from '../components/OTPVerification';
import { sendOTPEmail, completeSellerRegistration } from '../services/emailService';

export default function SellerRegistration() {
  const [showOTP, setShowOTP] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('crafts');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegisterWithOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!businessName || !email || !password || !phone || !address) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Send OTP
      const result = await sendOTPEmail(email, 'seller');
      if (result.success) {
        setShowOTP(true);
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Error sending OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = async (verifiedEmail) => {
    try {
      // Complete seller registration
      const result = await completeSellerRegistration({
        businessName,
        businessType,
        email: verifiedEmail,
        password,
        phone,
        address
      });

      if (result.success) {
        const sellerUser = {
          id: result.data?.id || 'seller_' + Date.now(),
          name: businessName,
          email: verifiedEmail,
          role: 'seller'
        };

        setUser(sellerUser);
        localStorage.setItem('token', result.token);
        localStorage.setItem('sellerId', result.data?.id || 'seller_' + Date.now());
        localStorage.setItem('sellerName', businessName);
        localStorage.setItem('sellerEmail', verifiedEmail);

        navigate('/seller-dashboard');
      } else {
        setError(result.message || 'Failed to complete registration');
        setShowOTP(false);
      }
    } catch (err) {
      setError('Error completing registration. Please try again.');
      console.error(err);
      setShowOTP(false);
    }
  };

  const handleResendOTP = async (verifiedEmail) => {
    try {
      const result = await sendOTPEmail(verifiedEmail, 'seller');
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Error resending OTP. Please try again.');
    }
  };

  if (showOTP) {
    return (
      <div className="container animate-fade-up perspective-container" style={{ maxWidth: '500px', marginTop: '4rem', marginBottom: '4rem' }}>
        <OTPVerification 
          email={email} 
          onVerified={handleOTPVerified}
          onResend={handleResendOTP}
          userType="seller"
        />
      </div>
    );
  }

  return (
    <div className="container animate-fade-up perspective-container" style={{ maxWidth: '600px', marginTop: '2rem', marginBottom: '4rem' }}>
      <div className="glass-panel preserve-3d" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <Store size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', transform: 'translateZ(20px)' }}>
          Become a Seller
        </h1>
        <p className="text-muted" style={{ marginBottom: '2.5rem', transform: 'translateZ(10px)' }}>
          Register your business and start selling authentic crafts to millions of customers.
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegisterWithOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', transform: 'translateZ(30px)' }}>
          {/* Business Name */}
          <div style={{ position: 'relative' }}>
            <Store style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Business/Shop Name" 
              required 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            />
          </div>

          {/* Business Type */}
          <div style={{ position: 'relative' }}>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            >
              <option value="crafts">Handmade Crafts</option>
              <option value="textiles">Textiles & Fabrics</option>
              <option value="jewelry">Jewelry & Accessories</option>
              <option value="pottery">Pottery & Ceramics</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="email" 
              placeholder="Business Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            />
          </div>

          {/* Phone */}
          <div style={{ position: 'relative' }}>
            <Phone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              required 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            />
          </div>

          {/* Address */}
          <div style={{ position: 'relative' }}>
            <MapPin style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--color-text-muted)' }} size={20} />
            <textarea 
              placeholder="Business Address" 
              required 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%', minHeight: '80px', resize: 'vertical' }}
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="password" 
              placeholder="Password (min 6 characters)" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Register & Verify'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', transform: 'translateZ(10px)' }}>
          Already have a seller account? 
          <button 
            type="button" 
            onClick={() => navigate('/seller-login')}
            style={{ 
              background: 'none', border: 'none', color: 'var(--color-primary)', 
              fontWeight: 600, cursor: 'pointer', outline: 'none', marginLeft: '0.5rem'
            }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

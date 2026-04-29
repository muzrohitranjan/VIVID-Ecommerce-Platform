import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, ArrowLeft } from 'lucide-react';
import OTPVerification from '../components/OTPVerification';
import { sendOTPEmail, completeSignup } from '../services/emailService';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignupWithOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send OTP
      const result = await sendOTPEmail(email, 'user');
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
      // Complete signup
      const result = await completeSignup({
        name,
        email: verifiedEmail,
        password,
        phone
      });

      if (result.success) {
        // Call the auth context signup function
        signup(name, verifiedEmail, password, phone);
        navigate('/');
      } else {
        setError(result.message || 'Failed to complete signup');
      }
    } catch (err) {
      setError('Error completing signup. Please try again.', err);
      setShowOTP(false);
    }
  };

  const handleResendOTP = async (verifiedEmail) => {
    try {
      const result = await sendOTPEmail(verifiedEmail, 'user');
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Error resending OTP. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email, password);

      if (!loggedUser) {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLogin = () => {
    // Set guest user
    const guestUser = {
      name: 'Guest',
      email: 'guest@example.com',
      role: 'guest',
      accountStatus: 'active'
    };
    localStorage.setItem('guest', 'true');
    navigate('/');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Temporary password sent to your email');
        setShowForgotPassword(false);
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Error sending reset email. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Form
  if (showForgotPassword) {
    return (
      <div className="container animate-fade-up perspective-container" style={{ maxWidth: '500px', marginTop: '4rem', marginBottom: '4rem' }}>
        <div className="glass-panel preserve-3d" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <button
            onClick={() => setShowForgotPassword(false)}
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', transform: 'translateZ(20px)' }}>
            Forgot Password
          </h1>
          <p className="text-muted" style={{ marginBottom: '2.5rem', transform: 'translateZ(10px)' }}>
            Enter your email address and we'll send you a temporary password.
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

          {success && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#16a34a',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', transform: 'translateZ(30px)' }}>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '3rem', width: '100%' }}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Forgot Password Form
  if (showForgotPassword) {
    return (
      <div className="container animate-fade-up perspective-container" style={{ maxWidth: '500px', marginTop: '4rem', marginBottom: '4rem' }}>
        <div className="glass-panel preserve-3d" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <button
            onClick={() => setShowForgotPassword(false)}
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', transform: 'translateZ(20px)' }}>
            Forgot Password
          </h1>
          <p className="text-muted" style={{ marginBottom: '2.5rem', transform: 'translateZ(10px)' }}>
            Enter your email address and we'll send you a temporary password.
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

          {success && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#16a34a',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', transform: 'translateZ(30px)' }}>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '3rem', width: '100%' }}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showOTP) {
    return (
      <div className="container animate-fade-up perspective-container" style={{ maxWidth: '500px', marginTop: '4rem', marginBottom: '4rem' }}>
        <OTPVerification 
          email={email} 
          onVerified={handleOTPVerified}
          onResend={handleResendOTP}
          userType="user"
        />
      </div>
    );
  }

  return (
    <div className="container animate-fade-up perspective-container" style={{ maxWidth: '500px', marginTop: '4rem', marginBottom: '4rem' }}>
      <div className="glass-panel preserve-3d" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', transform: 'translateZ(20px)' }}>
          {isLogin ? 'Welcome Back' : 'Join Us'}
        </h1>
        <p className="text-muted" style={{ marginBottom: '2.5rem', transform: 'translateZ(10px)' }}>
          {isLogin ? 'Login to continue exploring authentic crafts.' : 'Create an account to support rural artisans.'}
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

        <form onSubmit={isLogin ? handleLogin : handleSignupWithOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', transform: 'translateZ(30px)' }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '3rem', width: '100%' }}
                disabled={loading}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <Phone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '3rem', width: '3rem', width: '100%' }}
                disabled={loading}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', width: '100%' }}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? (isLogin ? 'Logging in...' : 'Sending OTP...') : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        {isLogin && (
          <div style={{ marginTop: '1rem', transform: 'translateZ(10px)' }}>
            <button 
              type="button" 
              onClick={() => setShowForgotPassword(true)}
              style={{ 
                background: 'none', border: 'none', color: 'var(--color-primary)', 
                fontSize: '0.875rem', cursor: 'pointer', outline: 'none', textDecoration: 'underline'
              }}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {isLogin && (
          <div style={{ marginTop: '1rem', transform: 'translateZ(10px)' }}>
            <button 
              type="button" 
              onClick={handleSkipLogin}
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
            >
              Skip Login & Explore
            </button>
          </div>
        )}

        <p style={{ marginTop: '2rem', transform: 'translateZ(10px)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ 
              background: 'none', border: 'none', color: 'var(--color-primary)', 
              fontWeight: 600, cursor: 'pointer', outline: 'none' 
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/OTPVerification.css';
import { verifyEmailOTP } from '../services/emailService';

export default function OTPVerification({ email, onVerified, onResend, userType = 'user' }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleBackspace = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }
    // Call backend to verify OTP
    const result = await verifyEmailOTP(email, otpString, userType);
    if (result.success) {
      setVerified(true);
      onVerified && onVerified(email);
    } else {
      setError(result.message || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setTimeRemaining(300);
    setOtp(['', '', '', '', '', '']);
    setError('');
    await onResend(email);
  };

  if (verified) {
    return (
      <div className="otp-verified-container">
        <CheckCircle size={48} className="verified-icon" />
        <h2>Email Verified</h2>
        <p>Your email has been verified successfully!</p>
      </div>
    );
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="otp-container">
      <div className="otp-header">
        <Mail size={32} className="mail-icon" />
        <h2>Verify Your Email</h2>
        <p>We've sent a 6-digit code to <strong>{email}</strong></p>
      </div>

      <form onSubmit={handleVerify} className="otp-form">
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOTPChange(index, e.target.value)}
              onKeyDown={(e) => handleBackspace(index, e)}
              className="otp-input"
              placeholder="0"
              disabled={loading}
            />
          ))}
        </div>

        {error && (
          <div className="otp-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="otp-timer">
          <span>Code expires in: {minutes}:{seconds.toString().padStart(2, '0')}</span>
        </div>

        <button
          type="submit"
          disabled={loading || timeRemaining === 0}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="otp-footer">
        <p>Didn't receive the code?</p>
        <button
          type="button"
          disabled={timeRemaining > 0}
          onClick={handleResend}
          className="resend-btn"
        >
          {timeRemaining > 0 ? `Resend in ${minutes}:${seconds.toString().padStart(2, '0')}` : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}

// OTP Utility Functions 
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTPTemporarily = (email, otp) => {
  // Store OTP in sessionStorage with 5-minute expiry
  const otpData = {
    otp,
    email,
    timestamp: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  };
  sessionStorage.setItem(`otp_${email}`, JSON.stringify(otpData));
};

export const verifyOTP = (email, enteredOTP) => {
  const storedData = sessionStorage.getItem(`otp_${email}`);
  
  if (!storedData) {
    return { success: false, message: 'OTP not found. Please request a new OTP.' };
  }

  const otpData = JSON.parse(storedData);
  
  if (Date.now() > otpData.expiresAt) {
    sessionStorage.removeItem(`otp_${email}`);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (otpData.otp === enteredOTP) {
    sessionStorage.removeItem(`otp_${email}`);
    return { success: true, message: 'OTP verified successfully!' };
  }

  return { success: false, message: 'Invalid OTP. Please try again.' };
};

export const resendOTP = (email) => {
  sessionStorage.removeItem(`otp_${email}`);
  const newOTP = generateOTP();
  storeOTPTemporarily(email, newOTP);
  return newOTP;
};

export const getOTPTimeRemaining = (email) => {
  const storedData = sessionStorage.getItem(`otp_${email}`);
  
  if (!storedData) return 0;

  const otpData = JSON.parse(storedData);
  const remaining = Math.max(0, Math.ceil((otpData.expiresAt - Date.now()) / 1000));
  
  return remaining;
};
// OTP Utility Functions
// (No longer used for registration flow; backend handles OTP generation/verification)

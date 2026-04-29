import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const sendOTPEmail = async (email, userType = 'user') => {
  try {
    // Request backend to generate and send OTP
    const response = await axios.post(`${API_BASE_URL}/send-otp`, {
      email,
      userType // 'user' for buyer, 'seller' for seller
    });
    return {
      success: true,
      message: 'OTP sent to your email',
      data: response.data
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send OTP. Please try again.'
    };
  }
};

export const verifyEmailOTP = async (email, otp, userType = 'user') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
      email,
      otp,
      userType
    });

    return {
      success: true,
      message: 'Email verified successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Invalid OTP'
    };
  }
};

export const completeSignup = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/complete-signup`, userData);
    return {
      success: true,
      message: 'Account created successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Error completing signup:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Signup failed'
    };
  }
};

export const completeSellerRegistration = async (sellerData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/complete-seller-registration`, sellerData);
    return {
      success: true,
      message: 'Seller account created successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Error completing seller registration:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Seller registration failed'
    };
  }
};

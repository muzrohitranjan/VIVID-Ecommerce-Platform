// Simple backend for handling OTP emails
// This file should be run separately from the React app
// You can use: node backend/server.js

import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database file path
const DB_PATH = path.join(__dirname, 'database.json');

// Database operations
const readDatabase = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return {
      users: [],
      sellers: [],
      products: [],
      orders: [],
      coupons: [],
      supportTickets: [],
      otpStore: {}
    };
  }
};

const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
  }
};

const emailService = process.env.EMAIL_SERVICE || 'gmail';
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.warn('Warning: EMAIL_USER or EMAIL_PASS is not set. OTP emails will fail until these values are configured.');
}

const transporter = nodemailer.createTransport({
  service: emailService,
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify().then(() => {
  console.log('✅ Email transporter verified successfully');
}).catch((error) => {
  console.warn('⚠️ Email transporter verification failed. OTP emails may not send.', error.message);
});

// Utility functions
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateTempPassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }

  req.user = decoded;
  next();
};

// Send OTP Email
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, userType } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const otp = generateOTP();

    // Prepare email content
    const subject = userType === 'seller'
      ? 'Your Seller Registration OTP - IIMSTC'
      : 'Your Account Verification OTP - IIMSTC';

    const htmlContent = getEmailTemplate(otp, userType);

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: htmlContent
    });

    // Store OTP in database (5 minutes)
    const db = readDatabase();
    db.otpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      userType
    };
    writeDatabase(db);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP: ' + error.message
    });
  }
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, otp, userType } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const db = readDatabase();
    const storedOTP = db.otpStore[email];

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new one.'
      });
    }

    if (Date.now() > storedOTP.expiresAt) {
      delete db.otpStore[email];
      writeDatabase(db);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP verified, remove it
    delete db.otpStore[email];
    writeDatabase(db);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      email: email
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP: ' + error.message
    });
  }
});

// Complete Signup
app.post('/api/complete-signup', async (req, res) => {
  try {
    const { email, name, password, phone } = req.body;

    // Check if user already exists
    const db = readDatabase();
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
      accountStatus: 'active',
      createdAt: new Date().toISOString()
    };

    db.users.push(user);
    writeDatabase(db);

    // Send confirmation email
    const confirmationEmail = getSignupConfirmationTemplate(name);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to IIMSTC - Account Created Successfully',
      html: confirmationEmail
    });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error completing signup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete signup: ' + error.message
    });
  }
});

// Complete Seller Registration
app.post('/api/complete-seller-registration', async (req, res) => {
  try {
    const { email, businessName, businessType, password, phone, address } = req.body;

    // Check if seller already exists
    const db = readDatabase();
    const existingSeller = db.sellers.find(s => s.email === email);
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: 'Seller already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create seller
    const seller = {
      id: Date.now().toString(),
      businessName,
      businessType,
      email,
      password: hashedPassword,
      phone,
      address,
      role: 'seller',
      status: 'approved',
      products: [],
      createdAt: new Date().toISOString()
    };

    db.sellers.push(seller);
    writeDatabase(db);

    // Send confirmation email
    const confirmationEmail = getSellerConfirmationTemplate(businessName);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to IIMSTC Seller Portal - Account Created Successfully',
      html: confirmationEmail
    });

    const token = generateToken(seller);

    res.status(200).json({
      success: true,
      message: 'Seller account created successfully. Please wait for admin approval.',
      seller: {
        id: seller.id,
        businessName: seller.businessName,
        email: seller.email,
        status: seller.status
      },
      token
    });
  } catch (error) {
    console.error('Error completing seller registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete seller registration: ' + error.message
    });
  }
});

// Email Templates
function getEmailTemplate(otp, userType) {
  const title = userType === 'seller' ? 'Seller Registration' : 'Account Verification';
  const message = userType === 'seller'
    ? 'Complete your seller registration on IIMSTC'
    : 'Verify your email to create your IIMSTC account';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
            .container { max-width: 500px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .otp-box { background: #f0f4ff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
            .warning { font-size: 12px; color: #999; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>IIMSTC - ${title}</h2>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>${message}. Use the OTP below:</p>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                </div>
                <p style="color: #666; margin-top: 20px;">This OTP will expire in 5 minutes.</p>
                <p class="warning">⚠️ Never share this OTP with anyone. IIMSTC staff will never ask for it.</p>
            </div>
            <div class="footer">
                <p>If you didn't request this, please ignore this email.</p>
                <p>&copy; 2024 IIMSTC. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function getSignupConfirmationTemplate(name) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
            .container { max-width: 500px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 15px 0; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>✓ Account Created Successfully</h2>
            </div>
            <div class="content">
                <p>Hello ${name},</p>
                <p>Welcome to IIMSTC! Your account has been created successfully.</p>
                <div class="success-badge">Account Verified</div>
                <p>You can now:</p>
                <ul>
                    <li>Browse and purchase authentic crafts</li>
                    <li>Support rural artisans directly</li>
                    <li>Track your orders</li>
                </ul>
                <p>Thank you for being part of our community!</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 IIMSTC. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function getSellerConfirmationTemplate(businessName) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
            .container { max-width: 500px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 15px 0; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>✓ Seller Account Created Successfully</h2>
            </div>
            <div class="content">
                <p>Hello ${businessName},</p>
                <p>Your seller account on IIMSTC has been created successfully!</p>
                <div class="success-badge">Account Verified</div>
                <p>You can now:</p>
                <ul>
                    <li>Add and manage your products</li>
                    <li>Track sales and orders</li>
                    <li>Reach customers across India</li>
                    <li>Grow your business with IIMSTC</li>
                </ul>
                <p>Welcome to the IIMSTC Seller Community!</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 IIMSTC. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// ============= ADMIN PANEL APIS =============

// Get Admin Dashboard Stats
app.get('/api/admin/dashboard-stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalUsers: 1245,
      totalSellers: 89,
      totalOrders: 3456,
      totalRevenue: 875000,
      pendingSellers: 12,
      activeChats: 8
    }
  });
});

// Get Pending Sellers
app.get('/api/admin/sellers-pending', (req, res) => {
  res.json({
    success: true,
    sellers: [
      { id: 1, name: 'My Crafts', email: 'crafts@example.com', status: 'pending', date: '2024-04-15' },
      { id: 2, name: 'Pottery House', email: 'pottery@example.com', status: 'pending', date: '2024-04-14' }
    ]
  });
});

// Approve/Reject Seller
app.post('/api/admin/seller-action', (req, res) => {
  const { sellerId, action } = req.body;
  
  const message = action === 'approve' 
    ? 'Seller approved successfully'
    : 'Seller rejected';

  res.json({
    success: true,
    message: message,
    data: { sellerId, action }
  });
});

// Get All Users
app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com', joined: '2024-03-15', status: 'active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', joined: '2024-02-20', status: 'active' }
    ]
  });
});

// Get All Orders
app.get('/api/admin/orders', (req, res) => {
  res.json({
    success: true,
    orders: [
      { id: 'ORD001', customer: 'John Doe', amount: 5000, status: 'shipped', date: '2024-04-15' },
      { id: 'ORD002', customer: 'Jane Smith', amount: 8500, status: 'delivered', date: '2024-04-14' }
    ]
  });
});

// Get Support Tickets
app.get('/api/admin/support-tickets', (req, res) => {
  res.json({
    success: true,
    tickets: [
      { id: 'TKT001', customer: 'User123', subject: 'Order not received', status: 'open', date: '2024-04-15' },
      { id: 'TKT002', customer: 'User456', subject: 'Payment issue', status: 'in-progress', date: '2024-04-14' }
    ]
  });
});

// ============= CUSTOMER SUPPORT APIS =============

// Store support messages (use database in production)
const supportChats = {};

// Get or Create Support Chat
app.get('/api/support/chat/:userId', (req, res) => {
  const { userId } = req.params;

  if (!supportChats[userId]) {
    supportChats[userId] = {
      userId,
      messages: [
        {
          id: 1,
          sender: 'admin',
          text: 'Hello! How can we help you today?',
          timestamp: new Date(),
          status: 'read'
        }
      ],
      createdAt: new Date()
    };
  }

  res.json({
    success: true,
    chat: supportChats[userId]
  });
});

// Send Support Message
app.post('/api/support/message', (req, res) => {
  const { userId, text, sender } = req.body;

  if (!userId || !text) {
    return res.status(400).json({
      success: false,
      message: 'UserId and message text are required'
    });
  }

  if (!supportChats[userId]) {
    supportChats[userId] = {
      userId,
      messages: [],
      createdAt: new Date()
    };
  }

  const newMessage = {
    id: supportChats[userId].messages.length + 1,
    sender: sender || 'user',
    text,
    timestamp: new Date(),
    status: sender === 'admin' ? 'read' : 'sent'
  };

  supportChats[userId].messages.push(newMessage);

  // Auto-respond from admin after 2 seconds (for demo)
  if (sender !== 'admin') {
    setTimeout(() => {
      const adminResponse = {
        id: supportChats[userId].messages.length + 1,
        sender: 'admin',
        text: 'Thanks for your message. Our team will get back to you shortly!',
        timestamp: new Date(),
        status: 'read'
      };
      supportChats[userId].messages.push(adminResponse);
    }, 2000);
  }

  res.json({
    success: true,
    message: 'Message sent successfully',
    data: newMessage
  });
});

// Get Support Tickets for User
app.get('/api/support/tickets/:userId', (req, res) => {
  const { userId } = req.params;

  res.json({
    success: true,
    tickets: [
      {
        id: 'TKT001',
        subject: 'Order not received',
        status: 'open',
        createdAt: '2024-04-15',
        messages: 5
      },
      {
        id: 'TKT002',
        subject: 'Product quality issue',
        status: 'resolved',
        createdAt: '2024-04-10',
        messages: 8
      }
    ]
  });
});

// Change Password
app.post('/api/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const db = readDatabase();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedNewPassword;
    writeDatabase(db);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password: ' + error.message
    });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ============= AUTHENTICATION APIS =============

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const db = readDatabase();
    const user = db.sellers.find(s => s.email === email) || db.users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name || user.businessName,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Verify Token
app.get('/api/verify-token', authenticateToken, (req, res) => {
  const db = readDatabase();
  const user = db.users.find(u => u.id === req.user.id) || db.sellers.find(s => s.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name || user.businessName,
      email: user.email,
      role: user.role
    }
  });
});

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const db = readDatabase();
    const user = db.users.find(u => u.email === email) || db.sellers.find(s => s.email === email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedTempPassword = await hashPassword(tempPassword);

    // Update user password
    if (db.users.find(u => u.email === email)) {
      const userIndex = db.users.findIndex(u => u.email === email);
      db.users[userIndex].password = hashedTempPassword;
    } else {
      const sellerIndex = db.sellers.findIndex(s => s.email === email);
      db.sellers[sellerIndex].password = hashedTempPassword;
    }
    writeDatabase(db);

    // Send email with temp password
    const tempPasswordEmail = getTempPasswordTemplate(tempPassword);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'IIMSTC - Password Reset',
      html: tempPasswordEmail
    });

    res.json({
      success: true,
      message: 'Temporary password sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Change Password
app.post('/api/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const db = readDatabase();
    const user = db.users.find(u => u.id === userId) || db.sellers.find(s => s.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    if (db.users.find(u => u.id === userId)) {
      const userIndex = db.users.findIndex(u => u.id === userId);
      db.users[userIndex].password = hashedNewPassword;
    } else {
      const sellerIndex = db.sellers.findIndex(s => s.id === userId);
      db.sellers[sellerIndex].password = hashedNewPassword;
    }
    writeDatabase(db);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// ============= ADMIN PANEL APIS =============

// Get Admin Dashboard Stats
app.get('/api/admin/dashboard-stats', (req, res) => {
  const db = readDatabase();
  const stats = {
    totalUsers: db.users.length,
    totalSellers: db.sellers.filter(s => s.status === 'approved').length,
    pendingSellers: db.sellers.filter(s => s.status === 'pending').length,
    totalProducts: db.products.length,
    totalOrders: db.orders.length,
    totalCoupons: db.coupons.length,
    totalRevenue: 875000
  };

  res.json({
    success: true,
    stats
  });
});

// Get Pending Sellers
app.get('/api/admin/sellers-pending', (req, res) => {
  const db = readDatabase();
  const pendingSellers = db.sellers.filter(s => s.status === 'pending');

  res.json({
    success: true,
    sellers: pendingSellers
  });
});

// Approve/Reject Seller
app.post('/api/admin/seller-action', (req, res) => {
  const { sellerId, action } = req.body;

  if (!sellerId || !action) {
    return res.status(400).json({
      success: false,
      message: 'Seller ID and action are required'
    });
  }

  const db = readDatabase();
  const sellerIndex = db.sellers.findIndex(s => s.id === sellerId);

  if (sellerIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Seller not found'
    });
  }

  db.sellers[sellerIndex].status = action === 'approve' ? 'approved' : 'rejected';
  writeDatabase(db);

  const message = action === 'approve' 
    ? 'Seller approved successfully'
    : 'Seller rejected';

  res.json({
    success: true,
    message: message,
    data: { sellerId, action }
  });
});

// Get All Users
app.get('/api/admin/users', (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    users: db.users
  });
});

// Get All Sellers
app.get('/api/admin/sellers', (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    sellers: db.sellers
  });
});

// Get All Orders
app.get('/api/admin/orders', (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    orders: db.orders
  });
});

// ============= COUPON MANAGEMENT APIS =============

// Get All Coupons
app.get('/api/admin/coupons', (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    coupons: db.coupons
  });
});

// Create Coupon
app.post('/api/admin/coupons', (req, res) => {
  const { code, discountType, discountValue, expiryDate, description } = req.body;

  if (!code || !discountType || !discountValue) {
    return res.status(400).json({
      success: false,
      message: 'Code, discount type, and discount value are required'
    });
  }

  const db = readDatabase();
  
  // Check if coupon code already exists
  const existingCoupon = db.coupons.find(c => c.code === code);
  if (existingCoupon) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code already exists'
    });
  }

  const coupon = {
    id: Date.now().toString(),
    code,
    discountType,
    discountValue: parseFloat(discountValue),
    expiryDate,
    description,
    createdAt: new Date().toISOString(),
    usedCount: 0
  };

  db.coupons.push(coupon);
  writeDatabase(db);

  res.json({
    success: true,
    message: 'Coupon created successfully',
    coupon
  });
});

// Delete Coupon
app.delete('/api/admin/coupons/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  
  const couponIndex = db.coupons.findIndex(c => c.id === id);
  if (couponIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found'
    });
  }

  db.coupons.splice(couponIndex, 1);
  writeDatabase(db);

  res.json({
    success: true,
    message: 'Coupon deleted successfully'
  });
});

// ============= SELLER DASHBOARD APIS =============

// Get Seller Products
app.get('/api/seller/products', authenticateToken, (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const db = readDatabase();
  const products = db.products.filter(p => p.sellerId === req.user.id);

  res.json({
    success: true,
    products
  });
});

// Add Product
app.post('/api/seller/products', authenticateToken, (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const { name, description, price, stock, category, images } = req.body;

  if (!name || !price || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Name, price, and stock are required'
    });
  }

  const db = readDatabase();
  const product = {
    id: Date.now().toString(),
    sellerId: req.user.id,
    name,
    description,
    price: parseFloat(price),
    stock: parseInt(stock),
    category,
    images: images || [],
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.products.push(product);
  writeDatabase(db);

  res.json({
    success: true,
    message: 'Product added successfully',
    product
  });
});

// Update Product
app.put('/api/seller/products/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const { id } = req.params;
  const updates = req.body;

  const db = readDatabase();
  const productIndex = db.products.findIndex(p => p.id === id && p.sellerId === req.user.id);

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const allowedUpdates = ['name', 'description', 'price', 'stock', 'category', 'images'];
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      if (field === 'price') {
        db.products[productIndex][field] = parseFloat(updates[field]);
      } else if (field === 'stock') {
        db.products[productIndex][field] = parseInt(updates[field]);
      } else {
        db.products[productIndex][field] = updates[field];
      }
    }
  });

  writeDatabase(db);

  res.json({
    success: true,
    message: 'Product updated successfully',
    product: db.products[productIndex]
  });
});

// Delete Product
app.delete('/api/seller/products/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const { id } = req.params;
  const db = readDatabase();
  
  const productIndex = db.products.findIndex(p => p.id === id && p.sellerId === req.user.id);
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  db.products.splice(productIndex, 1);
  writeDatabase(db);

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// ============= COUPON VALIDATION APIS =============

// Validate Coupon
app.post('/api/validate-coupon', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code is required'
    });
  }

  const db = readDatabase();
  const coupon = db.coupons.find(c => c.code === code);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Invalid coupon code'
    });
  }

  // Check expiry
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Coupon has expired'
    });
  }

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description
    }
  });
});

// Apply Coupon
app.post('/api/apply-coupon', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code is required'
    });
  }

  const db = readDatabase();
  const couponIndex = db.coupons.findIndex(c => c.code === code);

  if (couponIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Invalid coupon code'
    });
  }

  db.coupons[couponIndex].usedCount += 1;
  writeDatabase(db);

  res.json({
    success: true,
    message: 'Coupon applied successfully'
  });
});

function getTempPasswordTemplate(tempPassword) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
            .container { max-width: 500px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .password-box { background: #f0f4ff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .password-code { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
            .warning { font-size: 12px; color: #999; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>IIMSTC - Password Reset</h2>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>You have requested a password reset. Use the temporary password below to login:</p>
                <div class="password-box">
                    <div class="password-code">${tempPassword}</div>
                </div>
                <p>Please change your password immediately after logging in for security.</p>
                <p class="warning">⚠️ This temporary password will expire. Please use it to login and set a new password.</p>
            </div>
            <div class="footer">
                <p>If you didn't request this, please ignore this email.</p>
                <p>&copy; 2024 IIMSTC. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Email Service: ${process.env.EMAIL_SERVICE}`);
});

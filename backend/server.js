// Unified Node.js Backend for VIVID - Main app + Auth + Admin + E-commerce
// Proxies seller ML APIs to Python FastAPI at http://localhost:8000

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
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SELLER_API_URL = 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads from seller-api (proxy)
app.use('/static/uploads', createProxyMiddleware({
  target: SELLER_API_URL,
  changeOrigin: true,
  pathRewrite: {'^/static': '/static'}
}));

// Proxy ML and seller APIs to Python FastAPI
app.use('/api/seller', createProxyMiddleware({
  target: SELLER_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/seller': '/api'  // /api/seller/products -> /api/products
  }
}));

// Database file path (shared with proxy)
const DB_PATH = path.join(__dirname, '../database.json');

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
  console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. OTP emails will fail.');
}

const transporter = nodemailer.createTransporter({
  service: emailService,
  auth: { user: emailUser, pass: emailPass },
  tls: { rejectUnauthorized: false }
});

transporter.verify().then(() => {
  console.log('✅ Email service ready');
}).catch(err => console.warn('⚠️ Email service failed:', err.message));

// ===== UTILITY FUNCTIONS =====
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateTempPassword = () => crypto.randomBytes(8).toString('hex');
const hashPassword = async (password) => await bcrypt.hash(password, 10);
const verifyPassword = async (password, hash) => await bcrypt.compare(password, hash);
const generateToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
const verifyToken = (token) => {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token required' });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(403).json({ success: false, message: 'Invalid token' });
  req.user = decoded;
  next();
};

// ===== OTP & AUTH APIS =====
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, userType = 'user' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const otp = generateOTP();
    const db = readDatabase();
    db.otpStore[email] = { otp, expiresAt: Date.now() + 5*60*1000, userType };
    writeDatabase(db);

    const subject = userType === 'seller' ? 'Seller OTP - VIVID' : 'Verification OTP - VIVID';
    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject,
      html: getEmailTemplate(otp, userType)
    });

    res.json({ success: true, message: 'OTP sent', email });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const db = readDatabase();
  const stored = db.otpStore[email];
  
  if (!stored || Date.now() > stored.expiresAt || stored.otp !== otp) {
    delete db.otpStore[email];
    writeDatabase(db);
    return res.status(400).json({ success: false, message: 'Invalid/expired OTP' });
  }

  delete db.otpStore[email];
  writeDatabase(db);
  res.json({ success: true, message: 'OTP verified' });
});

app.post('/api/register', async (req, res) => {
  const { email, name, password, phone, type = 'user' } = req.body;
  const db = readDatabase();
  
  if ((type === 'user' && db.users.find(u => u.email === email)) || 
      (type === 'seller' && db.sellers.find(s => s.email === email))) {
    return res.status(400).json({ success: false, message: 'User exists' });
  }

  const hashedPassword = await hashPassword(password);
  const user = {
    id: Date.now().toString(),
    email, name: type === 'seller' ? req.body.businessName : name,
    password: hashedPassword,
    phone, type, role: type,
    status: type === 'seller' ? 'approved' : 'active',
    createdAt: new Date().toISOString()
  };

  if (type === 'user') db.users.push(user);
  else db.sellers.push(user);
  writeDatabase(db);

  const token = generateToken(user);
  res.json({ success: true, user: { id: user.id, email, role: user.role }, token });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const db = readDatabase();
  const user = db.sellers.find(s => s.email === email) || db.users.find(u => u.email === email);
  
  if (!user || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({ success: true, user: { id: user.id, name: user.name || user.businessName, email, role: user.role }, token });
});

// ===== PRODUCTS (Node + Proxy to Python ML) =====
app.get('/api/products', (req, res) => {
  const db = readDatabase();
  res.json({ success: true, products: db.products });
});

app.post('/api/products', authenticateToken, (req, res) => {
  // First call Python ML to enhance product (description)
  // Then save to Node DB
  // For now, save directly to Node DB
  const { name, description, price, stock, category, images } = req.body;
  const db = readDatabase();
  const product = {
    id: Date.now().toString(),
    sellerId: req.user.id,
    name, description, price: parseFloat(price), stock: parseInt(stock),
    category, images: images || [], status: 'approved',
    createdAt: new Date().toISOString()
  };
  db.products.push(product);
  writeDatabase(db);
  res.json({ success: true, product });
});

app.get('/api/seller/products', authenticateToken, (req, res) => {
  const db = readDatabase();
  const products = db.products.filter(p => p.sellerId === req.user.id);
  res.json({ success: true, products });
});

// ===== ADMIN APIS =====
app.get('/api/admin/stats', (req, res) => {
  const db = readDatabase();
  res.json({ success: true, stats: {
    users: db.users.length,
    sellers: db.sellers.length,
    products: db.products.length,
    orders: db.orders.length
  }});
});

app.get('/api/health', (req, res) => res.json({ status: 'OK', node: true, sellerApi: 'proxy-ready' }));

// Email templates (shortened)
function getEmailTemplate(otp, userType) {
  return `<div style="font-family:Arial,sans-serif">
    <h2>VIVID ${userType === 'seller' ? 'Seller' : ''} OTP</h2>
    <div style="background:#e3f2fd;padding:20px;border-radius:8px;text-align:center">
      <h1 style="color:#1976d2;font-size:48px">${otp}</h1>
      <p>Valid for 5 minutes</p>
    </div>
  </div>`;
}

app.listen(PORT, () => {
  console.log(`🚀 Node Backend: http://localhost:${PORT}`);
  console.log(`🔗 Seller/ML API proxy: http://localhost:${PORT}/api/seller -> Python:8000`);
  console.log(`📁 DB: database.json`);
});


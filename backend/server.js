// Unified Node.js backend for VIVID seller, auth, products, and lightweight AI helpers.

import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve('../.env') });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_PATH = path.join(__dirname, '../database.json');
const UPLOAD_DIR = path.join(__dirname, '../seller-api/static/uploads');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));
app.use('/static/uploads', express.static(UPLOAD_DIR));

const emptyDatabase = () => ({
  users: [],
  sellers: [],
  products: [],
  orders: [],
  coupons: [],
  supportTickets: [],
  otpStore: {}
});

const normalizeDatabase = (db) => ({ ...emptyDatabase(), ...db, otpStore: db.otpStore || {} });

const readDatabase = () => {
  try {
    return normalizeDatabase(JSON.parse(fs.readFileSync(DB_PATH, 'utf8')));
  } catch (error) {
    console.error('Error reading database:', error.message);
    return emptyDatabase();
  }
};

const writeDatabase = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(normalizeDatabase(data), null, 2));
};

const emailService = process.env.EMAIL_SERVICE || 'gmail';
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailConfigured = emailUser && emailPass && !emailUser.includes('your-email') && !emailPass.includes('your-app-password');

const transporter = emailConfigured
  ? nodemailer.createTransport({
      service: emailService,
      auth: { user: emailUser, pass: emailPass },
      tls: { rejectUnauthorized: false }
    })
  : null;

if (!emailConfigured) {
  console.warn('Email is not configured. OTP endpoints will run in local-dev mode.');
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashPassword = (password) => bcrypt.hash(password, 10);
const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(403).json({ success: false, message: 'Invalid token' });

  req.user = decoded;
  next();
};

const publicProduct = (product) => ({
  ...product,
  title: product.title || product.name,
  image: product.image || product.image_url || product.images?.[0] || '/images/1.png',
  artisan: product.artisan || product.sellerName || 'VIVID Seller',
  location: product.location || 'India'
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', node: true, sellerModule: 'integrated' });
});

app.post('/api/send-otp', async (req, res) => {
  const { email, userType = 'user' } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const otp = generateOTP();
  const db = readDatabase();
  db.otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000, userType };
  writeDatabase(db);

  if (transporter) {
    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: userType === 'seller' ? 'Seller OTP - VIVID' : 'Verification OTP - VIVID',
      html: getEmailTemplate(otp, userType)
    });
  }

  res.json({
    success: true,
    message: transporter ? 'OTP sent' : 'OTP generated in local-dev mode',
    email,
    ...(transporter ? {} : { devOtp: otp })
  });
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const db = readDatabase();
  const stored = db.otpStore[email];

  if (!stored || Date.now() > stored.expiresAt || stored.otp !== otp) {
    delete db.otpStore[email];
    writeDatabase(db);
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  delete db.otpStore[email];
  writeDatabase(db);
  res.json({ success: true, message: 'OTP verified' });
});

app.post('/api/complete-seller-registration', async (req, res) => {
  const { businessName, businessType = 'crafts', email, password, phone, address } = req.body;
  if (!businessName || !email || !password) {
    return res.status(400).json({ success: false, message: 'Business name, email, and password are required' });
  }

  const db = readDatabase();
  if (db.sellers.some((seller) => seller.email === email)) {
    return res.status(400).json({ success: false, message: 'Seller already exists' });
  }

  const seller = {
    id: Date.now().toString(),
    businessName,
    name: businessName,
    businessType,
    email,
    password: await hashPassword(password),
    phone,
    address,
    role: 'seller',
    status: 'approved',
    products: [],
    createdAt: new Date().toISOString()
  };

  db.sellers.push(seller);
  writeDatabase(db);

  const token = generateToken(seller);
  res.json({
    success: true,
    message: 'Seller account created successfully',
    seller: { id: seller.id, businessName, email, status: seller.status },
    data: { id: seller.id, businessName, email, status: seller.status },
    token
  });
});

app.post('/api/register', async (req, res) => {
  const { email, name, password, phone, type = 'user' } = req.body;
  const db = readDatabase();

  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
  if ((type === 'user' && db.users.some((user) => user.email === email)) ||
      (type === 'seller' && db.sellers.some((seller) => seller.email === email))) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = {
    id: Date.now().toString(),
    email,
    name: type === 'seller' ? req.body.businessName : name,
    businessName: req.body.businessName,
    password: await hashPassword(password),
    phone,
    role: type,
    status: type === 'seller' ? 'approved' : 'active',
    createdAt: new Date().toISOString()
  };

  if (type === 'seller') db.sellers.push(user);
  else db.users.push(user);
  writeDatabase(db);

  const token = generateToken(user);
  res.json({ success: true, user: { id: user.id, name: user.name, email, role: user.role }, token });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const db = readDatabase();
  const user = db.sellers.find((seller) => seller.email === email) || db.users.find((buyer) => buyer.email === email);

  if (!user || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: 'Login successful',
    user: { id: user.id, name: user.name || user.businessName, email: user.email, role: user.role },
    token
  });
});

app.get('/api/verify-token', authenticateToken, (req, res) => {
  const db = readDatabase();
  const user = db.users.find((buyer) => buyer.id === req.user.id) || db.sellers.find((seller) => seller.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.json({
    success: true,
    user: { id: user.id, name: user.name || user.businessName, email: user.email, role: user.role }
  });
});

app.get('/api/products', (req, res) => {
  const db = readDatabase();
  res.json({ success: true, products: db.products.map(publicProduct) });
});

app.get('/api/products/:id', (req, res) => {
  const db = readDatabase();
  const product = db.products.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product: publicProduct(product) });
});

app.get('/api/seller/products', authenticateToken, (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ success: false, message: 'Access denied' });

  const db = readDatabase();
  const products = db.products.filter((product) => product.sellerId === req.user.id).map(publicProduct);
  res.json({ success: true, products });
});

app.post('/api/seller/products', authenticateToken, (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ success: false, message: 'Access denied' });

  const { name, description = '', price, stock = 0, category = '', image_url, images } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Name and price are required' });
  }

  const db = readDatabase();
  const seller = db.sellers.find((item) => item.id === req.user.id);
  const product = {
    id: Date.now().toString(),
    sellerId: req.user.id,
    sellerName: seller?.businessName || seller?.name || 'VIVID Seller',
    name,
    title: name,
    description,
    price: Number.parseFloat(price),
    stock: Number.parseInt(stock, 10),
    category,
    image_url: image_url || images?.[0] || '',
    images: Array.isArray(images) ? images : image_url ? [image_url] : [],
    status: 'approved',
    createdAt: new Date().toISOString()
  };

  db.products.push(product);
  writeDatabase(db);
  res.json({ success: true, message: 'Product added successfully', product: publicProduct(product) });
});

app.delete('/api/seller/products/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ success: false, message: 'Access denied' });

  const db = readDatabase();
  const index = db.products.findIndex((product) => product.id === req.params.id && product.sellerId === req.user.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  db.products.splice(index, 1);
  writeDatabase(db);
  res.json({ success: true, message: 'Product deleted successfully' });
});

app.post('/api/seller/upload-image', async (req, res) => {
  try {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary="([^"]+)"/);
    const boundary = boundaryMatch ? boundaryMatch[1] : contentType.match(/boundary=(.+)$/)?.[1];
    if (!boundary) return res.status(400).json({ success: false, message: 'Multipart boundary missing' });

    const body = await readRequestBuffer(req);
    const file = extractMultipartFile(body, boundary);
    if (!file) return res.status(400).json({ success: false, message: 'Image file missing' });
    if (!file.contentType.startsWith('image/')) return res.status(400).json({ success: false, message: 'Invalid image type' });

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const extension = path.extname(file.filename) || imageExtension(file.contentType);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, safeName), file.data);

    res.json({ success: true, image_url: `/static/uploads/${safeName}` });
  } catch (error) {
    console.error('Image upload failed:', error);
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
});

app.post('/api/seller/ml/generate-desc', (req, res) => {
  const { name = 'Product', category = 'craft', price = '' } = req.body;
  res.json({
    description: `Premium ${category}: ${name}${price ? ` - INR ${price}` : ''}. Handcrafted with care and ready for the marketplace.`
  });
});

app.post('/api/seller/ml/translate', (req, res) => {
  res.json({ translated: req.body.text || '' });
});

app.post('/api/seller/ml/stt', (req, res) => {
  res.json({ text: 'Handcrafted product description from voice input.' });
});

app.get('/api/admin/stats', (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    stats: {
      users: db.users.length,
      sellers: db.sellers.length,
      products: db.products.length,
      orders: db.orders.length
    }
  });
});

function getEmailTemplate(otp, userType) {
  return `<div style="font-family:Arial,sans-serif">
    <h2>VIVID ${userType === 'seller' ? 'Seller' : ''} OTP</h2>
    <div style="background:#e3f2fd;padding:20px;border-radius:8px;text-align:center">
      <h1 style="color:#1976d2;font-size:48px">${otp}</h1>
      <p>Valid for 5 minutes</p>
    </div>
  </div>`;
}

function readRequestBuffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function extractMultipartFile(body, boundary) {
  const marker = Buffer.from(`--${boundary}`);
  let start = body.indexOf(marker);

  while (start !== -1) {
    const next = body.indexOf(marker, start + marker.length);
    if (next === -1) break;

    let part = body.subarray(start + marker.length, next);
    if (part.subarray(0, 2).toString() === '\r\n') part = part.subarray(2);
    if (part.subarray(part.length - 2).toString() === '\r\n') part = part.subarray(0, part.length - 2);

    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd !== -1) {
      const headers = part.subarray(0, headerEnd).toString('latin1');
      const data = part.subarray(headerEnd + 4);
      const filename = headers.match(/filename="([^"]+)"/)?.[1];
      const contentType = headers.match(/Content-Type:\s*([^\r\n]+)/i)?.[1] || 'application/octet-stream';
      if (filename) return { filename, contentType, data };
    }

    start = next;
  }

  return null;
}

function imageExtension(contentType) {
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('gif')) return '.gif';
  return '.jpg';
}

app.listen(PORT, () => {
  console.log(`VIVID backend: http://localhost:${PORT}`);
  console.log(`Database: ${DB_PATH}`);
});

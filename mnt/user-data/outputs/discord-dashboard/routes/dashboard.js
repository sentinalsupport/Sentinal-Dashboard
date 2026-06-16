require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 10000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── SIMPLEST SESSION ─────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-secret-key',
    resave: false,
    saveUninitialized: true,  // ← Changed to true
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

// ─── DEBUGGING ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log('🍪 Cookie:', req.headers.cookie || 'None');
  console.log('📦 Session ID:', req.session?.id || 'None');
  console.log('👤 User:', req.session?.user?.username || 'None');
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found.',
    user: req.session?.user || null,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).render('error', {
    message: err.message || 'Something went wrong.',
    user: req.session?.user || null,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Dashboard running on port ${PORT}`);
});

module.exports = app;

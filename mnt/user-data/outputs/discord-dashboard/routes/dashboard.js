require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 10000;

// ─── MongoDB Connection ──────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── View Engine ──────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Body Parsing ──────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Cookie Debugging ─────────────────────────────────────────────
app.use((req, res, next) => {
  console.log('🍪 Cookies header:', req.headers.cookie || 'None');
  next();
});

// ─── Session Middleware ────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here-change-this',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native',
    }),
    cookie: {
      secure: false,  // ← TEMPORARILY DISABLED FOR DEBUGGING
      httpOnly: false, // ← TEMPORARILY DISABLED FOR DEBUGGING
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'lax',
    },
  })
);

// ─── Session Debugging ────────────────────────────────────────────
app.use((req, res, next) => {
  console.log('📦 Session ID:', req.session?.id || 'None');
  console.log('👤 User in session:', req.session?.user?.username || 'None');
  next();
});

// ─── Routes ──────────────────────────────────────────────────────
app.use('/', authRoutes);
app.use('/', dashboardRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found.',
    user: req.session?.user || null,
  });
});

// ─── Error Handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).render('error', {
    message: err.message || 'Something went wrong.',
    user: req.session?.user || null,
  });
});

// ─── Start Server ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Dashboard running on port ${PORT}`);
});

module.exports = app;

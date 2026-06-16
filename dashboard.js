// FILE: dashboard.js (ROOT folder - MAIN SERVER)
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60,
  }),
  cookie: {
    name: 'sentinal.sid',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  },
}));

// Debugging
app.use((req, res, next) => {
  console.log('🍪 Cookie:', req.headers.cookie || 'None');
  console.log('📦 Session ID:', req.session?.id || 'None');
  console.log('👤 User:', req.session?.user?.username || 'None');
  next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/dashboard'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found.',
    user: req.session?.user || null,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    message: err.message || 'Something went wrong.',
    user: req.session?.user || null,
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Dashboard running on port ${PORT}`);
});

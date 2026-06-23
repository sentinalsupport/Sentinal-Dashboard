require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// ============ CONFIGURATION ============
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sentinel';

// ============ MIDDLEWARE ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration (production ready)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// ============ VIEW ENGINE ============
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============ DATABASE CONNECTION ============
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ============ ROUTES ============
app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);

// ============ HOME ROUTE ============
app.get('/', (req, res) => {
    res.render('index', { 
        user: req.session.user || null,
        title: 'Sentinel Dashboard'
    });
});

// ============ ERROR HANDLING ============
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Page not found',
        title: '404 - Not Found'
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        title: '500 - Server Error'
    });
});

// ============ START SERVER ============
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Sentinel Dashboard running on port ${PORT}`);
    console.log(`🔗 Access at: http://localhost:${PORT}`);
});

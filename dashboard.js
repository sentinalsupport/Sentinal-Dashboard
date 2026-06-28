require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// ============ CONFIGURATION ============
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/sentinal';

// ============ MIDDLEWARE ============
app.use(cors({
    origin: process.env.DOMAIN || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ============ SESSION CONFIGURATION ============
app.use(session({
    secret: process.env.SESSION_SECRET || 'random_secret_string_here_12345',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax'
    }
}));

// Make user available to all views
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    res.locals.isAuthenticated = !!req.session?.user;
    next();
});

// ============ VIEW ENGINE ============
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============ DATABASE CONNECTION ============
console.log('🔌 Connecting to MongoDB...');
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Continuing without database...');
});

// ============ ROUTES ============
console.log('📂 Loading routes...');

// Auth Routes
try {
    app.use('/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (err) {
    console.error('❌ Error loading auth routes:', err.message);
}

// Dashboard Routes
try {
    app.use('/', dashboardRoutes);
    console.log('✅ Dashboard routes loaded');
} catch (err) {
    console.error('❌ Error loading dashboard routes:', err.message);
}

// ============ HOME ROUTE ============
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/servers');
    }
    res.render('index', {
        title: 'Sentinal — Discord Bot Dashboard',
        user: req.session?.user || null,
        isAuthenticated: false
    });
});

// ============ LOGIN ROUTE ============
app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/servers');
    }
    res.render('login', {
        title: 'Login — Sentinal',
        user: null,
        isAuthenticated: false
    });
});

// ============ LOGOUT ============
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// ============ TEST ROUTE ============
app.get('/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

// ============ ERROR HANDLING ============
app.use((req, res) => {
    console.log('❌ 404 Not Found:', req.url);
    res.status(404).render('error', {
        message: 'Page not found',
        title: '404 - Not Found',
        user: req.session?.user || null
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Something went wrong! Please try again later.',
        title: '500 - Server Error',
        user: req.session?.user || null
    });
});

// ============ START SERVER ============
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Sentinal Dashboard running on port ${PORT}`);
    console.log(`🔗 Access at: http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Views directory: ${path.join(__dirname, 'views')}`);
    console.log(`📁 Routes directory: ${path.join(__dirname, 'routes')}`);
    console.log('\n✅ Available routes:');
    console.log('   - GET  /');
    console.log('   - GET  /login');
    console.log('   - GET  /logout');
    console.log('   - GET  /test');
    console.log('   - GET  /servers');
    console.log('   - GET  /dashboard');
    console.log('   - GET  /servers/:guildId');
    console.log('   - GET  /servers/:guildId/applications');
    console.log('   - GET  /servers/:guildId/tickets');
    console.log('   - GET  /servers/:guildId/panels');
    console.log('   - POST /api/*\n');
});

module.exports = app;

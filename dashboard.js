require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');

// Import routes
const { router: authRoutes } = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// ============ CONFIGURATION ============
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sentinal';

// ============ MIDDLEWARE ============
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
        touchAfter: 24 * 3600
    }),
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'lax'
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
        title: 'Sentinal Dashboard',
        user: req.session.user || null
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
    console.log(`✅ Sentinal Dashboard running on port ${PORT}`);
    console.log(`🔗 Access at: http://localhost:${PORT}`);
});

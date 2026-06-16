const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');

const app = express();

// ===== CONFIGURATION =====
const config = {
    clientID: '1493217033956102215', // Your Discord Client ID
    clientSecret: 'gZpMsdTlUpo1D0l9jlaynDq1s7oU2W15', // ⚠️ YOU NEED TO ADD THIS!
    callbackURL: 'https://sentinal-dashboard.onrender.com/auth/discord/callback',
    domain: 'https://sentinal-dashboard.onrender.com'
};

// ===== SESSION SETUP =====
app.use(session({
    secret: '{Secret}',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true, // Set to true since you're using HTTPS (Render)
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));

// ===== PASSPORT SETUP =====
app.use(passport.initialize());
app.use(passport.session());

// Serialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Discord Strategy
passport.use(new DiscordStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Make user available to all templates
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.isAuthenticated = req.isAuthenticated() || false;
    next();
});

// ===== VIEW ENGINE =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== AUTH ROUTES =====
// Login page
app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});

// Start Discord OAuth
app.get('/auth/discord', passport.authenticate('discord'));

// Discord OAuth callback
app.get('/auth/discord/callback', 
    passport.authenticate('discord', { 
        failureRedirect: '/login',
        successRedirect: '/dashboard'
    })
);

// Logout
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        req.session.destroy(() => {
            res.redirect('/login');
        });
    });
});

// ===== PROTECTED ROUTES =====
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Dashboard (protected)
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { 
        user: req.user,
        title: 'Dashboard',
        isAuthenticated: true
    });
});

// ===== HOME ROUTE =====
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// ===== ERROR HANDLING =====
// 404 Not Found
app.use((req, res, next) => {
    res.status(404).render('error', {
        code: 404,
        message: 'Page not found',
        error: 'The page you are looking for does not exist.'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).render('error', {
        code: err.status || 500,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : 'An unexpected error occurred.'
    });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on ${config.domain}`);
    console.log(`📝 Login page: ${config.domain}/login`);
    console.log(`📊 Dashboard: ${config.domain}/dashboard`);
    console.log(`🔗 OAuth Callback: ${config.callbackURL}`);
});

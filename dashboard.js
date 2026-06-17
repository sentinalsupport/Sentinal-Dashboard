const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// =============================================
// ====== CONFIGURATION (HARDCODED) ======
// =============================================

const config = {
    // Discord OAuth
    clientID: '1493217033956102215',
    clientSecret: 'FvVMn-t9cEXRaRYMzBlYwZLpaVpxLzoW',
    callbackURL: 'https://sentinal-dashboard.onrender.com/auth/discord/callback',
    domain: 'https://sentinal-dashboard.onrender.com',
    
    // MongoDB
    mongoURI: 'mongodb+srv://sentinalsupport_db_user:MySecurePassword123%21@cluster0.8nlf8kz.mongodb.net/dashboard',
    
    // Session
    sessionSecret: '8e5f6a7b8c9d0e1f2g3h4i5j6k7l8m9n',
};

// =============================================
// ====== MONGODB CONNECTION ======
// =============================================

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Continuing without MongoDB...');
});

// =============================================
// ====== GUILD CONFIG SCHEMA ======
// =============================================

const GuildConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    prefix: {
        type: String,
        default: '!',
    },
    modLogChannel: {
        type: String,
        default: null,
    },
    memberLogChannel: {
        type: String,
        default: null,
    },
    welcomeChannel: {
        type: String,
        default: null,
    },
    welcomeMessage: {
        type: String,
        default: 'Welcome {user} to {server}!',
    },
    autorole: {
        type: String,
        default: null,
    },
    mutedRole: {
        type: String,
        default: null,
    },
    verificationChannel: {
        type: String,
        default: null,
    },
    verificationRole: {
        type: String,
        default: null,
    },
    verificationEnabled: {
        type: Boolean,
        default: false,
    },
    ticketCategory: {
        type: String,
        default: null,
    },
    ticketSupportRole: {
        type: String,
        default: null,
    },
    applicationChannel: {
        type: String,
        default: null,
    },
    giveawayChannel: {
        type: String,
        default: null,
    },
    xpEnabled: {
        type: Boolean,
        default: true,
    },
    xpRate: {
        type: Number,
        default: 1.0,
    },
    premium: {
        type: Boolean,
        default: false,
    },
    premiumExpires: {
        type: Date,
        default: null,
    },
    enabledFeatures: {
        type: [String],
        default: ['applications', 'tickets', 'giveaways', 'verification'],
    },
    dashboardEnabled: {
        type: Boolean,
        default: true,
    },
    blacklisted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const GuildConfig = mongoose.model('GuildConfig', GuildConfigSchema);

// =============================================
// ====== SESSION SETUP ======
// =============================================

app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// =============================================
// ====== PASSPORT SETUP ======
// =============================================

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['identify', 'guilds', 'email']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// =============================================
// ====== MIDDLEWARE ======
// =============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Make user data available to all views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.isAuthenticated = req.isAuthenticated() || false;
    next();
});

// =============================================
// ====== VIEW ENGINE ======
// =============================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =============================================
// ====== AUTH ROUTES ======
// =============================================

// HOME
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// LOGIN PAGE
app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    res.render('login', { 
        title: 'Login - Sentinal',
        isAuthenticated: false 
    });
});

// START DISCORD OAUTH
app.get('/auth/discord', 
    passport.authenticate('discord', { 
        scope: ['identify', 'guilds', 'email'] 
    })
);

// DISCORD OAUTH CALLBACK
app.get('/auth/discord/callback', 
    passport.authenticate('discord', { 
        failureRedirect: '/login',
        successRedirect: '/dashboard'
    })
);

// LOGOUT
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

// =============================================
// ====== PROTECTED ROUTES ======
// =============================================

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// DASHBOARD
app.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        let configs = [];
        if (req.user && req.user.guilds) {
            const guildIds = req.user.guilds.map(g => g.id);
            configs = await GuildConfig.find({ guildId: { $in: guildIds } });
        }
        
        res.render('dashboard', { 
            user: req.user,
            title: 'Dashboard - Sentinal',
            isAuthenticated: true,
            configs: configs
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('dashboard', { 
            user: req.user,
            title: 'Dashboard - Sentinal',
            isAuthenticated: true,
            configs: []
        });
    }
});

// =============================================
// ====== API ROUTES ======
// =============================================

app.get('/api/config/:guildId', isAuthenticated, async (req, res) => {
    try {
        const config = await GuildConfig.findOne({ guildId: req.params.guildId });
        res.json(config || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/config/:guildId', isAuthenticated, async (req, res) => {
    try {
        const config = await GuildConfig.findOneAndUpdate(
            { guildId: req.params.guildId },
            req.body,
            { new: true, upsert: true }
        );
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =============================================
// ====== ERROR HANDLING ======
// =============================================

app.use((req, res, next) => {
    res.status(404).render('error', {
        code: 404,
        message: 'Page not found',
        error: 'The page you are looking for does not exist.',
        isAuthenticated: req.isAuthenticated() || false
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).render('error', {
        code: err.status || 500,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : 'An unexpected error occurred.',
        isAuthenticated: req.isAuthenticated() || false
    });
});

// =============================================
// ====== START SERVER ======
// =============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on ${config.domain}`);
    console.log(`📝 Login page: ${config.domain}/login`);
    console.log(`📊 Dashboard: ${config.domain}/dashboard`);
    console.log(`🔗 OAuth Callback: ${config.callbackURL}`);
    console.log(`\n✅ Make sure you have added this Redirect URL in Discord Dev Portal:`);
    console.log(`   ${config.callbackURL}`);
});

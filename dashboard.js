const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const mongoose = require('mongoose');

// Import the GuildConfig model from the models folder
const GuildConfig = require('./models/GuildConfig'); // ← ADD THIS

const app = express();

// ===== CONFIGURATION ======
const config = {
    clientID: '1493217033956102215',
    clientSecret: 'FvVMn-t9cEXRaRYMzBlYwZLpaVpxLzoW',
    callbackURL: 'https://sentinal-dashboard.onrender.com/auth/discord/callback',
    domain: 'https://sentinal-dashboard.onrender.com',
    mongoURI: 'mongodb+srv://sentinalsupport_db_user:MySecurePassword123%21@cluster0.8nlf8kz.mongodb.net/dashboard',
    sessionSecret: '8e5f6a7b8c9d0e1f2g3h4i5j6k7l8m9n',
};

// ===== MONGODB CONNECTION =====
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Continuing without MongoDB...');
});

// ===== REMOVE THIS SECTION - IT'S DUPLICATED IN models/GuildConfig.js =====
// DELETE THE ENTIRE GuildConfigSchema definition from dashboard.js
// It should be in models/GuildConfig.js only

// ===== SESSION SETUP =====
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// ... rest of your code stays the same

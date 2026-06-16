const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware: Check if logged in
function ensureAuth(req, res, next) {
    if (req.session.user) return next();
    console.log('❌ Not logged in, redirecting to /login');
    res.redirect('/login');
}

// Home - Redirect to servers if logged in
router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/servers');
    } else {
        res.render('login', { user: null });
    }
});

// List servers
router.get('/servers', ensureAuth, async (req, res) => {
    try {
        console.log('📋 Fetching servers for user:', req.session.user.username);
        
        const guilds = req.session.guilds || [];
        console.log('📋 Found', guilds.length, 'guilds');
        
        res.render('servers', { 
            user: req.session.user, 
            guilds: guilds 
        });
    } catch (err) {
        console.error('❌ Error fetching servers:', err);
        res.redirect('/login');
    }
});

// Server config page
router.get('/servers/:guildId', ensureAuth, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const guild = req.session.guilds?.find(g => g.id === guildId);
        
        if (!guild) {
            return res.redirect('/servers');
        }
        
        res.render('server', {
            user: req.session.user,
            guild: guild,
            config: {
                prefix: '!',
                welcomeChannel: '',
                welcomeMessage: '',
                logChannel: '',
                modLevel: 'off',
                autoMod: false,
                logJoinLeave: false,
                logMessageDelete: false
            }
        });
    } catch (err) {
        console.error(err);
        res.redirect('/servers');
    }
});

// Save config
router.post('/api/servers/:guildId/config', ensureAuth, async (req, res) => {
    res.json({ success: true, message: 'Settings saved!' });
});

// Get stats
router.get('/api/servers/:guildId/stats', ensureAuth, async (req, res) => {
    res.json({ success: true, stats: { memberCount: 0, botOnline: true } });
});

// Invite link
router.get('/invite', (req, res) => {
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
    res.redirect(inviteUrl);
});

module.exports = router;

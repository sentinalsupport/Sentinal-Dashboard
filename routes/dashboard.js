const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware: Check if logged in
function ensureAuth(req, res, next) {
    if (req.session.user) return next();
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
        const guildsRes = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${req.session.user.access_token}` }
        });
        
        const botGuildsRes = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
        });
        
        const botGuildIds = botGuildsRes.data.map(g => g.id);
        const adminGuilds = guildsRes.data.filter(g => 
            (g.permissions & 0x8) && botGuildIds.includes(g.id)
        );
        
        res.render('servers', { 
            user: req.session.user, 
            guilds: adminGuilds 
        });
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});

// Server config page
router.get('/servers/:guildId', ensureAuth, async (req, res) => {
    try {
        const guildRes = await axios.get(`https://discord.com/api/guilds/${req.params.guildId}`, {
            headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
        });
        
        res.render('server', {
            user: req.session.user,
            guild: guildRes.data,
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
    try {
        // TODO: Save to MongoDB using GuildConfig model
        res.json({ success: true, message: 'Settings saved!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to save settings' });
    }
});

// Get stats
router.get('/api/servers/:guildId/stats', ensureAuth, async (req, res) => {
    try {
        const guildRes = await axios.get(`https://discord.com/api/guilds/${req.params.guildId}`, {
            headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
        });
        
        res.json({
            success: true,
            stats: {
                memberCount: guildRes.data.approximate_member_count || 0,
                botOnline: true
            }
        });
    } catch (err) {
        res.json({ 
            success: false, 
            stats: { memberCount: 0, botOnline: false }
        });
    }
});

// Invite link
router.get('/invite', (req, res) => {
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
    res.redirect(inviteUrl);
});

module.exports = router;

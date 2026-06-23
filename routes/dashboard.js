const express = require('express');
const router = express.Router();  // ✅ CRITICAL FIX

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
}

// Dashboard home
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', {
        user: req.session.user,
        title: 'Dashboard'
    });
});

// Server settings page
router.get('/server/:id', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.id;
        const GuildConfig = require('../models/GuildConfig');
        const config = await GuildConfig.findOne({ guildId });
        
        // Fetch guild from Discord API
        const axios = require('axios');
        const response = await axios.get(`https://discord.com/api/guilds/${guildId}`, {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        const guild = response.data;
        
        res.render('server', {
            title: 'Server Settings — Sentinel',
            user: req.session.user,
            isAuthenticated: true,
            guild: {
                id: guild.id,
                name: guild.name,
                icon: guild.icon,
                memberCount: guild.approximate_member_count || 0,
                channelCount: guild.approximate_presence_count || 0
            },
            config: config || {}
        });
    } catch (error) {
        console.error('Error loading server settings:', error);
        res.status(500).render('error', {
            message: 'Failed to load server settings',
            title: 'Error'
        });
    }
});

// API endpoint to save settings
router.post('/api/config/:guildId', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const settings = req.body;
        
        const GuildConfig = require('../models/GuildConfig');
        await GuildConfig.findOneAndUpdate(
            { guildId },
            settings,
            { upsert: true, new: true }
        );
        
        res.json({ success: true, message: 'Settings saved' });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Servers list page
router.get('/servers', isAuthenticated, async (req, res) => {
    try {
        const axios = require('axios');
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        // Filter guilds where user has admin or manage server permissions
        const guilds = response.data.filter(g => 
            (g.permissions & 0x8) || // Administrator
            (g.permissions & 0x20)    // Manage Server
        );
        
        res.render('servers', {
            title: 'My Servers — Sentinel',
            user: req.session.user,
            guilds: guilds,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error fetching guilds:', error);
        res.status(500).render('error', {
            message: 'Failed to load servers',
            title: 'Error'
        });
    }
});

module.exports = router;  // ✅ CRITICAL - Export the router

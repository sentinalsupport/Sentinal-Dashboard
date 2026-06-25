const express = require('express');
const router = express.Router();
const axios = require('axios');

// ============ MIDDLEWARE ============
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    return res.redirect('/auth/login');
}

// ============ DASHBOARD HOME ============
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        const guilds = response.data.filter(g => 
            (g.permissions & 0x8) || (g.permissions & 0x20)
        );
        
        return res.render('dashboard', {
            title: 'Dashboard — Sentinal',
            user: req.session.user,
            servers: guilds,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error fetching guilds:', error);
        
        if (error.response?.status === 401) {
            req.session.destroy(() => {
                res.redirect('/auth/login?error=session_expired');
            });
            return;
        }
        
        return res.render('dashboard', {
            title: 'Dashboard — Sentinal',
            user: req.session.user,
            servers: [],
            isAuthenticated: true,
            error: 'Failed to load your servers. Please try again.'
        });
    }
});

// ============ SERVERS LIST ============
router.get('/servers', isAuthenticated, async (req, res) => {
    try {
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        const guilds = response.data.filter(g => 
            (g.permissions & 0x8) || (g.permissions & 0x20)
        );
        
        return res.render('servers', {
            title: 'My Servers — Sentinal',
            user: req.session.user,
            guilds: guilds,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error fetching guilds:', error);
        
        if (error.response?.status === 401) {
            req.session.destroy(() => {
                res.redirect('/auth/login?error=session_expired');
            });
            return;
        }
        
        return res.status(500).render('error', {
            message: 'Failed to load your servers. Please try again later.',
            title: 'Error'
        });
    }
});

// ============ SERVER SETTINGS ============
router.get('/server/:id', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.id;
        console.log('🔍 Loading server settings for guild:', guildId);
        
        // Try to load GuildConfig model
        let GuildConfig;
        try {
            GuildConfig = require('../models/GuildConfig');
        } catch (err) {
            console.warn('⚠️ GuildConfig model not found, creating fallback');
            GuildConfig = {
                findOne: async () => null,
                findOneAndUpdate: async () => ({})
            };
        }
        
        const config = await GuildConfig.findOne({ guildId }).catch(() => null);
        
        // ✅ Try to fetch guild details from Discord API
        let guild = null;
        let botInServer = false;
        const clientId = process.env.DISCORD_CLIENT_ID || '1493217033956102215';
        
        try {
            const response = await axios.get(`https://discord.com/api/guilds/${guildId}`, {
                headers: {
                    Authorization: `Bearer ${req.session.user.access_token}`
                }
            });
            guild = response.data;
            console.log('✅ Guild found:', guild.name);
            botInServer = true;
        } catch (apiError) {
            console.warn('⚠️ Could not fetch guild from Discord API:', apiError.message);
            
            // ✅ If API fails, still show the settings page with basic info
            guild = {
                id: guildId,
                name: 'Unknown Server',
                icon: null,
                approximate_member_count: 0,
                approximate_presence_count: 0
            };
            
            // ✅ Check if user has admin perms for this server
            try {
                const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
                    headers: {
                        Authorization: `Bearer ${req.session.user.access_token}`
                    }
                });
                const userGuild = guildsResponse.data.find(g => g.id === guildId);
                if (userGuild && (userGuild.permissions & 0x8)) {
                    botInServer = true;
                }
            } catch (guildsError) {
                console.warn('⚠️ Could not check user guilds:', guildsError.message);
            }
        }
        
        // Generate bot invite link
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands`;
        
        res.render('server', {
            title: 'Server Settings — Sentinal',
            user: req.session.user,
            isAuthenticated: true,
            guild: {
                id: guild.id,
                name: guild.name || 'Unknown Server',
                icon: guild.icon || null,
                memberCount: guild.approximate_member_count || 0,
                channelCount: guild.approximate_presence_count || 0
            },
            config: config || {},
            inviteLink: inviteLink,
            botInServer: botInServer
        });
        
    } catch (error) {
        console.error('❌ Error loading server settings:', error.message);
        
        // ✅ Even if there's an error, try to show the settings page
        const guildId = req.params.id;
        const clientId = process.env.DISCORD_CLIENT_ID || '1493217033956102215';
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands`;
        
        let config = null;
        try {
            const GuildConfig = require('../models/GuildConfig');
            config = await GuildConfig.findOne({ guildId }).catch(() => null);
        } catch (dbError) {
            console.warn('⚠️ Could not fetch config from DB:', dbError.message);
        }
        
        res.render('server', {
            title: 'Server Settings — Sentinal',
            user: req.session.user,
            isAuthenticated: true,
            guild: {
                id: guildId,
                name: 'Server',
                icon: null,
                memberCount: 0,
                channelCount: 0
            },
            config: config || {},
            inviteLink: inviteLink,
            botInServer: false,
            error: 'Could not fetch server details, but you can still configure settings.'
        });
    }
});

// ============ API: SAVE SETTINGS ============
router.post('/api/config/:guildId', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const settings = req.body;
        
        // Verify user has admin permissions
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        const userGuild = guildsResponse.data.find(g => g.id === guildId);
        
        if (!userGuild || !(userGuild.permissions & 0x8)) {
            return res.status(403).json({ 
                success: false, 
                error: 'You do not have administrator access to this server.' 
            });
        }
        
        let GuildConfig;
        try {
            GuildConfig = require('../models/GuildConfig');
        } catch (err) {
            return res.status(500).json({ 
                success: false, 
                error: 'GuildConfig model not found' 
            });
        }
        
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

module.exports = router;

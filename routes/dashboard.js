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

// ============ DASHBOARD HOME (Redirects to Servers) ============
router.get('/dashboard', isAuthenticated, (req, res) => {
    // ✅ Redirect to servers page instead of rendering dashboard
    return res.redirect('/servers');
});

// ============ SERVERS LIST ============
router.get('/servers', isAuthenticated, async (req, res) => {
    try {
        console.log('📋 Servers route accessed');
        console.log('👤 User:', req.session.user ? req.session.user.username : 'None');
        
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        const guilds = response.data.filter(g => 
            (g.permissions & 0x8) || (g.permissions & 0x20)
        );
        
        // ✅ Check bot membership using BOT TOKEN
        const botToken = process.env.DISCORD_TOKEN;
        const clientId = process.env.DISCORD_CLIENT_ID || '1493217033956102215';
        const guildsWithBotStatus = [];
        
        console.log('🔍 Bot token exists:', botToken ? 'YES' : 'NO');
        console.log('🔍 Client ID:', clientId);
        
        for (const guild of guilds) {
            let botInServer = false;
            
            console.log(`🔍 Checking ${guild.name} (${guild.id})...`);
            
            if (botToken) {
                try {
                    await axios.get(`https://discord.com/api/guilds/${guild.id}/members/${clientId}`, {
                        headers: {
                            Authorization: `Bot ${botToken}`
                        }
                    });
                    botInServer = true;
                    console.log(`✅ Bot IS in ${guild.name}`);
                } catch (botError) {
                    if (botError.response?.status === 404) {
                        console.log(`❌ Bot is NOT in ${guild.name} (404)`);
                    } else {
                        console.log(`⚠️ Error checking ${guild.name}:`, botError.response?.status || botError.message);
                    }
                    botInServer = false;
                }
            } else {
                console.log('⚠️ No DISCORD_TOKEN found in environment!');
                botInServer = false;
            }
            
            guildsWithBotStatus.push({
                id: guild.id,
                name: guild.name,
                icon: guild.icon,
                permissions: guild.permissions,
                approximate_member_count: guild.approximate_member_count || 0,
                approximate_presence_count: guild.approximate_presence_count || 0,
                botInServer: botInServer
            });
        }
        
        return res.render('servers', {
            title: 'My Servers — Sentinal',
            user: req.session.user,
            guilds: guildsWithBotStatus,
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
        
        // Check token expiry
        const tokenExpires = req.session.user.token_expires || 0;
        const now = Date.now();
        
        if (now > tokenExpires) {
            console.log('🔄 Token expired, redirecting to login');
            req.session.destroy(() => {
                res.redirect('/auth/login?error=session_expired');
            });
            return;
        }
        
        let GuildConfig;
        try {
            GuildConfig = require('../models/GuildConfig');
        } catch (err) {
            console.warn('⚠️ GuildConfig model not found');
            GuildConfig = {
                findOne: async () => null,
                findOneAndUpdate: async () => ({})
            };
        }
        
        const config = await GuildConfig.findOne({ guildId }).catch(() => null);
        
        // Get guild from user's guild list
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0,
            approximate_presence_count: 0
        };
        let botInServer = false;
        const clientId = process.env.DISCORD_CLIENT_ID || '1493217033956102215';
        const botToken = process.env.DISCORD_TOKEN;
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands&guild_id=${guildId}`;
        
        // Get guild from user list
        try {
            const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
                headers: {
                    Authorization: `Bearer ${req.session.user.access_token}`
                }
            });
            
            const userGuild = guildsResponse.data.find(g => g.id === guildId);
            if (userGuild) {
                guildData = {
                    id: userGuild.id,
                    name: userGuild.name || 'Server',
                    icon: userGuild.icon || null,
                    approximate_member_count: userGuild.approximate_member_count || 0,
                    approximate_presence_count: userGuild.approximate_presence_count || 0
                };
                console.log('✅ Guild found:', guildData.name);
            }
        } catch (guildsError) {
            console.warn('⚠️ Could not get guild from user list:', guildsError.message);
        }
        
        // Check bot membership
        if (botToken) {
            try {
                await axios.get(`https://discord.com/api/guilds/${guildId}/members/${clientId}`, {
                    headers: {
                        Authorization: `Bot ${botToken}`
                    }
                });
                botInServer = true;
                console.log('✅ Bot is in this server');
            } catch (botError) {
                if (botError.response?.status === 404) {
                    console.log('❌ Bot is NOT in this server');
                    botInServer = false;
                } else {
                    console.log('⚠️ Could not verify bot membership:', botError.message);
                    botInServer = false;
                }
            }
        } else {
            console.log('⚠️ No DISCORD_TOKEN found');
            botInServer = false;
        }
        
        return res.render('server', {
            title: 'Server Settings — Sentinal',
            user: req.session.user,
            isAuthenticated: true,
            guild: guildData,
            config: config || {},
            inviteLink: inviteLink,
            botInServer: botInServer
        });
        
    } catch (error) {
        console.error('❌ Error loading server settings:', error.message);
        
        if (error.response?.status === 401) {
            console.log('🔄 Token invalid, redirecting to login');
            req.session.destroy(() => {
                res.redirect('/auth/login?error=session_expired');
            });
            return;
        }
        
        res.status(500).render('error', {
            message: 'Failed to load server settings. Please try again later.',
            title: 'Error'
        });
    }
});

// ============ APPLICATIONS PAGE ============
router.get('/applications', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.query.guildId;
        console.log('📋 Loading applications for guild:', guildId);
        
        let GuildConfig;
        try {
            GuildConfig = require('../models/GuildConfig');
        } catch (err) {
            GuildConfig = { findOne: async () => null };
        }
        
        const config = await GuildConfig.findOne({ guildId }).catch(() => null);
        
        res.render('applications', {
            title: 'Applications — Sentinal',
            user: req.session.user,
            guild: { id: guildId || 'unknown' },
            config: config || {}
        });
    } catch (error) {
        console.error('Error loading applications:', error);
        res.status(500).render('error', {
            message: 'Failed to load applications',
            title: 'Error'
        });
    }
});

// ============ API: SAVE SETTINGS ============
router.post('/api/config/:guildId', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const settings = req.body;
        
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

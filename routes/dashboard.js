const express = require('express');
const router = express.Router();
const axios = require('axios');

// ============ IMPORT REFRESH FUNCTION ============
const { refreshAccessToken } = require('./auth');

// ============ MIDDLEWARE ============
function isAuthenticated(req, res, next) {
    console.log('🔍 isAuthenticated called');
    console.log('📝 Session ID:', req.session.id);
    console.log('👤 Session user:', req.session.user ? req.session.user.username : 'None');
    
    if (req.session.user) {
        console.log('✅ User authenticated, proceeding');
        return next();
    }
    console.log('❌ No session, redirecting to login');
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
        console.log('📋 Loading servers list...');
        
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        // Filter guilds where user has admin or manage server permissions
        const guilds = response.data.filter(g => 
            (g.permissions & 0x8) || (g.permissions & 0x20)
        );
        
        // ✅ Check bot membership for each guild using bot token
        const botToken = process.env.DISCORD_TOKEN;
        const clientId = process.env.DISCORD_CLIENT_ID || '1493217033956102215';
        const guildsWithBotStatus = [];
        
        for (const guild of guilds) {
            let botInServer = false;
            
            if (botToken) {
                try {
                    // Try to get bot member info from guild
                    await axios.get(`https://discord.com/api/guilds/${guild.id}/members/${clientId}`, {
                        headers: {
                            Authorization: `Bot ${botToken}`
                        }
                    });
                    botInServer = true;
                } catch (botError) {
                    // 404 means bot not in server, other errors mean something else
                    if (botError.response?.status === 404) {
                        botInServer = false;
                    } else {
                        console.log(`⚠️ Could not check bot membership for ${guild.name}:`, botError.message);
                        botInServer = false;
                    }
                }
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
        
        // ✅ Initialize guild with default values
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
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands`;
        
        // ✅ Get guild details from the user's guild list
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
                console.log('✅ Guild found from user list:', guildData.name);
            }
        } catch (guildsError) {
            console.warn('⚠️ Could not get guild from user list:', guildsError.message);
        }
        
        // ✅ Check if bot is in the server using bot token
        if (botToken) {
            try {
                console.log('🔍 Checking bot membership using bot token...');
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

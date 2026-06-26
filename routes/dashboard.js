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
        console.log('📤 Making API request with token:', req.session.user.access_token.substring(0, 20) + '...');
        
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
        console.error('Error response:', error.response?.data || 'No response data');
        
        if (error.response?.status === 401) {
            console.log('🔄 Token invalid, redirecting to login');
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
        
        // ✅ Fetch guild details from Discord API
        // Note: This requires the 'guilds' scope to work
        try {
            const response = await axios.get(`https://discord.com/api/guilds/${guildId}`, {
                headers: {
                    Authorization: `Bearer ${req.session.user.access_token}`
                }
            });
            
            const guild = response.data;
            console.log('✅ Guild found:', guild.name);
            
            const clientId = process.env.DISCORD_CLIENT_ID || '1493217033956102215';
            const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands`;
            
            return res.render('server', {
                title: 'Server Settings — Sentinal',
                user: req.session.user,
                isAuthenticated: true,
                guild: {
                    id: guild.id,
                    name: guild.name,
                    icon: guild.icon,
                    memberCount: guild.approximate_member_count || 0,
                    channelCount: guild.approximate_presence_count || 0
                },
                config: config || {},
                inviteLink: inviteLink
            });
            
        } catch (apiError) {
            console.warn('⚠️ Could not fetch guild details from Discord API:', apiError.message);
            
            // ✅ Fallback: Try to get guild from user's guild list
            try {
                const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
                    headers: {
                        Authorization: `Bearer ${req.session.user.access_token}`
                    }
                });
                
                const userGuild = guildsResponse.data.find(g => g.id === guildId);
                if (userGuild) {
                    const clientId = process.env.DISCORD_CLIENT_ID || '1493217033956102215';
                    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands`;
                    
                    return res.render('server', {
                        title: 'Server Settings — Sentinal',
                        user: req.session.user,
                        isAuthenticated: true,
                        guild: {
                            id: userGuild.id,
                            name: userGuild.name,
                            icon: userGuild.icon,
                            memberCount: userGuild.approximate_member_count || 0,
                            channelCount: 0
                        },
                        config: config || {},
                        inviteLink: inviteLink
                    });
                }
            } catch (guildsError) {
                console.warn('⚠️ Could not check user guilds:', guildsError.message);
            }
            
            // ✅ Final fallback: Show minimal server info
            const clientId = process.env.DISCORD_CLIENT_ID || '1493217033956102215';
            const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands`;
            
            return res.render('server', {
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
                error: 'Could not fetch server details. Please make sure the bot has the "guilds" scope.'
            });
        }
        
    } catch (error) {
        console.error('❌ Error loading server settings:', error.message);
        
        if (error.response?.status === 401) {
            console.log('🔄 Token invalid, redirecting to login');
            req.session.destroy(() => {
                res.redirect('/auth/login?error=session_expired');
            });
            return;
        }
        
        // ✅ Show error page but don't crash
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

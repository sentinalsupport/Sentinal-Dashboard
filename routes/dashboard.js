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

// ============ REFRESH TOKEN FUNCTION ============
async function refreshAccessToken(refresh_token) {
    try {
        const response = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                refresh_token: refresh_token,
                grant_type: 'refresh_token'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('❌ Token refresh error:', error.message);
        throw error;
    }
}

// ============ ENSURE VALID TOKEN ============
async function ensureValidToken(req, res, next) {
    if (!req.session.user) return res.redirect('/auth/login');

    const tokenExpires = req.session.user.token_expires || 0;
    const now = Date.now();

    if (now > tokenExpires - 300000) {
        try {
            const tokenData = await refreshAccessToken(req.session.user.refresh_token);
            req.session.user.access_token = tokenData.access_token;
            req.session.user.token_expires = Date.now() + (tokenData.expires_in * 1000);
            if (tokenData.refresh_token) {
                req.session.user.refresh_token = tokenData.refresh_token;
            }
            req.session.save();
        } catch (error) {
            console.error('❌ Token refresh failed:', error.message);
            return res.redirect('/auth/login?error=session_expired');
        }
    }
    next();
}

// ============ DASHBOARD HOME ============
router.get('/dashboard', isAuthenticated, (req, res) => {
    return res.redirect('/servers');
});

// ============ SERVERS LIST ============
router.get('/servers', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        console.log('📋 Servers route accessed');
        
        const response = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        const guilds = response.data.filter(g => 
            (g.permissions & 0x8) || (g.permissions & 0x20)
        );
        
        const botToken = process.env.DISCORD_TOKEN;
        const clientId = process.env.DISCORD_CLIENT_ID || '1493217033956102215';
        const guildsWithBotStatus = [];
        
        for (const guild of guilds) {
            let botInServer = false;
            
            if (botToken) {
                try {
                    await axios.get(`https://discord.com/api/guilds/${guild.id}/members/${clientId}`, {
                        headers: {
                            Authorization: `Bot ${botToken}`
                        }
                    });
                    botInServer = true;
                } catch (botError) {
                    botInServer = false;
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
router.get('/servers/:guildId', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('🔍 Loading server settings for guild:', guildId);
        
        let GuildConfig;
        try {
            GuildConfig = require('../models/GuildConfig');
        } catch (err) {
            GuildConfig = {
                findOne: async () => null,
                findOneAndUpdate: async () => ({})
            };
        }
        
        const config = await GuildConfig.findOne({ guildId }).catch(() => null);
        
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
            }
        } catch (guildsError) {
            console.warn('Could not get guild from user list:', guildsError.message);
        }
        
        if (botToken) {
            try {
                await axios.get(`https://discord.com/api/guilds/${guildId}/members/${clientId}`, {
                    headers: {
                        Authorization: `Bot ${botToken}`
                    }
                });
                botInServer = true;
            } catch (botError) {
                botInServer = false;
            }
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
        console.error('Error loading server settings:', error.message);
        
        if (error.response?.status === 401) {
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

// ============ SERVER APPLICATIONS ============
router.get('/servers/:guildId/applications', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('📋 Loading applications for guild:', guildId);
        
        let ApplicationForm;
        try {
            ApplicationForm = require('../models/ApplicationForm');
        } catch (err) {
            ApplicationForm = { find: async () => [] };
        }
        
        const applications = await ApplicationForm.find({ guildId }).sort({ createdAt: -1 }).catch(() => []);
        console.log(`✅ Found ${applications.length} applications`);
        
        let GuildConfig;
        try {
            GuildConfig = require('../models/GuildConfig');
        } catch (err) {
            GuildConfig = { findOne: async () => null };
        }
        // ============ SERVER TICKETS PANELS ============
router.get('/servers/:guildId/tickets/panels', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('📋 Loading ticket panels for guild:', guildId);
        
        let Panel;
        try {
            Panel = require('../models/Panel');
        } catch (err) {
            Panel = { find: async () => [] };
        }
        
        const panels = await Panel.find({ guildId }).sort({ createdAt: -1 }).catch(() => []);
        console.log(`✅ Found ${panels.length} panels`);
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        // Get all templates for the template dropdown in panels
        let TicketTemplate;
        try {
            TicketTemplate = require('../models/TicketTemplate');
        } catch (err) {
            TicketTemplate = { find: async () => [] };
        }
        const templates = await TicketTemplate.find({ guildId, status: 'active' }).catch(() => []);
        
        res.render('panels', {
            title: 'Panels — Sentinal',
            user: req.session.user,
            guild: guildData,
            panels: panels,
            templates: templates,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading ticket panels:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load panels',
            title: 'Error'
        });
    }
});
        const config = await GuildConfig.findOne({ guildId }).catch(() => null);
        
        res.render('applications', {
            title: 'Applications — Sentinal',
            user: req.session.user,
            guild: { id: guildId },
            config: config || {},
            applications: applications,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading applications:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load applications',
            title: 'Error'
        });
    }
});

// ============ SERVER TICKETS ============
router.get('/servers/:guildId/tickets', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('📋 Loading tickets for guild:', guildId);
        
        let TicketTemplate;
        try {
            TicketTemplate = require('../models/TicketTemplate');
        } catch (err) {
            TicketTemplate = { find: async () => [] };
        }
        
        const tickets = await TicketTemplate.find({ guildId }).sort({ createdAt: -1 }).catch(() => []);
        console.log(`✅ Found ${tickets.length} ticket templates`);
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        res.render('tickets', {
            title: 'Tickets — Sentinal',
            user: req.session.user,
            guild: guildData,
            tickets: tickets,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading tickets:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load tickets',
            title: 'Error'
        });
    }
});

// ============ SERVER TICKETS TEMPLATES ============
router.get('/servers/:guildId/tickets/templates', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('📋 Loading templates for guild:', guildId);
        
        let TicketTemplate;
        try {
            TicketTemplate = require('../models/TicketTemplate');
        } catch (err) {
            TicketTemplate = { find: async () => [] };
        }
        
        const templates = await TicketTemplate.find({ guildId }).sort({ createdAt: -1 }).catch(() => []);
        console.log(`✅ Found ${templates.length} templates`);
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        res.render('templates/index', {
            title: 'Templates — Sentinal',
            user: req.session.user,
            guild: guildData,
            templates: templates,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading templates:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load templates',
            title: 'Error'
        });
    }
});

// ============ CREATE TEMPLATE PAGE ============
router.get('/servers/:guildId/tickets/create', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('📋 Loading create template page for guild:', guildId);
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        let roles = [];
        const botToken = process.env.DISCORD_TOKEN;
        if (botToken) {
            try {
                const rolesResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/roles`, {
                    headers: {
                        Authorization: `Bot ${botToken}`
                    }
                });
                roles = rolesResponse.data.map(r => ({
                    id: r.id,
                    name: r.name,
                    color: r.color
                }));
            } catch (err) {
                console.warn('Could not fetch roles:', err.message);
            }
        }
        
        let channels = [];
        if (botToken) {
            try {
                const channelsResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/channels`, {
                    headers: {
                        Authorization: `Bot ${botToken}`
                    }
                });
                channels = channelsResponse.data
                    .filter(ch => ch.type === 0 || ch.type === 2 || ch.type === 4)
                    .map(ch => ({
                        id: ch.id,
                        name: ch.name,
                        type: ch.type
                    }));
            } catch (err) {
                console.warn('Could not fetch channels:', err.message);
            }
        }
        
        res.render('templates/create', {
            title: 'Create Template — Sentinal',
            user: req.session.user,
            guild: guildData,
            roles: roles,
            channels: channels,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading create template page:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load create template page',
            title: 'Error'
        });
    }
});

// ============ SERVER PANELS ============
router.get('/servers/:guildId/panels', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('📋 Loading panels for guild:', guildId);
        
        let Panel;
        try {
            Panel = require('../models/Panel');
        } catch (err) {
            Panel = { find: async () => [] };
        }
        
        const panels = await Panel.find({ guildId }).sort({ createdAt: -1 }).catch(() => []);
        console.log(`✅ Found ${panels.length} panels`);
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        // Get all templates for the template dropdown in panels
        let TicketTemplate;
        try {
            TicketTemplate = require('../models/TicketTemplate');
        } catch (err) {
            TicketTemplate = { find: async () => [] };
        }
        const templates = await TicketTemplate.find({ guildId, status: 'active' }).catch(() => []);
        
        res.render('panels', {
            title: 'Panels — Sentinal',
            user: req.session.user,
            guild: guildData,
            panels: panels,
            templates: templates,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading panels:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load panels',
            title: 'Error'
        });
    }
});

// ============ CREATE PANEL PAGE ============
router.get('/servers/:guildId/panels/create', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('📋 Loading create panel page for guild:', guildId);
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        // Get channels for dropdown
        let channels = [];
        const botToken = process.env.DISCORD_TOKEN;
        if (botToken) {
            try {
                const channelsResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/channels`, {
                    headers: {
                        Authorization: `Bot ${botToken}`
                    }
                });
                channels = channelsResponse.data
                    .filter(ch => ch.type === 0)
                    .map(ch => ({
                        id: ch.id,
                        name: ch.name
                    }));
            } catch (err) {
                console.warn('Could not fetch channels:', err.message);
            }
        }
        
        // Get templates for dropdown
        let TicketTemplate;
        try {
            TicketTemplate = require('../models/TicketTemplate');
        } catch (err) {
            TicketTemplate = { find: async () => [] };
        }
        const templates = await TicketTemplate.find({ guildId, status: 'active' }).catch(() => []);
        
        res.render('panels/create', {
            title: 'Create Panel — Sentinal',
            user: req.session.user,
            guild: guildData,
            templates: templates,
            channels: channels,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading create panel page:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load create panel page',
            title: 'Error'
        });
    }
});

// ============ EDIT PANEL PAGE ============
router.get('/servers/:guildId/panels/:panelId/edit', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const panelId = req.params.panelId;
        console.log('📋 Loading edit panel page for panel:', panelId);
        
        let Panel;
        try {
            Panel = require('../models/Panel');
        } catch (err) {
            Panel = { findById: async () => null };
        }
        
        const panel = await Panel.findById(panelId);
        if (!panel) {
            return res.status(404).render('error', {
                message: 'Panel not found',
                title: 'Not Found'
            });
        }
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        // Get channels for dropdown
        let channels = [];
        const botToken = process.env.DISCORD_TOKEN;
        if (botToken) {
            try {
                const channelsResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/channels`, {
                    headers: {
                        Authorization: `Bot ${botToken}`
                    }
                });
                channels = channelsResponse.data
                    .filter(ch => ch.type === 0)
                    .map(ch => ({
                        id: ch.id,
                        name: ch.name
                    }));
            } catch (err) {
                console.warn('Could not fetch channels:', err.message);
            }
        }
        
        // Get templates for dropdown
        let TicketTemplate;
        try {
            TicketTemplate = require('../models/TicketTemplate');
        } catch (err) {
            TicketTemplate = { find: async () => [] };
        }
        const templates = await TicketTemplate.find({ guildId, status: 'active' }).catch(() => []);
        
        res.render('panels/edit', {
            title: 'Edit Panel — Sentinal',
            user: req.session.user,
            guild: guildData,
            panel: panel,
            templates: templates,
            channels: channels,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading edit panel page:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load edit panel page',
            title: 'Error'
        });
    }
});

// ============ SERVER QUICK RESPONSES ============
router.get('/servers/:guildId/tickets/quick-responses', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('📋 Loading quick responses for guild:', guildId);
        
        let QuickResponse;
        try {
            QuickResponse = require('../models/QuickResponse');
        } catch (err) {
            QuickResponse = { find: async () => [] };
        }
        
        const responses = await QuickResponse.find({ guildId }).sort({ createdAt: -1 }).catch(() => []);
        console.log(`✅ Found ${responses.length} quick responses`);
        
        let GuildConfig;
        try {
            GuildConfig = require('../models/GuildConfig');
        } catch (err) {
            GuildConfig = { findOne: async () => null };
        }
        
        const config = await GuildConfig.findOne({ guildId }).catch(() => null);
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        res.render('quick-responses', {
            title: 'Quick Responses — Sentinal',
            user: req.session.user,
            guild: guildData,
            responses: responses,
            config: config || {},
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading quick responses:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load quick responses',
            title: 'Error'
        });
    }
});

// ============ SERVER TRANSCRIPTS ============
router.get('/servers/:guildId/tickets/transcripts', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('📋 Loading transcripts for guild:', guildId);
        
        let Transcript;
        try {
            Transcript = require('../models/Transcript');
        } catch (err) {
            Transcript = { find: async () => [] };
        }
        
        const transcripts = await Transcript.find({ guildId })
            .sort({ createdAt: -1 })
            .limit(50)
            .catch(() => []);
        console.log(`✅ Found ${transcripts.length} transcripts`);
        
        let GuildConfig;
        try {
            GuildConfig = require('../models/GuildConfig');
        } catch (err) {
            GuildConfig = { findOne: async () => null };
        }
        
        const config = await GuildConfig.findOne({ guildId }).catch(() => null);
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        res.render('transcripts', {
            title: 'Transcripts — Sentinal',
            user: req.session.user,
            guild: guildData,
            transcripts: transcripts,
            config: config || {},
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading transcripts:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load transcripts',
            title: 'Error'
        });
    }
});

// ============ SERVER AUTOMATION ============
router.get('/servers/:guildId/automation', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        console.log('📋 Loading automation settings for guild:', guildId);
        
        let GuildConfig;
        try {
            GuildConfig = require('../models/GuildConfig');
        } catch (err) {
            GuildConfig = { findOne: async () => null };
        }
        
        const config = await GuildConfig.findOne({ guildId }).catch(() => null);
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        res.render('automation', {
            title: 'Auto Roles — Sentinal',
            user: req.session.user,
            guild: guildData,
            config: config || {},
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading automation:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load automation settings',
            title: 'Error'
        });
    }
});

// ============ TICKET EDIT PAGE ============
router.get('/servers/:guildId/tickets/edit/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const templateId = req.params.id;
        const guildId = req.params.guildId;
        console.log('📋 Loading ticket template for edit:', templateId);
        
        let TicketTemplate;
        try {
            TicketTemplate = require('../models/TicketTemplate');
        } catch (err) {
            TicketTemplate = { findById: async () => null };
        }
        
        const template = await TicketTemplate.findById(templateId);
        
        if (!template) {
            return res.status(404).render('error', {
                message: 'Ticket template not found',
                title: 'Not Found'
            });
        }
        
        let roles = [];
        const botToken = process.env.DISCORD_TOKEN;
        if (botToken) {
            try {
                const rolesResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/roles`, {
                    headers: {
                        Authorization: `Bot ${botToken}`
                    }
                });
                roles = rolesResponse.data.map(r => ({
                    id: r.id,
                    name: r.name,
                    color: r.color
                }));
            } catch (err) {
                console.warn('Could not fetch roles:', err.message);
            }
        }
        
        let channels = [];
        if (botToken) {
            try {
                const channelsResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/channels`, {
                    headers: {
                        Authorization: `Bot ${botToken}`
                    }
                });
                channels = channelsResponse.data
                    .filter(ch => ch.type === 0 || ch.type === 2 || ch.type === 4)
                    .map(ch => ({
                        id: ch.id,
                        name: ch.name,
                        type: ch.type
                    }));
            } catch (err) {
                console.warn('Could not fetch channels:', err.message);
            }
        }
        
        let guildData = {
            id: guildId,
            name: 'Server',
            icon: null,
            approximate_member_count: 0
        };
        
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
                    approximate_member_count: userGuild.approximate_member_count || 0
                };
            }
        } catch (guildsError) {
            console.warn('Could not get guild:', guildsError.message);
        }
        
        res.render('ticket-edit', {
            title: 'Edit Template — Sentinal',
            user: req.session.user,
            guild: guildData,
            template: template,
            roles: roles,
            channels: channels,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading ticket template:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load ticket template',
            title: 'Error'
        });
    }
});

// ============ API: APPLICATIONS ============
router.post('/api/applications', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const { name, description, enabled, channel, guildId } = req.body;
        
        const BANNED_WORDS = [
            'nigger', 'nigga', 'niger', 'niggar',
            'fuck', 'fucking', 'shit', 'bitch', 'bastard',
            'cunt', 'dick', 'pussy', 'asshole', 'motherfucker',
            'retard', 'retarded', 'fag', 'faggot', 'tranny',
            'kike', 'spic', 'chink', 'gook', 'wetback',
            'coon', 'jiggaboo', 'moolie', 'nazi', 'hitler',
            'whore', 'slut', 'cocksucker', 'cum', 'cumshot',
            'fucktard', 'tard', 'mongoloid', 'midget'
        ];
        
        const lowerName = name.toLowerCase().trim();
        for (const word of BANNED_WORDS) {
            if (lowerName.includes(word) || new RegExp('\\b' + word + '\\b', 'i').test(lowerName)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Application name contains inappropriate language.' 
                });
            }
        }
        
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Application name is required.' 
            });
        }
        
        const ApplicationForm = require('../models/ApplicationForm');
        
        const existing = await ApplicationForm.findOne({ 
            guildId: guildId, 
            name: name.trim() 
        });
        
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                error: 'An application with this name already exists.' 
            });
        }
        
        const application = await ApplicationForm.create({
            guildId: guildId,
            name: name.trim(),
            description: description || '',
            enabled: enabled !== undefined ? enabled : true,
            pendingChannel: channel || null,
            questions: []
        });
        
        res.json({ 
            success: true, 
            application: application,
            message: 'Application created successfully!' 
        });
        
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to create application.' 
        });
    }
});

router.post('/api/applications/:id/toggle', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const ApplicationForm = require('../models/ApplicationForm');
        const app = await ApplicationForm.findById(req.params.id);
        
        if (!app) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }
        
        app.enabled = !app.enabled;
        await app.save();
        
        res.json({ success: true, enabled: app.enabled });
    } catch (error) {
        console.error('Error toggling application:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/api/applications/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const ApplicationForm = require('../models/ApplicationForm');
        const app = await ApplicationForm.findById(req.params.id);
        
        if (!app) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }
        
        await app.deleteOne();
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: PANELS ============
router.post('/api/panels', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.create(req.body);
        res.json({ success: true, panel: panel });
    } catch (error) {
        console.error('Error creating panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/api/panels/create', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = new Panel(req.body);
        await panel.save();
        res.json({ success: true, panelId: panel._id });
    } catch (error) {
        console.error('Error creating panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/api/panels/:panelId/save', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findOne({ _id: req.params.panelId });
        
        if (!panel) {
            return res.status(404).json({ success: false, error: 'Panel not found' });
        }
        
        const { name, description, config, status } = req.body;
        panel.name = name || panel.name;
        panel.description = description || panel.description;
        panel.config = config || panel.config;
        panel.status = status || panel.status;
        panel.updatedAt = new Date();
        
        await panel.save();
        res.json({ success: true, panelId: panel._id });
    } catch (error) {
        console.error('Error saving panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/api/panels/:panelId/send', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findById(req.params.panelId);
        
        if (!panel) {
            return res.status(404).json({ success: false, error: 'Panel not found' });
        }
        
        const guildId = req.body.guildId || panel.guildId;
        if (!guildId) {
            return res.status(400).json({ success: false, error: 'Guild ID is required' });
        }
        
        const botToken = process.env.DISCORD_TOKEN;
        if (!botToken) {
            return res.status(500).json({ success: false, error: 'Bot token not configured' });
        }
        
        const channelId = panel.channelId;
        if (!channelId) {
            return res.status(400).json({ success: false, error: 'No channel configured for this panel' });
        }
        
        // Build components for Discord
        const components = [];
        if (panel.components && panel.components.length > 0) {
            const row = new ActionRowBuilder();
            panel.components.forEach(comp => {
                const button = new ButtonBuilder()
                    .setCustomId(`ticket_${panel._id}_${comp.templateId}`)
                    .setLabel(comp.label)
                    .setStyle(ButtonStyle[comp.style || 'Primary'])
                    .setDisabled(comp.disabled || false);
                if (comp.emoji) button.setEmoji(comp.emoji);
                row.addComponents(button);
            });
            components.push(row);
        }
        
        const messagePayload = {
            content: panel.message || 'Need help? Click a button below to create a ticket.',
            components: components
        };
        
        if (panel.embed) {
            messagePayload.embeds = [panel.embed];
        }
        
        const response = await axios.post(
            `https://discord.com/api/channels/${channelId}/messages`,
            messagePayload,
            {
                headers: {
                    Authorization: `Bot ${botToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        panel.messageId = response.data.id;
        panel.syncStatus = 'synced';
        panel.lastSent = new Date();
        await panel.save();
        
        res.json({ success: true, messageId: response.data.id });
    } catch (error) {
        console.error('Error sending panel to Discord:', error);
        res.status(500).json({ 
            success: false, 
            error: error.response?.data?.message || error.message 
        });
    }
});

router.post('/api/panels/:panelId/duplicate', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const original = await Panel.findById(req.params.panelId);
        
        if (!original) {
            return res.status(404).json({ success: false, error: 'Panel not found' });
        }
        
        const newPanel = new Panel({
            ...original.toObject(),
            _id: undefined,
            name: original.name + ' (Copy)',
            createdAt: new Date(),
            updatedAt: new Date(),
            syncStatus: 'pending',
            messageId: null,
            lastSent: null,
            ticketsOpened: 0
        });
        
        await newPanel.save();
        res.json({ success: true, panelId: newPanel._id });
    } catch (error) {
        console.error('Error duplicating panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/api/panels/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findById(req.params.id);
        if (!panel) {
            return res.status(404).json({ success: false, error: 'Panel not found' });
        }
        res.json({ success: true, panel: panel });
    } catch (error) {
        console.error('Error fetching panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/api/panels/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findById(req.params.id);
        if (!panel) {
            return res.status(404).json({ success: false, error: 'Panel not found' });
        }
        
        const { name, description, channelId, type, enabled, message, embed, components, templates, syncStatus, channelName } = req.body;
        panel.name = name || panel.name;
        panel.description = description || panel.description;
        panel.channelId = channelId || panel.channelId;
        panel.channelName = channelName || panel.channelName;
        panel.type = type || panel.type;
        if (enabled !== undefined) panel.enabled = enabled;
        if (message !== undefined) panel.message = message;
        if (embed !== undefined) panel.embed = embed;
        if (components !== undefined) panel.components = components;
        if (templates !== undefined) panel.templates = templates;
        if (syncStatus !== undefined) panel.syncStatus = syncStatus;
        panel.updatedAt = new Date();
        
        await panel.save();
        res.json({ success: true, panel: panel });
    } catch (error) {
        console.error('Error updating panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/api/panels/:id/toggle', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findById(req.params.id);
        if (!panel) {
            return res.status(404).json({ success: false, error: 'Panel not found' });
        }
        panel.enabled = !panel.enabled;
        await panel.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error toggling panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/api/panels/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        await Panel.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: TICKETS ============
router.post('/api/tickets', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const TicketTemplate = require('../models/TicketTemplate');
        const ticket = await TicketTemplate.create(req.body);
        res.json({ success: true, ticket: ticket });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/api/tickets/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const TicketTemplate = require('../models/TicketTemplate');
        const ticket = await TicketTemplate.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, error: 'Ticket not found' });
        }
        res.json({ success: true, ticket: ticket });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/api/tickets/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const TicketTemplate = require('../models/TicketTemplate');
        const ticket = await TicketTemplate.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, error: 'Ticket not found' });
        }
        
        const { name, category, description, enabled, channelName, maxTickets, blockedRoles, requiredRoles, supportRoles, ticketClaiming, actionOnLeave, pingSupport, rateSupport, formDescription, questions, transcriptChannel, topic, welcomeMessage, pinWelcome, autoMentionSupport, lockOnClose, deleteOnClose, autoClose, permissions } = req.body;
        
        ticket.name = name || ticket.name;
        ticket.category = category || ticket.category;
        ticket.description = description || ticket.description;
        if (enabled !== undefined) ticket.enabled = enabled;
        ticket.channelName = channelName || ticket.channelName;
        ticket.maxTickets = maxTickets || ticket.maxTickets || 3;
        ticket.blockedRoles = blockedRoles || ticket.blockedRoles || [];
        ticket.requiredRoles = requiredRoles || ticket.requiredRoles || [];
        ticket.supportRoles = supportRoles || ticket.supportRoles || [];
        ticket.ticketClaiming = ticketClaiming !== undefined ? ticketClaiming : (ticket.ticketClaiming || false);
        ticket.actionOnLeave = actionOnLeave || ticket.actionOnLeave || 'nothing';
        ticket.pingSupport = pingSupport !== undefined ? pingSupport : (ticket.pingSupport || false);
        ticket.rateSupport = rateSupport !== undefined ? rateSupport : (ticket.rateSupport || false);
        ticket.formDescription = formDescription || ticket.formDescription || '';
        ticket.questions = questions || ticket.questions || [];
        ticket.transcriptChannel = transcriptChannel || ticket.transcriptChannel || '';
        ticket.topic = topic || ticket.topic || '';
        ticket.welcomeMessage = welcomeMessage || ticket.welcomeMessage || '';
        ticket.pinWelcome = pinWelcome !== undefined ? pinWelcome : (ticket.pinWelcome || false);
        ticket.autoMentionSupport = autoMentionSupport !== undefined ? autoMentionSupport : (ticket.autoMentionSupport || true);
        ticket.lockOnClose = lockOnClose !== undefined ? lockOnClose : (ticket.lockOnClose || true);
        ticket.deleteOnClose = deleteOnClose !== undefined ? deleteOnClose : (ticket.deleteOnClose || false);
        if (autoClose) {
            ticket.autoClose = autoClose;
        }
        if (permissions) {
            ticket.permissions = permissions;
        }
        
        await ticket.save();
        res.json({ success: true, ticket: ticket });
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/api/tickets/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const TicketTemplate = require('../models/TicketTemplate');
        await TicketTemplate.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: QUICK RESPONSES ============
router.get('/api/quick-responses/:guildId', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        let QuickResponse;
        try {
            QuickResponse = require('../models/QuickResponse');
        } catch (err) {
            return res.status(500).json({ success: false, error: 'QuickResponse model not found' });
        }
        
        const responses = await QuickResponse.find({ guildId }).sort({ createdAt: -1 });
        res.json({ success: true, responses });
    } catch (error) {
        console.error('Error fetching quick responses:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/api/quick-responses', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const QuickResponse = require('../models/QuickResponse');
        const response = await QuickResponse.create(req.body);
        res.json({ success: true, response });
    } catch (error) {
        console.error('Error creating quick response:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/api/quick-responses/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const QuickResponse = require('../models/QuickResponse');
        const response = await QuickResponse.findById(req.params.id);
        if (!response) {
            return res.status(404).json({ success: false, error: 'Response not found' });
        }
        
        const { name, content, enabled } = req.body;
        response.name = name || response.name;
        response.content = content || response.content;
        if (enabled !== undefined) response.enabled = enabled;
        
        await response.save();
        res.json({ success: true, response });
    } catch (error) {
        console.error('Error updating quick response:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/api/quick-responses/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const QuickResponse = require('../models/QuickResponse');
        await QuickResponse.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting quick response:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: TRANSCRIPTS ============
router.get('/api/transcripts/:guildId', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        let Transcript;
        try {
            Transcript = require('../models/Transcript');
        } catch (err) {
            return res.status(500).json({ success: false, error: 'Transcript model not found' });
        }
        
        const transcripts = await Transcript.find({ guildId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, transcripts });
    } catch (error) {
        console.error('Error fetching transcripts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/api/transcripts/:guildId/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const id = req.params.id;
        let Transcript;
        try {
            Transcript = require('../models/Transcript');
        } catch (err) {
            return res.status(500).json({ success: false, error: 'Transcript model not found' });
        }
        
        const transcript = await Transcript.findOne({ _id: id, guildId });
        if (!transcript) {
            return res.status(404).json({ success: false, error: 'Transcript not found' });
        }
        res.json({ success: true, transcript });
    } catch (error) {
        console.error('Error fetching transcript:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: CONFIG (GET) ============
router.get('/api/config/:guildId', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        let GuildConfig;
        try {
            GuildConfig = require('../models/GuildConfig');
        } catch (err) {
            return res.status(500).json({ 
                success: false, 
                error: 'GuildConfig model not found' 
            });
        }
        
        const config = await GuildConfig.findOne({ guildId });
        
        if (!config) {
            return res.json({
                success: true,
                config: {
                    guildId: guildId,
                    autoRoles: {
                        enabled: false,
                        ignoreBots: true,
                        roles: [],
                        maxRoles: 2
                    }
                }
            });
        }
        
        res.json({ success: true, config });
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: CONFIG (POST - SAVE) ============
router.post('/api/config/:guildId', isAuthenticated, ensureValidToken, async (req, res) => {
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
        
        let config = await GuildConfig.findOne({ guildId });
        
        if (!config) {
            config = new GuildConfig({ guildId });
        }
        
        if (settings.autoRoles) {
            config.autoRoles = {
                enabled: settings.autoRoles.enabled !== undefined ? settings.autoRoles.enabled : false,
                ignoreBots: settings.autoRoles.ignoreBots !== undefined ? settings.autoRoles.ignoreBots : true,
                roles: settings.autoRoles.roles || [],
                maxRoles: settings.autoRoles.maxRoles || 2
            };
        }
        
        if (settings.welcomeMessage) config.welcomeMessage = settings.welcomeMessage;
        if (settings.ticketCategory) config.ticketCategory = settings.ticketCategory;
        if (settings.ticketSupportRole) config.ticketSupportRole = settings.ticketSupportRole;
        if (settings.ticketLogChannel) config.ticketLogChannel = settings.ticketLogChannel;
        if (settings.modLogChannel) config.modLogChannel = settings.modLogChannel;
        if (settings.memberLogChannel) config.memberLogChannel = settings.memberLogChannel;
        if (settings.welcomeChannel) config.welcomeChannel = settings.welcomeChannel;
        
        config.updatedAt = new Date();
        await config.save();
        
        console.log('✅ Config saved for guild:', guildId);
        
        res.json({ success: true, message: 'Settings saved' });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: SERVER ROLES ============
router.get('/api/servers/:guildId/roles', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const botToken = process.env.DISCORD_TOKEN;
        
        if (!botToken) {
            return res.status(500).json({ success: false, error: 'Bot token not configured' });
        }
        
        const response = await axios.get(`https://discord.com/api/guilds/${guildId}/roles`, {
            headers: {
                Authorization: `Bot ${botToken}`
            }
        });
        
        const roles = response.data
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => ({
                id: role.id,
                name: role.name,
                color: role.color,
                position: role.position,
                managed: role.managed,
                mentionable: role.mentionable,
                hoist: role.hoist,
                permissions: role.permissions
            }));
        
        res.json({ success: true, roles });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: SERVER CHANNELS ============
router.get('/api/servers/:guildId/channels', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const botToken = process.env.DISCORD_TOKEN;
        
        if (!botToken) {
            return res.status(500).json({ success: false, error: 'Bot token not configured' });
        }
        
        const response = await axios.get(`https://discord.com/api/guilds/${guildId}/channels`, {
            headers: {
                Authorization: `Bot ${botToken}`
            }
        });
        
        const channels = response.data
            .filter(ch => ch.type === 0 || ch.type === 2 || ch.type === 4)
            .map(ch => ({
                id: ch.id,
                name: ch.name,
                type: ch.type,
                position: ch.position,
                parent_id: ch.parent_id
            }));
        
        res.json({ success: true, channels });
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: TICKET TEMPLATES ============
router.get('/api/tickets/templates/:guildId', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const TicketTemplate = require('../models/TicketTemplate');
        const templates = await TicketTemplate.find({ guildId }).sort({ createdAt: -1 });
        res.json({ success: true, templates });
    } catch (error) {
        console.error('Error fetching ticket templates:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: GUILD INFO ============
router.get('/api/guilds/:guildId', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const botToken = process.env.DISCORD_TOKEN;
        
        if (!botToken) {
            return res.status(500).json({ success: false, error: 'Bot token not configured' });
        }
        
        const response = await axios.get(`https://discord.com/api/guilds/${guildId}`, {
            headers: {
                Authorization: `Bot ${botToken}`
            }
        });
        
        res.json({ success: true, guild: response.data });
    } catch (error) {
        console.error('Error fetching guild info:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

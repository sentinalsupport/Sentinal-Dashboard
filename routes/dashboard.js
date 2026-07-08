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
    // ... (keep your existing servers route code)
});

// ============ SERVER SETTINGS ============
router.get('/servers/:guildId', isAuthenticated, ensureValidToken, async (req, res) => {
    // ... (keep your existing server settings route code)
});

// ============ SERVER APPLICATIONS ============
router.get('/servers/:guildId/applications', isAuthenticated, ensureValidToken, async (req, res) => {
    // ... (keep your existing applications route code)
});

// ============ SERVER TICKETS ============
router.get('/servers/:guildId/tickets', isAuthenticated, ensureValidToken, async (req, res) => {
    // ... (keep your existing tickets route code)
});

// ============ SERVER TICKETS TEMPLATES ============
router.get('/servers/:guildId/tickets/templates', isAuthenticated, ensureValidToken, async (req, res) => {
    // ... (keep your existing templates route code)
});

// ============ CREATE TEMPLATE PAGE ============
router.get('/servers/:guildId/tickets/create', isAuthenticated, ensureValidToken, async (req, res) => {
    // ... (keep your existing create template route code)
});

// ============ TICKET EDIT PAGE ============
router.get('/servers/:guildId/tickets/edit/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    // ... (keep your existing ticket edit route code)
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

// ============ SERVER TICKETS PANELS ============
router.get('/servers/:guildId/tickets/panels', isAuthenticated, ensureValidToken, async (req, res) => {
    // ... (same as above or redirect to /panels)
    return res.redirect('/servers/' + req.params.guildId + '/panels');
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

// ============ API: PANELS ============

// CREATE PANEL
router.post('/api/panels', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panelData = req.body;
        
        // Validate required fields
        if (!panelData.guildId) {
            return res.status(400).json({ 
                success: false, 
                error: 'guildId is required' 
            });
        }
        if (!panelData.channelId) {
            return res.status(400).json({ 
                success: false, 
                error: 'channelId is required' 
            });
        }
        if (!panelData.name || !panelData.name.trim()) {
            return res.status(400).json({ 
                success: false, 
                error: 'Panel name is required' 
            });
        }
        
        // Create the panel
        const panel = new Panel({
            guildId: panelData.guildId,
            name: panelData.name.trim(),
            description: panelData.description || '',
            channelId: panelData.channelId,
            channelName: panelData.channelName || '',
            type: panelData.type || 'ticket',
            enabled: panelData.enabled !== undefined ? panelData.enabled : true,
            message: panelData.message || 'Need help? Click a button below to create a ticket.',
            embed: panelData.embed || {},
            components: panelData.components || [],
            templates: panelData.templates || [],
            syncStatus: 'pending',
            ticketsOpened: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        await panel.save();
        
        // Log success
        console.log(`✅ Panel created: ${panel.name} (${panel._id}) for guild ${panel.guildId}`);
        
        // Return the panel ID explicitly
        res.json({ 
            success: true, 
            panelId: panel._id.toString(),
            panel: panel 
        });
    } catch (error) {
        console.error('Error creating panel:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// UPDATE PANEL
router.put('/api/panels/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findById(req.params.id);
        
        if (!panel) {
            return res.status(404).json({ 
                success: false, 
                error: 'Panel not found' 
            });
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
        
        console.log(`✅ Panel updated: ${panel.name} (${panel._id})`);
        
        res.json({ 
            success: true, 
            panelId: panel._id.toString(),
            panel: panel 
        });
    } catch (error) {
        console.error('Error updating panel:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// GET PANEL
router.get('/api/panels/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findById(req.params.id);
        
        if (!panel) {
            return res.status(404).json({ 
                success: false, 
                error: 'Panel not found' 
            });
        }
        
        res.json({ 
            success: true, 
            panelId: panel._id.toString(),
            panel: panel 
        });
    } catch (error) {
        console.error('Error fetching panel:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// SEND PANEL TO DISCORD
router.post('/api/panels/:panelId/send', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findById(req.params.panelId);
        
        if (!panel) {
            return res.status(404).json({ 
                success: false, 
                error: 'Panel not found' 
            });
        }
        
        const guildId = req.body.guildId || panel.guildId;
        if (!guildId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Guild ID is required' 
            });
        }
        
        const botToken = process.env.DISCORD_TOKEN;
        if (!botToken) {
            return res.status(500).json({ 
                success: false, 
                error: 'Bot token not configured' 
            });
        }
        
        const channelId = panel.channelId;
        if (!channelId) {
            return res.status(400).json({ 
                success: false, 
                error: 'No channel configured for this panel' 
            });
        }
        
        // Build components for Discord
        const components = [];
        if (panel.components && panel.components.length > 0) {
            // Filter enabled components
            const buttons = panel.components.filter(c => c.enabled !== false);
            
            // Discord allows up to 5 buttons per action row
            for (let i = 0; i < buttons.length; i += 5) {
                const row = buttons.slice(i, i + 5);
                const actionRow = {
                    type: 1, // Action Row
                    components: row.map(comp => ({
                        type: 2, // Button
                        style: 1, // Primary (blue) - Discord only supports preset styles
                        label: comp.label || 'Button',
                        custom_id: `ticket_${panel._id}_${comp.templateId || 'default'}`,
                        emoji: comp.emoji ? { name: comp.emoji } : undefined,
                        disabled: false
                    }))
                };
                components.push(actionRow);
            }
        }
        
        const messagePayload = {
            content: panel.message || 'Need help? Click a button below to create a ticket.',
            components: components
        };
        
        // Add embed if configured
        if (panel.embed && panel.embed.title) {
            const embedColor = panel.embed.color ? 
                parseInt(panel.embed.color.replace('#', ''), 16) : 
                0x3DFFB8;
            
            messagePayload.embeds = [{
                title: panel.embed.title,
                description: panel.embed.description || '',
                color: embedColor
            }];
        }
        
        // Send to Discord
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
        
        // Update panel with message ID
        panel.messageId = response.data.id;
        panel.syncStatus = 'synced';
        panel.lastSent = new Date();
        await panel.save();
        
        console.log(`✅ Panel sent to Discord: ${panel.name} (${panel._id}) -> channel ${channelId}`);
        
        res.json({ 
            success: true, 
            messageId: response.data.id,
            panelId: panel._id.toString(),
            channelId: channelId
        });
    } catch (error) {
        console.error('Error sending panel to Discord:', error);
        res.status(500).json({ 
            success: false, 
            error: error.response?.data?.message || error.message 
        });
    }
});

// DUPLICATE PANEL
router.post('/api/panels/:panelId/duplicate', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const original = await Panel.findById(req.params.panelId);
        
        if (!original) {
            return res.status(404).json({ 
                success: false, 
                error: 'Panel not found' 
            });
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
        
        res.json({ 
            success: true, 
            panelId: newPanel._id.toString(),
            panel: newPanel 
        });
    } catch (error) {
        console.error('Error duplicating panel:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// TOGGLE PANEL
router.post('/api/panels/:id/toggle', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findById(req.params.id);
        
        if (!panel) {
            return res.status(404).json({ 
                success: false, 
                error: 'Panel not found' 
            });
        }
        
        panel.enabled = !panel.enabled;
        await panel.save();
        
        res.json({ 
            success: true, 
            enabled: panel.enabled,
            panelId: panel._id.toString()
        });
    } catch (error) {
        console.error('Error toggling panel:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// DELETE PANEL
router.delete('/api/panels/:id', isAuthenticated, ensureValidToken, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findByIdAndDelete(req.params.id);
        
        if (!panel) {
            return res.status(404).json({ 
                success: false, 
                error: 'Panel not found' 
            });
        }
        
        console.log(`✅ Panel deleted: ${panel.name} (${panel._id})`);
        
        res.json({ 
            success: true,
            panelId: req.params.id
        });
    } catch (error) {
        console.error('Error deleting panel:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============ API: TICKETS ============
// ... (keep your existing ticket API routes)

// ============ API: QUICK RESPONSES ============
// ... (keep your existing quick responses API routes)

// ============ API: TRANSCRIPTS ============
// ... (keep your existing transcripts API routes)

// ============ API: CONFIG ============
// ... (keep your existing config API routes)

// ============ API: SERVER ROLES ============
// ... (keep your existing server roles API routes)

// ============ API: SERVER CHANNELS ============
// ... (keep your existing server channels API routes)

// ============ API: TICKET TEMPLATES ============
// ... (keep your existing ticket templates API routes)

// ============ API: GUILD INFO ============
// ... (keep your existing guild info API routes)

module.exports = router;

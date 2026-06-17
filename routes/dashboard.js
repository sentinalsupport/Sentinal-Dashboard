const express = require('express');
const router = express.Router();
const GuildConfig = require('../models/GuildConfig');

// =============================================
// ====== AUTHENTICATION MIDDLEWARE ======
// =============================================

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// =============================================
// ====== DASHBOARD ROUTES ======
// =============================================

// Main Dashboard
router.get('/', isAuthenticated, async (req, res) => {
    try {
        let configs = [];
        if (req.user && req.user.guilds) {
            const guildIds = req.user.guilds.map(g => g.id);
            configs = await GuildConfig.find({ guildId: { $in: guildIds } });
        }
        
        res.render('dashboard', { 
            user: req.user,
            title: 'Dashboard - Sentinal',
            isAuthenticated: true,
            configs: configs
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('dashboard', { 
            user: req.user,
            title: 'Dashboard - Sentinal',
            isAuthenticated: true,
            configs: []
        });
    }
});

// Server Settings Page
router.get('/server/:guildId', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        
        // Check if user has access to this guild
        const userGuild = req.user.guilds.find(g => g.id === guildId);
        if (!userGuild) {
            return res.status(403).render('error', {
                code: 403,
                message: 'Access Denied',
                error: 'You do not have access to this server.',
                isAuthenticated: true
            });
        }
        
        const config = await GuildConfig.findOne({ guildId });
        
        res.render('server', { 
            user: req.user,
            guild: userGuild,
            config: config || {},
            title: `Server Settings - ${userGuild.name}`,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Server settings error:', error);
        res.status(500).render('error', {
            code: 500,
            message: 'Server Error',
            error: 'Failed to load server settings.',
            isAuthenticated: true
        });
    }
});

// Applications Page
router.get('/applications', isAuthenticated, async (req, res) => {
    try {
        // Fetch applications from database
        const applications = await Application.find({ 
            guildId: { $in: req.user.guilds.map(g => g.id) } 
        }).sort({ createdAt: -1 }).limit(50);
        
        res.render('applications', { 
            user: req.user,
            applications: applications,
            title: 'Applications - Sentinal',
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Applications error:', error);
        res.render('applications', { 
            user: req.user,
            applications: [],
            title: 'Applications - Sentinal',
            isAuthenticated: true
        });
    }
});

// Tickets Page
router.get('/tickets', isAuthenticated, async (req, res) => {
    try {
        const tickets = await Ticket.find({ 
            guildId: { $in: req.user.guilds.map(g => g.id) } 
        }).sort({ createdAt: -1 }).limit(50);
        
        res.render('tickets', { 
            user: req.user,
            tickets: tickets,
            title: 'Tickets - Sentinal',
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Tickets error:', error);
        res.render('tickets', { 
            user: req.user,
            tickets: [],
            title: 'Tickets - Sentinal',
            isAuthenticated: true
        });
    }
});

// Giveaways Page
router.get('/giveaways', isAuthenticated, async (req, res) => {
    try {
        const giveaways = await Giveaway.find({ 
            guildId: { $in: req.user.guilds.map(g => g.id) } 
        }).sort({ createdAt: -1 }).limit(50);
        
        res.render('giveaways', { 
            user: req.user,
            giveaways: giveaways,
            title: 'Giveaways - Sentinal',
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Giveaways error:', error);
        res.render('giveaways', { 
            user: req.user,
            giveaways: [],
            title: 'Giveaways - Sentinal',
            isAuthenticated: true
        });
    }
});

// Premium Page
router.get('/premium', isAuthenticated, (req, res) => {
    res.render('premium', { 
        user: req.user,
        title: 'Premium - Sentinal',
        isAuthenticated: true
    });
});

// =============================================
// ====== API ROUTES ======
// =============================================

// Get config for a specific guild
router.get('/api/config/:guildId', isAuthenticated, async (req, res) => {
    try {
        const config = await GuildConfig.findOne({ guildId: req.params.guildId });
        res.json(config || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update config for a specific guild
router.post('/api/config/:guildId', isAuthenticated, async (req, res) => {
    try {
        const config = await GuildConfig.findOneAndUpdate(
            { guildId: req.params.guildId },
            req.body,
            { new: true, upsert: true }
        );
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get server stats
router.get('/api/stats', isAuthenticated, async (req, res) => {
    try {
        const guildIds = req.user.guilds.map(g => g.id);
        const totalServers = guildIds.length;
        const totalApplications = await Application.countDocuments({ guildId: { $in: guildIds } });
        const totalApplicants = await Application.distinct('userId', { guildId: { $in: guildIds } });
        const totalTickets = await Ticket.countDocuments({ guildId: { $in: guildIds } });
        
        res.json({
            totalServers,
            totalApplications,
            totalApplicants: totalApplicants.length,
            totalTickets
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

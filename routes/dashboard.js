// Render the server settings page
router.get('/server/:id', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.id;
        const GuildConfig = require('../models/GuildConfig');
        const config = await GuildConfig.findOne({ guildId });
        
        // Fetch guild from Discord API
        const guild = await client.guilds.fetch(guildId);
        
        res.render('server', {
            title: 'Server Settings — Sentinel',
            user: req.session.user,
            isAuthenticated: true,
            guild: {
                id: guild.id,
                name: guild.name,
                icon: guild.icon,
                memberCount: guild.memberCount,
                channelCount: guild.channels.cache.size
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

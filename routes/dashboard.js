// ============ SERVER SETTINGS ============
router.get('/server/:id', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.id;
        const GuildConfig = require('../models/GuildConfig');
        const config = await GuildConfig.findOne({ guildId });
        
        // Fetch guild details from Discord API
        const response = await axios.get(`https://discord.com/api/guilds/${guildId}`, {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        const guild = response.data;
        
        // Check if user has admin permissions
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        const userGuild = guildsResponse.data.find(g => g.id === guildId);
        
        if (!userGuild || !(userGuild.permissions & 0x8)) {
            return res.status(403).render('error', {
                message: 'You do not have administrator access to this server.',
                title: 'Access Denied'
            });
        }
        
        // ✅ Generate bot invite link (with error handling)
        const clientId = process.env.DISCORD_CLIENT_ID || 'MISSING_CLIENT_ID';
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands`;
        
        console.log('🔧 Rendering server settings for:', guild.name);
        console.log('📋 Config:', config);
        console.log('🔗 Invite link:', inviteLink);
        
        res.render('server', {
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
        
    } catch (error) {
        console.error('❌ Error loading server settings:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        
        res.status(500).render('error', {
            message: 'Failed to load server settings. Error: ' + error.message,
            title: 'Error'
        });
    }
});

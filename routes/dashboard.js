// ============ SERVER SETTINGS ============
router.get('/server/:id', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.id;
        console.log('🔍 Loading server settings for guild:', guildId);
        
        // ✅ Check if token is valid before making API call
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
            console.warn('⚠️ GuildConfig model not found, creating fallback');
            GuildConfig = {
                findOne: async () => null,
                findOneAndUpdate: async () => ({})
            };
        }
        
        const config = await GuildConfig.findOne({ guildId }).catch(() => null);
        
        // Fetch guild details from Discord API
        const response = await axios.get(`https://discord.com/api/guilds/${guildId}`, {
            headers: {
                Authorization: `Bearer ${req.session.user.access_token}`
            }
        });
        
        const guild = response.data;
        console.log('✅ Guild found:', guild.name);
        
        // ✅ Generate bot invite link (with proper client ID)
        const clientId = process.env.DISCORD_CLIENT_ID || '1493217033956102215';
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&integration_type=0&scope=bot+applications.commands`;
        
        // ✅ Check if bot is already in the server
        const botInServer = guild.members?.some(m => m.id === clientId) || false;
        
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
            inviteLink: inviteLink,
            botInServer: botInServer // ✅ Pass this to the view
        });
        
    } catch (error) {
        console.error('❌ Error loading server settings:', error.message);
        
        // ✅ If token expired, redirect to login
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('🔄 Token invalid, redirecting to login');
            req.session.destroy(() => {
                res.redirect('/auth/login?error=session_expired');
            });
            return;
        }
        
        res.status(500).render('error', {
            message: 'Failed to load server settings: ' + error.message,
            title: 'Error'
        });
    }
});

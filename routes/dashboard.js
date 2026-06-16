const express = require('express');
const router = express.Router();
const axios = require('axios');
const GuildConfig = require('../models/GuildConfig');

// ─── Auth Middleware ──────────────────────────────────────────────
function ensureAuth(req, res, next) {
  console.log('🔍 Checking session...');
  console.log('🔍 User:', req.session?.user?.username || 'None');
  
  if (req.session.user) {
    console.log('✅ User is logged in!');
    return next();
  }
  
  console.log('❌ Not logged in, redirecting to /login');
  res.redirect('/login');
}

// ─── Home ──────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/servers');
  } else {
    res.render('login', { user: null });
  }
});

// ─── Servers List ──────────────────────────────────────────────────
router.get('/servers', ensureAuth, async (req, res) => {
  try {
    console.log('📋 Fetching servers for user:', req.session.user.username);
    
    // Get user's guilds from session
    const guilds = req.session.guilds || [];
    
    // ─── FILTER: Only show servers where user has ADMIN (0x8) ───
    const adminGuilds = guilds.filter(g => 
      (g.permissions & 0x8) === 0x8  // Administrator permission
    );
    
    console.log('📋 Total guilds:', guilds.length);
    console.log('📋 Admin guilds:', adminGuilds.length);
    
    res.render('servers', { 
      user: req.session.user, 
      guilds: adminGuilds 
    });
  } catch (err) {
    console.error('❌ Error fetching servers:', err);
    res.redirect('/login');
  }
});

// ─── Server Config Page ────────────────────────────────────────────
router.get('/servers/:guildId', ensureAuth, async (req, res) => {
  try {
    const guildId = req.params.guildId;
    const guild = req.session.guilds?.find(g => g.id === guildId);
    
    if (!guild) {
      return res.redirect('/servers');
    }
    
    // Get config from database
    let config = await GuildConfig.findOne({ guildId });
    if (!config) {
      config = {
        prefix: '!',
        welcomeChannel: '',
        welcomeMessage: 'Welcome {user} to {server}!',
        logChannel: '',
        modLevel: 'off',
        autoMod: false,
        logJoinLeave: false,
        logMessageDelete: false
      };
    }
    
    // Get channels from Discord API
    const channelsRes = await axios.get(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    );
    
    const textChannels = channelsRes.data.filter(c => c.type === 0);
    
    res.render('server', {
      user: req.session.user,
      guild: guild,
      config: config,
      textChannels: textChannels
    });
  } catch (err) {
    console.error('❌ Error loading server config:', err);
    res.redirect('/servers');
  }
});

// ─── Save Config ────────────────────────────────────────────────────
router.post('/api/servers/:guildId/config', ensureAuth, async (req, res) => {
  try {
    const guildId = req.params.guildId;
    const data = req.body;
    
    await GuildConfig.findOneAndUpdate(
      { guildId },
      {
        prefix: data.prefix || '!',
        welcomeChannel: data.welcomeChannel || '',
        welcomeMessage: data.welcomeMessage || 'Welcome {user} to {server}!',
        logChannel: data.logChannel || '',
        modLevel: data.modLevel || 'off',
        autoMod: data.autoMod === 'true' || data.autoMod === true,
        logJoinLeave: data.logJoinLeave === 'true' || data.logJoinLeave === true,
        logMessageDelete: data.logMessageDelete === 'true' || data.logMessageDelete === true,
        updatedAt: new Date()
      },
      { upsert: true }
    );
    
    res.json({ success: true, message: 'Settings saved successfully!' });
  } catch (err) {
    console.error('❌ Error saving config:', err);
    res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

// ─── Get Stats ──────────────────────────────────────────────────────
router.get('/api/servers/:guildId/stats', ensureAuth, async (req, res) => {
  try {
    const guildId = req.params.guildId;
    
    // Get guild info from Discord API
    const guildRes = await axios.get(
      `https://discord.com/api/v10/guilds/${guildId}`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    );
    
    res.json({
      success: true,
      stats: {
        memberCount: guildRes.data.approximate_member_count || 0,
        botOnline: true,
        channelCount: 0 // You can add more stats here
      }
    });
  } catch (err) {
    console.error('❌ Error fetching stats:', err);
    res.json({ 
      success: false, 
      stats: { memberCount: 0, botOnline: false, channelCount: 0 }
    });
  }
});

// ─── Invite Link ────────────────────────────────────────────────────
router.get('/invite', (req, res) => {
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
  res.redirect(inviteUrl);
});

module.exports = router;

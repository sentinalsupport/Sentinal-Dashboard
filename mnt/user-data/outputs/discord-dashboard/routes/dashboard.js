const express = require('express');
const axios = require('axios');
const router = express.Router();
const GuildConfig = require('../models/GuildConfig');

const DISCORD_API = 'https://discord.com/api/v10';

// Middleware: require authentication
function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/login');
}

// GET / — redirect based on auth state
router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/servers');
  }
  res.redirect('/login');
});

// GET /servers — show admin servers where bot is present
router.get('/servers', ensureAuth, async (req, res) => {
  try {
    const userGuilds = req.session.guilds || [];

    // Filter to guilds where user has MANAGE_GUILD (0x20) permission
    const adminGuilds = userGuilds.filter(g => {
      const perms = BigInt(g.permissions);
      return (perms & BigInt(0x20)) === BigInt(0x20) || g.owner;
    });

    // Check which guilds have the bot using bot token
    let botGuilds = [];
    try {
      if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
        const botGuildsRes = await axios.get(`${DISCORD_API}/users/@me/guilds`, {
          headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        });
        botGuilds = botGuildsRes.data.map(g => g.id);
      }
    } catch (e) {
      console.warn('Could not fetch bot guilds:', e.message);
    }

    // Annotate with bot presence
    const guilds = adminGuilds.map(g => ({
      ...g,
      botPresent: botGuilds.includes(g.id),
      iconUrl: g.icon
        ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
        : null,
    }));

    res.render('servers', { user: req.session.user, guilds });
  } catch (err) {
    console.error('Servers route error:', err);
    res.status(500).render('error', {
      code: 500,
      message: 'Failed to load servers.',
      detail: err.message,
    });
  }
});

// GET /servers/:guildId — server config page
router.get('/servers/:guildId', ensureAuth, async (req, res) => {
  const { guildId } = req.params;

  try {
    // Verify user has access to this guild
    const userGuilds = req.session.guilds || [];
    const guild = userGuilds.find(g => g.id === guildId);
    if (!guild) {
      return res.status(403).render('error', {
        code: 403,
        message: 'Access denied.',
        detail: 'You do not have permission to manage this server.',
      });
    }

    // Load or create config
    let config = await GuildConfig.findOne({ guildId });
    if (!config) {
      config = new GuildConfig({ guildId });
    }

    // Fetch guild channels from Discord API (if bot token available)
    let channels = [];
    try {
      if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
        const channelsRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/channels`, {
          headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        });
        channels = channelsRes.data
          .filter(c => c.type === 0) // text channels only
          .sort((a, b) => a.position - b.position);
      }
    } catch (e) {
      console.warn('Could not fetch channels:', e.message);
    }

    const guildData = {
      ...guild,
      iconUrl: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : null,
    };

    res.render('server', {
      user: req.session.user,
      guild: guildData,
      config,
      channels,
    });
  } catch (err) {
    console.error('Server config route error:', err);
    res.status(500).render('error', {
      code: 500,
      message: 'Failed to load server config.',
      detail: err.message,
    });
  }
});

// POST /api/servers/:guildId/config — save config to MongoDB
router.post('/api/servers/:guildId/config', ensureAuth, async (req, res) => {
  const { guildId } = req.params;

  try {
    // Verify user has access
    const userGuilds = req.session.guilds || [];
    const guild = userGuilds.find(g => g.id === guildId);
    if (!guild) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const {
      prefix,
      welcomeChannel,
      welcomeMessage,
      logChannel,
      modLevel,
      autoMod,
      logJoinLeave,
      logMessageDelete,
    } = req.body;

    const config = await GuildConfig.findOneAndUpdate(
      { guildId },
      {
        guildId,
        prefix: prefix || '!',
        welcomeChannel: welcomeChannel || '',
        welcomeMessage: welcomeMessage || '',
        logChannel: logChannel || '',
        modLevel: modLevel || 'off',
        autoMod: autoMod === 'true' || autoMod === true,
        logJoinLeave: logJoinLeave === 'true' || logJoinLeave === true,
        logMessageDelete: logMessageDelete === 'true' || logMessageDelete === true,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, config });
  } catch (err) {
    console.error('Save config error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/servers/:guildId/stats — member count and bot status
router.get('/api/servers/:guildId/stats', ensureAuth, async (req, res) => {
  const { guildId } = req.params;

  try {
    const userGuilds = req.session.guilds || [];
    const guild = userGuilds.find(g => g.id === guildId);
    if (!guild) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    let memberCount = guild.approximate_member_count || null;
    let botPresent = false;
    let guildName = guild.name;

    try {
      if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
        const guildRes = await axios.get(`${DISCORD_API}/guilds/${guildId}?with_counts=true`, {
          headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        });
        memberCount = guildRes.data.approximate_member_count || guildRes.data.member_count;
        guildName = guildRes.data.name;
        botPresent = true;
      }
    } catch (e) {
      botPresent = false;
    }

    res.json({ guildId, guildName, memberCount, botPresent });
  } catch (err) {
    console.error('Stats route error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /invite — generate bot invite link
router.get('/invite', ensureAuth, (req, res) => {
  const permissions = 8; // Administrator — adjust as needed
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    scope: 'bot applications.commands',
    permissions: permissions.toString(),
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

// GET /invite/:guildId — invite bot to a specific server
router.get('/invite/:guildId', ensureAuth, (req, res) => {
  const { guildId } = req.params;
  const permissions = 8;
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    scope: 'bot applications.commands',
    permissions: permissions.toString(),
    guild_id: guildId,
    disable_guild_select: 'true',
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

module.exports = router;

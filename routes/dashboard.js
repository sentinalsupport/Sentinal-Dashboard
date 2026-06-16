const express = require('express');
const router = express.Router();
const axios = require('axios');

// ─── Auth Middleware ──────────────────────────────────────────────
function ensureAuth(req, res, next) {
  console.log('🔍 Checking session...');
  console.log('🔍 Session ID:', req.session.id);
  console.log('🔍 User data:', req.session.user);
  
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
    res.render('servers', { 
      user: req.session.user, 
      guilds: req.session.guilds || [] 
    });
  } catch (err) {
    console.error('❌ Error fetching servers:', err);
    res.redirect('/login');
  }
});

// ─── Server Config ──────────────────────────────────────────────────
router.get('/servers/:guildId', ensureAuth, async (req, res) => {
  try {
    const guildId = req.params.guildId;
    const guild = req.session.guilds?.find(g => g.id === guildId);
    
    if (!guild) {
      return res.redirect('/servers');
    }
    
    res.render('server', {
      user: req.session.user,
      guild: guild,
      config: {
        prefix: '!',
        welcomeChannel: '',
        welcomeMessage: '',
        logChannel: '',
        modLevel: 'off',
        autoMod: false,
        logJoinLeave: false,
        logMessageDelete: false
      }
    });
  } catch (err) {
    console.error(err);
    res.redirect('/servers');
  }
});

// ─── Save Config ──────────────────────────────────────────────────
router.post('/api/servers/:guildId/config', ensureAuth, async (req, res) => {
  res.json({ success: true, message: 'Settings saved!' });
});

// ─── Stats ──────────────────────────────────────────────────────────
router.get('/api/servers/:guildId/stats', ensureAuth, async (req, res) => {
  res.json({ success: true, stats: { memberCount: 0, botOnline: true } });
});

// ─── Invite ──────────────────────────────────────────────────────────
router.get('/invite', (req, res) => {
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
  res.redirect(inviteUrl);
});

module.exports = router;

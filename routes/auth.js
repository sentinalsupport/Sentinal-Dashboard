const express = require('express');
const axios = require('axios');
const router = express.Router();

const DISCORD_API = 'https://discord.com/api/v10';
const SCOPES = 'identify guilds';

// ─── Login ─────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
  });
  res.redirect(`${DISCORD_API}/oauth2/authorize?${params}`);
});

// ─── Callback ─────────────────────────────────────────────────────
router.get('/auth/discord/callback', async (req, res) => {
  const { code, error } = req.query;
  
  console.log('🔍 Callback received!');
  console.log('🔍 Code:', code ? '✅ Present' : '❌ Missing');
  console.log('🔍 Error:', error || 'None');

  if (error || !code) {
    console.log('❌ No code or error, redirecting to /login');
    return res.redirect('/login');
  }

  try {
    console.log('🔄 Exchanging code for token...');
    
    const tokenRes = await axios.post(
      `${DISCORD_API}/oauth2/token`,
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, token_type } = tokenRes.data;
    console.log('✅ Token received!');

    // Fetch user info
    const userRes = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `${token_type} ${access_token}` },
    });

    // Fetch user's guilds
    const guildsRes = await axios.get(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `${token_type} ${access_token}` },
    });

    console.log('✅ User data fetched:', userRes.data.username);

    // Store in session
    req.session.user = userRes.data;
    req.session.accessToken = access_token;
    req.session.guilds = guildsRes.data;

    // ─── FORCE SAVE SESSION ──────────────────────────────────────
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.redirect('/login');
      }
      console.log('✅ Session saved successfully!');
      console.log('✅ Session ID:', req.session.id);
      console.log('✅ Redirecting to /servers');
      res.redirect('/servers');
    });
    
  } catch (err) {
    console.error('❌ OAuth callback error:', err.response?.data || err.message);
    res.redirect('/login');
  }
});

// ─── Logout ────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/');
  });
});

module.exports = router;

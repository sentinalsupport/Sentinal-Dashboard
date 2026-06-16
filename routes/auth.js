router.get('/auth/discord/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error || !code) {
    return res.redirect('/login');
  }

  try {
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

    const userRes = await axios.get(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `${token_type} ${access_token}` },
    });

    const guildsRes = await axios.get(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `${token_type} ${access_token}` },
    });

    req.session.user = userRes.data;
    req.session.accessToken = access_token;
    req.session.guilds = guildsRes.data;

    // ─── FORCE SAVE SESSION ──────────────────────────────────
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.redirect('/login');
      }
      console.log('✅ Session saved! User:', req.session.user.username);
      console.log('✅ Session ID:', req.session.id);
      res.redirect('/servers');
    });
    
  } catch (err) {
    console.error('❌ OAuth error:', err.response?.data || err.message);
    res.redirect('/login');
  }
});

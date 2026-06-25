// ============ LOGIN PAGE ============
router.get('/login', (req, res) => {
    // ✅ Clear any existing session on login page
    if (req.session.user) {
        req.session.destroy(() => {});
    }
    
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    
    res.render('login', {
        title: 'Login — Sentinal',
        discordAuthUrl: discordAuthUrl,
        user: null,
        error: req.query.error || null
    });
});

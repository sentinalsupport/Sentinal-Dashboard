const express = require('express');
const router = express.Router();
const axios = require('axios');

// ============ DISCORD OAUTH2 CONFIG ============
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';

// ============ LOGIN PAGE ============
router.get('/login', (req, res) => {
    // Check if user is already logged in
    if (req.session && req.session.user) {
        return res.redirect('/servers');
    }
    
    // Build the Discord OAuth URL
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    
    // Pass any error from query params
    const error = req.query.error || null;
    
    res.render('login', {
        title: 'Login — Sentinal',
        discordAuthUrl: discordAuthUrl,
        error: error,
        user: null,
        isAuthenticated: false
    });
});

// ============ DISCORD OAUTH REDIRECT ============
router.get('/discord', (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    res.redirect(discordAuthUrl);
});

// ============ CALLBACK ============
router.get('/discord/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect('/auth/login?error=no_code');
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, token_type, expires_in } = tokenResponse.data;

        // Get user info
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `${token_type} ${access_token}`
            }
        });

        const user = userResponse.data;

        // Get user guilds
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `${token_type} ${access_token}`
            }
        });

        // Store user in session
        req.session.user = {
            id: user.id,
            username: user.username,
            global_name: user.global_name,
            avatar: user.avatar,
            discriminator: user.discriminator,
            access_token: access_token,
            token_type: token_type,
            expires_in: expires_in,
            token_expires: Date.now() + (expires_in * 1000),
            guilds: guildsResponse.data
        };

        res.redirect('/servers');
    } catch (error) {
        console.error('❌ OAuth error:', error.response?.data || error.message);
        res.redirect('/auth/login?error=auth_failed');
    }
});

// ============ LOGOUT ============
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const axios = require('axios');

// ============ CONFIGURATION ============
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://sentinal-dashboard.onrender.com/auth/discord/callback';

// ============ LOGIN PAGE ============
router.get('/login', (req, res) => {
    // Clear any existing session on login page
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

// ============ DISCORD OAUTH2 CALLBACK ============
router.get('/discord/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.redirect('/auth/login');
    }
    
    try {
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const user = userResponse.data;
        
        // Store user in session with token expiry info
        req.session.user = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            global_name: user.global_name,
            access_token: access_token,
            refresh_token: refresh_token,
            token_expires: Date.now() + (expires_in * 1000)
        };
        
        console.log('👤 User logged in:', req.session.user.username);
        console.log('📝 Token expires:', new Date(req.session.user.token_expires).toLocaleString());
        
        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error:', err);
                return res.redirect('/auth/login?error=session_failed');
            }
            console.log('✅ Session saved, redirecting to dashboard');
            return res.redirect('/dashboard');
        });
        
    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error_description || 'Authentication failed. Please try again.';
        return res.redirect(`/auth/login?error=${encodeURIComponent(errorMessage)}`);
    }
});

// ============ LOGOUT ============
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;

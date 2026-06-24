const express = require('express');
const router = express.Router();
const axios = require('axios');

// ============ CONFIGURATION ============
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://sentinal-dashboard.onrender.com/auth/discord/callback';
const GUILD_ID = process.env.GUILD_ID;

// ============ LOGIN PAGE ============
router.get('/login', (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    
    res.render('login', {
        title: 'Login — Sentinal',
        discordAuthUrl: discordAuthUrl,
        user: req.session.user || null,
        error: req.query.error || null
    });
});

// ============ DISCORD OAUTH2 CALLBACK ============
router.get('/discord/callback', async (req, res) => {
    const { code } = req.query;
    
    // If no code, redirect to login
    if (!code) {
        return res.redirect('/auth/login');
    }
    
    try {
        // Step 1: Exchange code for access token
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
        
        const { access_token } = tokenResponse.data;
        
        // Step 2: Get user info
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const user = userResponse.data;
        
        // Step 3: Get user's guilds to check admin permissions
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const guilds = guildsResponse.data;
        const adminGuild = guilds.find(g => g.id === GUILD_ID && (g.permissions & 0x8));
        
        // Step 4: Check if user is an admin
        if (!adminGuild) {
            return res.render('login', {
                title: 'Login — Sentinal',
                discordAuthUrl: `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`,
                error: 'You do not have administrator access to this server.',
                user: null
            });
        }
        
        // Step 5: Store user in session
        req.session.user = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            global_name: user.global_name,
            access_token: access_token
        };
        
        // Step 6: Redirect to dashboard
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        
        // Handle specific errors
        const errorMessage = error.response?.data?.error_description || 'Authentication failed. Please try again.';
        
        res.render('login', {
            title: 'Login — Sentinal',
            discordAuthUrl: `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`,
            error: errorMessage,
            user: null
        });
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

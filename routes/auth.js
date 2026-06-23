const express = require('express');
const router = express.Router();
const axios = require('axios');

// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://your-app.onrender.com/auth/discord/callback';

// Login page
router.get('/login', (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    res.render('login', { 
        discordAuthUrl,
        title: 'Login'
    });
});

// Discord OAuth2 callback
router.get('/discord/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.redirect('/auth/login');
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                code,
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
        
        // Get user info
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const user = userResponse.data;
        
        // Check if user has admin permissions for your server
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const guilds = guildsResponse.data;
        const adminGuild = guilds.find(g => g.id === process.env.GUILD_ID && (g.permissions & 0x8));
        
        if (!adminGuild) {
            return res.render('error', {
                message: 'You do not have administrator access to this server.',
                title: 'Access Denied'
            });
        }
        
        // Store user in session
        req.session.user = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            global_name: user.global_name,
            access_token: access_token
        };
        
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        res.render('error', {
            message: 'Authentication failed. Please try again.',
            title: 'Login Error'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;

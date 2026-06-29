const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

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

    // ✅ Generate state parameter for security
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauth_state = state;

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds&state=${state}`;

    res.render('login', {
        title: 'Login — Sentinal',
        discordAuthUrl: discordAuthUrl,
        user: null,
        error: req.query.error || null
    });
});

// ============ DISCORD OAUTH2 CALLBACK ============
router.get('/discord/callback', async (req, res) => {
    const { code, state } = req.query;

    // ✅ Verify state parameter to prevent CSRF
    if (!state || state !== req.session.oauth_state) {
        console.log('❌ Invalid state parameter');
        return res.redirect('/auth/login?error=invalid_state');
    }

    if (!code) {
        return res.redirect('/auth/login');
    }

    // ✅ Check if user already has a valid session
    if (req.session.user) {
        return res.redirect('/dashboard');
    }

    try {
        console.log('🔄 Exchanging code for token...');

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
        console.log('✅ Token received, expires in:', expires_in, 'seconds');

        // Get user info
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const user = userResponse.data;
        console.log('👤 User logged in:', user.username);

        // ✅ Get user's guilds to check admin permissions
        try {
            const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
            console.log('✅ Found', guildsResponse.data.length, 'guilds');
        } catch (guildError) {
            console.warn('⚠️ Could not fetch guilds:', guildError.message);
        }

        const tokenExpiry = Date.now() + (expires_in * 1000);
        console.log('📝 Token expires at:', new Date(tokenExpiry).toLocaleString());

        // ✅ Store user in session
        req.session.user = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator || '0',
            avatar: user.avatar,
            global_name: user.global_name || user.username,
            access_token: access_token,
            refresh_token: refresh_token,
            token_expires: tokenExpiry
        };

        // ✅ Clear the state after successful login
        req.session.oauth_state = null;

        // ✅ Save session and redirect
        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error:', err);
                return res.redirect('/auth/login?error=session_failed');
            }
            console.log('✅ Session saved successfully');
            console.log('📝 Session ID:', req.session.id);
            console.log('🔗 Redirecting to /dashboard');
            return res.redirect('/dashboard');
        });

    } catch (error) {
        console.error('❌ OAuth error:', error.response?.data || error.message);

        // ✅ Handle specific errors
        let errorMessage = 'Authentication failed. Please try again.';

        if (error.response?.data?.error === 'invalid_grant') {
            console.log('⚠️ Invalid grant - code already used or expired');
            errorMessage = 'The authorization code has expired or was already used. Please try logging in again.';
        } else if (error.response?.data?.error === 'invalid_client') {
            console.log('⚠️ Invalid client - check CLIENT_ID and CLIENT_SECRET');
            errorMessage = 'Invalid client credentials. Please contact support.';
        } else if (error.response?.data?.error_description) {
            errorMessage = error.response.data.error_description;
        }

        // ✅ Clear session on error
        req.session.destroy(() => {
            res.redirect(`/auth/login?error=${encodeURIComponent(errorMessage)}`);
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

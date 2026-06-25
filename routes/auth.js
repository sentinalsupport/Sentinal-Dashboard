// ============ DISCORD OAUTH2 CALLBACK ============
router.get('/discord/callback', async (req, res) => {
    const { code } = req.query;
    
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
        
        // Step 3: Store user in session
        req.session.user = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            global_name: user.global_name,
            access_token: access_token
        };
        
        // Step 4: ✅ SAVE SESSION BEFORE REDIRECT
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

// In the /server/:id route, replace the 401 handling with:

if (error.response?.status === 401) {
    console.log('🔄 Token invalid, attempting to refresh...');
    
    try {
        const refreshToken = req.session.user.refresh_token;
        if (refreshToken) {
            const tokenData = await refreshAccessToken(refreshToken);
            
            // Update session with new tokens
            req.session.user.access_token = tokenData.access_token;
            req.session.user.token_expires = Date.now() + (tokenData.expires_in * 1000);
            
            if (tokenData.refresh_token) {
                req.session.user.refresh_token = tokenData.refresh_token;
            }
            
            console.log('✅ Token refreshed, retrying request...');
            
            // Retry the request with new token
            const retryResponse = await axios.get(`https://discord.com/api/guilds/${guildId}`, {
                headers: {
                    Authorization: `Bearer ${req.session.user.access_token}`
                }
            });
            
            const guild = retryResponse.data;
            // ... continue with rendering
            
            req.session.save((err) => {
                if (err) console.error('Session save error:', err);
            });
            
            // Render the page with the new data
            return res.render('server', {
                // ... your render data
            });
            
        } else {
            throw new Error('No refresh token available');
        }
    } catch (refreshError) {
        console.error('❌ Refresh failed:', refreshError.message);
        req.session.destroy(() => {
            res.redirect('/auth/login?error=session_expired');
        });
        return;
    }
}

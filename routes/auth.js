const express = require('express');
const router = express.Router();
const passport = require('passport');

// =============================================
// ====== LOGIN ======
// =============================================

// Login page
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    res.render('login', { 
        title: 'Login - Sentinal',
        isAuthenticated: false 
    });
});

// Start Discord OAuth
router.get('/auth/discord', 
    passport.authenticate('discord', { 
        scope: ['identify', 'guilds', 'email'] 
    })
);

// Discord OAuth callback
router.get('/auth/discord/callback', 
    passport.authenticate('discord', { 
        failureRedirect: '/login',
        successRedirect: '/dashboard'
    })
);

// =============================================
// ====== LOGOUT ======
// =============================================

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        req.session.destroy(() => {
            res.redirect('/login');
        });
    });
});

module.exports = router;

// ============ PANELS PAGE ============
router.get('/panels', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.query.guildId;
        console.log('📋 Loading panels for guild:', guildId);
        
        // Fetch panels from database (you'll need a Panel model)
        const Panel = require('../models/Panel');
        const panels = await Panel.find({ guildId }).catch(() => []);
        
        res.render('panels', {
            title: 'Panels — Sentinal',
            user: req.session.user,
            guild: { id: guildId || 'unknown' },
            panels: panels
        });
    } catch (error) {
        console.error('Error loading panels:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load panels',
            title: 'Error'
        });
    }
});

// ============ API: CREATE PANEL ============
router.post('/api/panels', isAuthenticated, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.create(req.body);
        res.json({ success: true, panel: panel });
    } catch (error) {
        console.error('Error creating panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: TOGGLE PANEL ============
router.post('/api/panels/:id/toggle', isAuthenticated, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        const panel = await Panel.findById(req.params.id);
        if (!panel) {
            return res.status(404).json({ success: false, error: 'Panel not found' });
        }
        panel.enabled = !panel.enabled;
        await panel.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error toggling panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ API: DELETE PANEL ============
router.delete('/api/panels/:id', isAuthenticated, async (req, res) => {
    try {
        const Panel = require('../models/Panel');
        await Panel.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting panel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

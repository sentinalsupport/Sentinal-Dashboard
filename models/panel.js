const mongoose = require('mongoose');

const PanelSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    channel: { type: String, default: '' },
    applicationId: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Panel', PanelSchema);

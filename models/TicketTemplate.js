const mongoose = require('mongoose');

const TicketTemplateSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'support' },
    description: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TicketTemplate', TicketTemplateSchema);

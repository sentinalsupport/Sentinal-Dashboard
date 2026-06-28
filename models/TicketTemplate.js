const mongoose = require('mongoose');

const TicketTemplateSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'support' },
    channelName: { type: String, default: '{ticket-creator-username}-{total-tickets-opened}' },
    maxTickets: { type: Number, default: 3 },
    blockedRoles: { type: [String], default: [] },
    requiredRoles: { type: [String], default: [] },
    supportRoles: { type: [String], default: [] },
    ticketClaiming: { type: Boolean, default: true },
    actionOnLeave: { type: String, default: 'nothing' },
    pingSupport: { type: Boolean, default: true },
    rateSupport: { type: Boolean, default: false },
    formDescription: { type: String, default: 'Please explain your issue in full detail' },
    questions: { type: [Object], default: [] },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TicketTemplate', TicketTemplateSchema);

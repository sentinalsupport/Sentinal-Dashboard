const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, default: '!' },
    language: { type: String, default: 'en' },
    modLogChannel: { type: String, default: '' },
    memberLogChannel: { type: String, default: '' },
    mutedRole: { type: String, default: '' },
    adminRoles: { type: [String], default: [] },
    applicationChannel: { type: String, default: '' },
    reviewerRole: { type: String, default: '' },
    ticketCategory: { type: String, default: '' },
    ticketSupportRole: { type: String, default: '' },
    giveawayChannel: { type: String, default: '' },
    verificationChannel: { type: String, default: '' },
    verificationRole: { type: String, default: '' },
    verificationEnabled: { type: Boolean, default: false },
    dashboardEnabled: { type: Boolean, default: true },
    enabledFeatures: { type: [String], default: ['applications', 'tickets', 'verification'] },
    premium: { type: Boolean, default: false },
    premiumExpiry: { type: Date, default: null },
    welcomeChannel: { type: String, default: '' },
    welcomeMessage: { type: String, default: 'Welcome {user} to {server}!' },
    autorole: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GuildConfig', GuildConfigSchema);

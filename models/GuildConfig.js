const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    prefix: {
        type: String,
        default: '!',
    },
    modLogChannel: {
        type: String,
        default: null,
    },
    memberLogChannel: {
        type: String,
        default: null,
    },
    welcomeChannel: {
        type: String,
        default: null,
    },
    welcomeMessage: {
        type: String,
        default: 'Welcome {user} to {server}!',
    },
    autorole: {
        type: String,
        default: null,
    },
    mutedRole: {
        type: String,
        default: null,
    },
    verificationChannel: {
        type: String,
        default: null,
    },
    verificationRole: {
        type: String,
        default: null,
    },
    verificationEnabled: {
        type: Boolean,
        default: false,
    },
    ticketCategory: {
        type: String,
        default: null,
    },
    ticketSupportRole: {
        type: String,
        default: null,
    },
    applicationChannel: {
        type: String,
        default: null,
    },
    giveawayChannel: {
        type: String,
        default: null,
    },
    xpEnabled: {
        type: Boolean,
        default: true,
    },
    xpRate: {
        type: Number,
        default: 1.0,
    },
    premium: {
        type: Boolean,
        default: false,
    },
    premiumExpires: {
        type: Date,
        default: null,
    },
    enabledFeatures: {
        type: [String],
        default: ['applications', 'tickets', 'giveaways', 'verification'],
    },
    dashboardEnabled: {
        type: Boolean,
        default: true,
    },
    blacklisted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('GuildConfig', GuildConfigSchema);

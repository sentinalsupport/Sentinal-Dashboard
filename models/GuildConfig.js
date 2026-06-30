const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    prefix: {
        type: String,
        default: '!'
    },
    modLogChannel: {
        type: String,
        default: null
    },
    memberLogChannel: {
        type: String,
        default: null
    },
    welcomeChannel: {
        type: String,
        default: null
    },
    welcomeMessage: {
        type: String,
        default: 'Welcome {user} to {server}!'
    },
    // OLD - Keep for backward compatibility
    autorole: {
        type: String,
        default: null
    },
    mutedRole: {
        type: String,
        default: null
    },
    verificationChannel: {
        type: String,
        default: null
    },
    verificationRole: {
        type: String,
        default: null
    },
    verificationEnabled: {
        type: Boolean,
        default: false
    },
    ticketCategory: {
        type: String,
        default: null
    },
    ticketSupportRole: {
        type: String,
        default: null
    },
    applicationChannel: {
        type: String,
        default: null
    },
    giveawayChannel: {
        type: String,
        default: null
    },
    xpEnabled: {
        type: Boolean,
        default: true
    },
    xpRate: {
        type: Number,
        default: 1
    },
    premium: {
        type: Boolean,
        default: false
    },
    premiumExpires: {
        type: Date,
        default: null
    },
    enabledFeatures: {
        type: Array,
        default: ['dashboardEnabled']
    },
    dashboardEnabled: {
        type: Boolean,
        default: true
    },
    blacklisted: {
        type: Boolean,
        default: false
    },
    // ============ NEW AUTO ROLES ============
    autoRoles: {
        enabled: {
            type: Boolean,
            default: false
        },
        ignoreBots: {
            type: Boolean,
            default: true
        },
        roles: [{
            type: String
        }],
        maxRoles: {
            type: Number,
            default: 2
        }
    },
    // ============ TICKET CONFIG ============
    ticketLogChannel: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);

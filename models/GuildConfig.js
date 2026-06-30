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
    // ============ TICKET SETTINGS ============
    ticketCategory: {
        type: String,
        default: null
    },
    ticketSupportRole: {
        type: String,
        default: null
    },
    ticketLogChannel: {
        type: String,
        default: null
    },
    ticketTranscriptChannel: {
        type: String,
        default: null
    },
    // ============ AUTO ROLES ============
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
    // ============ OTHER ============
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

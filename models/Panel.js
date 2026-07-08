const mongoose = require('mongoose');

const PanelSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    channelId: {
        type: String,
        required: true
    },
    channelName: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['tickets', 'applications', 'verification', 'custom'],
        default: 'tickets'
    },
    enabled: {
        type: Boolean,
        default: true
    },
    message: {
        type: String,
        default: 'Need help? Click a button below to create a ticket.'
    },
    embed: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        color: { type: String, default: '#3DFFB8' },
        footer: { type: String, default: '' }
    },
    components: [{
        label: { type: String, default: '' },
        emoji: { type: String, default: '' },
        style: {
            type: String,
            enum: ['primary', 'secondary', 'success', 'danger'],
            default: 'primary'
        },
        templateId: { type: String, default: '' },
        enabled: { type: Boolean, default: true },
        color: { type: String, default: '#5865F2' }
    }],
    templates: [{
        type: String
    }],
    messageId: {
        type: String,
        default: null
    },
    syncStatus: {
        type: String,
        enum: ['pending', 'synced', 'failed'],
        default: 'pending'
    },
    ticketsOpened: {
        type: Number,
        default: 0
    },
    lastSent: {
        type: Date,
        default: null
    },
    lastUsed: {
        type: Date,
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

module.exports = mongoose.model('Panel', PanelSchema);

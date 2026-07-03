const mongoose = require('mongoose');

const panelSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'disabled', 'draft'],
        default: 'active'
    },
    
    // Discord Channel
    channelId: {
        type: String,
        required: true
    },
    channelName: {
        type: String,
        default: ''
    },
    
    // Panel Message
    message: {
        type: String,
        default: 'Need help? Click a button below to create a ticket.'
    },
    embed: {
        type: Object,
        default: null
    },
    
    // Components
    type: {
        type: String,
        enum: ['buttons', 'select'],
        default: 'buttons'
    },
    components: {
        type: [{
            type: { type: String, enum: ['button', 'select'] },
            label: String,
            emoji: String,
            style: { type: String, enum: ['primary', 'secondary', 'success', 'danger'] },
            templateId: String,
            templateName: String,
            confirmationRequired: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            placeholder: String,
            options: [{
                label: String,
                value: String,
                emoji: String,
                default: Boolean
            }]
        }],
        default: []
    },
    
    // Templates linked to this panel
    templates: {
        type: [String],
        default: []
    },
    
    // Statistics
    ticketsOpened: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date,
        default: null
    },
    
    // Discord Message
    messageId: {
        type: String,
        default: null
    },
    lastSent: {
        type: Date,
        default: null
    },
    syncStatus: {
        type: String,
        enum: ['synced', 'pending', 'deleted'],
        default: 'pending'
    },
    
    // Advanced Options
    requireVerificationRole: {
        type: String,
        default: ''
    },
    requireServerMembership: {
        type: Number,
        default: 0
    },
    cooldown: {
        type: Number,
        default: 0
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    anonymousTickets: {
        type: Boolean,
        default: false
    },
    requireConfirmation: {
        type: Boolean,
        default: true
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

module.exports = mongoose.model('Panel', panelSchema);

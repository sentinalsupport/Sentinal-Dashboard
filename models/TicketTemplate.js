const mongoose = require('mongoose');

const ticketTemplateSchema = new mongoose.Schema({
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
    
    // Ticket Appearance
    channelName: {
        type: String,
        default: 'ticket-{user}'
    },
    category: {
        type: String,
        default: ''
    },
    topic: {
        type: String,
        default: ''
    },
    
    // Permissions
    supportRoles: {
        type: [String],
        default: []
    },
    
    // Permission Options
    permissions: {
        viewTicket: { type: Boolean, default: true },
        sendMessages: { type: Boolean, default: true },
        manageMessages: { type: Boolean, default: false },
        closeTicket: { type: Boolean, default: true },
        deleteTicket: { type: Boolean, default: false },
        renameTicket: { type: Boolean, default: false },
        claimTicket: { type: Boolean, default: true }
    },
    
    // Ticket Limits
    maxTickets: {
        type: Number,
        default: 3
    },
    cooldown: {
        type: Number,
        default: 600
    },
    
    // Welcome Message
    welcomeMessage: {
        type: String,
        default: 'Welcome {mention}!\n\nA member of our support team will assist you shortly.'
    },
    
    // Auto Close
    autoClose: {
        enabled: { type: Boolean, default: false },
        timeout: { type: Number, default: 48 },
        reminder: { type: Number, default: 15 }
    },
    
    // Transcript Settings
    transcriptFormat: {
        type: String,
        enum: ['html', 'text', 'json'],
        default: 'html'
    },
    transcriptChannel: {
        type: String,
        default: ''
    },
    
    // Advanced Options
    pinWelcome: { type: Boolean, default: false },
    autoMentionSupport: { type: Boolean, default: true },
    lockOnClose: { type: Boolean, default: true },
    deleteOnClose: { type: Boolean, default: false },
    
    // Custom Buttons
    customButtons: {
        type: [{
            label: String,
            emoji: String,
            color: { type: String, enum: ['primary', 'secondary', 'success', 'danger'], default: 'primary' },
            templateId: String
        }],
        default: []
    },
    
    // Panel Associations
    panels: {
        type: [String],
        default: []
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

module.exports = mongoose.model('TicketTemplate', ticketTemplateSchema);

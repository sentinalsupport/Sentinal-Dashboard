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
    adminRoles: {
        type: [String],
        default: []
    },
    moderatorRoles: {
        type: [String],
        default: []
    },
    allowedUsers: {
        type: [String],
        default: []
    },
    allowedRoles: {
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
        default: 600 // seconds
    },
    minAccountAge: {
        type: Number,
        default: 0 // days
    },
    minServerMembership: {
        type: Number,
        default: 0 // days
    },
    preventDuplicates: {
        type: Boolean,
        default: false
    },
    
    // Welcome Message
    welcomeMessage: {
        type: String,
        default: 'Welcome {mention}!\n\nA member of our support team will assist you shortly.'
    },
    welcomeEmbed: {
        type: Object,
        default: null
    },
    
    // Ticket Actions
    actions: {
        close: { type: Boolean, default: true },
        reopen: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        claim: { type: Boolean, default: true },
        rename: { type: Boolean, default: false },
        transfer: { type: Boolean, default: false },
        addUser: { type: Boolean, default: false },
        removeUser: { type: Boolean, default: false },
        transcript: { type: Boolean, default: true },
        lock: { type: Boolean, default: false },
        unlock: { type: Boolean, default: false }
    },
    
    // Auto Close
    autoClose: {
        enabled: { type: Boolean, default: false },
        timeout: { type: Number, default: 48 }, // hours
        reminder: { type: Number, default: 15 } // minutes
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
    transcriptDestination: {
        type: String,
        enum: ['channel', 'dm', 'link'],
        default: 'channel'
    },
    
    // Logging
    logEvents: {
        created: { type: Boolean, default: true },
        closed: { type: Boolean, default: true },
        deleted: { type: Boolean, default: true },
        renamed: { type: Boolean, default: true },
        userAdded: { type: Boolean, default: true },
        userRemoved: { type: Boolean, default: true },
        claimed: { type: Boolean, default: true }
    },
    
    // Advanced Options
    autoArchive: { type: Boolean, default: false },
    lockOnClose: { type: Boolean, default: true },
    deleteOnClose: { type: Boolean, default: false },
    pinWelcome: { type: Boolean, default: false },
    autoMentionSupport: { type: Boolean, default: true },
    
    // Form
    formDescription: {
        type: String,
        default: ''
    },
    questions: {
        type: [{
            question: String,
            required: Boolean,
            type: { type: String, enum: ['text', 'number', 'boolean', 'select'] },
            options: [String]
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

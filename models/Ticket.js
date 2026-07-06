const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    channelId: {
        type: String,
        required: true,
        unique: true
    },
    templateId: {
        type: String,
        required: true
    },
    panelId: {
        type: String,
        default: null
    },
    
    // User Information
    userId: {
        type: String,
        required: true,
        index: true
    },
    username: {
        type: String,
        default: ''
    },
    
    // Ticket Status
    status: {
        type: String,
        enum: ['open', 'claimed', 'closed', 'archived'],
        default: 'open'
    },
    claimedBy: {
        type: String,
        default: null
    },
    claimedAt: {
        type: Date,
        default: null
    },
    closedBy: {
        type: String,
        default: null
    },
    closedAt: {
        type: Date,
        default: null
    },
    reason: {
        type: String,
        default: ''
    },
    
    // Metadata
    openedAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    
    // Auto Close
    autoCloseAt: {
        type: Date,
        default: null
    },
    autoCloseReminded: {
        type: Boolean,
        default: false
    },
    
    // Transcript
    transcriptId: {
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

module.exports = mongoose.model('Ticket', ticketSchema);

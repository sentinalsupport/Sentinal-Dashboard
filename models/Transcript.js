const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    ticketId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: ''
    },
    
    // Transcript Content
    format: {
        type: String,
        enum: ['html', 'text', 'json'],
        default: 'html'
    },
    content: {
        type: String,
        required: true
    },
    
    // Metadata
    messages: {
        type: [{
            userId: String,
            username: String,
            content: String,
            timestamp: Date,
            attachments: [String]
        }],
        default: []
    },
    
    openedAt: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date,
        default: Date.now
    },
    
    totalMessages: {
        type: Number,
        default: 0
    },
    participants: {
        type: [String],
        default: []
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transcript', transcriptSchema);

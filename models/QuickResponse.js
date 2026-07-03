const mongoose = require('mongoose');

const quickResponseSchema = new mongoose.Schema({
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
    content: {
        type: String,
        required: true
    },
    embed: {
        type: Object,
        default: null
    },
    enabled: {
        type: Boolean,
        default: true
    },
    shortcut: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'General'
    },
    useCount: {
        type: Number,
        default: 0
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

module.exports = mongoose.model('QuickResponse', quickResponseSchema);

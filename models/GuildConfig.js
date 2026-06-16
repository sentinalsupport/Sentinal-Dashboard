// FILE: models/GuildConfig.js
const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, default: '!' },
    welcomeChannel: { type: String, default: '' },
    welcomeMessage: { type: String, default: 'Welcome {user} to {server}!' },
    logChannel: { type: String, default: '' },
    modLevel: { type: String, enum: ['off', 'low', 'medium', 'high'], default: 'off' },
    autoMod: { type: Boolean, default: false },
    logJoinLeave: { type: Boolean, default: false },
    logMessageDelete: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);

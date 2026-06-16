const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  prefix: {
    type: String,
    default: '!',
    maxlength: 10,
  },
  welcomeChannel: {
    type: String,
    default: '',
  },
  welcomeMessage: {
    type: String,
    default: 'Welcome to the server, {user}!',
    maxlength: 2000,
  },
  logChannel: {
    type: String,
    default: '',
  },
  modLevel: {
    type: String,
    enum: ['off', 'low', 'medium', 'high'],
    default: 'off',
  },
  autoMod: {
    type: Boolean,
    default: false,
  },
  logJoinLeave: {
    type: Boolean,
    default: false,
  },
  logMessageDelete: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);

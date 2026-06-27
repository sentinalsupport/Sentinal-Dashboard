const mongoose = require('mongoose');

const ApplicationFormSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    questions: { type: [Object], default: [] },
    pendingChannel: { type: String, default: null },
    acceptedChannel: { type: String, default: null },
    deniedChannel: { type: String, default: null },
    acceptedMessage: { type: String, default: 'Your application for {applicationName} has been accepted!' },
    deniedMessage: { type: String, default: 'Your application for {applicationName} has been denied.' },
    confirmationMessage: { type: String, default: 'Are you sure you want to apply?' },
    completionMessage: { type: String, default: 'Your application has been submitted!' },
    cooldown: { type: Number, default: 0 },
    timeLimit: { type: Number, default: 180 },
    acceptedRoles: { type: [String], default: [] },
    deniedRoles: { type: [String], default: [] },
    requiredRoles: { type: [String], default: [] },
    restrictedRoles: { type: [String], default: [] },
    managerRoles: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ApplicationForm', ApplicationFormSchema);

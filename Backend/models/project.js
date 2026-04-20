const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    policyNumber: { type: String, required: true, unique: true },
    officerEmail: { type: String, required: true },
    directorEmail: { type: String, required: true },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    reminderSent: { type: Boolean, default: false }
});

module.exports = mongoose.model('Project', projectSchema);
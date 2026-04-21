const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    borrowerName: { type: String, required: true, trim: true },
    approvedLoan: { type: Number, required: true, min: 0 },
    outstandingLoan: { type: Number, required: true, min: 0 },
    listFixedAsset: { type: String, required: true },
    isInsured: { type: String, enum: ['Yes', 'No'], default: 'Yes' },
    assetCode: { 
        type: String, 
        unique: true, 
        sparse: true, // Allows nulls to be unique if assetCode is optional
        required: true,
        trim: true 
    },
    estimatedValueCollateral: { type: Number, default: 0 },
    estimationDate: { type: Date },
    sumInsured: { type: Number, default: 0 },
    insuredDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    typeInsurancePolicy: { type: String, default: '' },
    isDBEBeneficiary: { type: String, enum: ['Yes', 'No'], default: 'No' },
    insuranceCompany: { type: String, default: '' },
    officerEmail: { type: String, required: true },
    directorEmail: { type: String, required: true },
    reminder60DaysSent: { type: Boolean, default: false }, // New 60-day tracker
    reminder30DaysSent: { type: Boolean, default: false }  // Replaced old reminderSent
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
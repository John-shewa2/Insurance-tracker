const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    // Borrower & Loan Info
    borrowerName: { type: String, required: true },
    approvedLoan: { type: Number, required: true },
    outstandingLoan: { type: Number, required: true },
    
    // Asset & Collateral Info
    listFixedAsset: { type: String, required: true },
    isInsured: { type: String, enum: ['Yes', 'No'], default: 'No' },
    assetCode: { type: String },
    estimatedValueCollateral: { type: Number },
    estimationDate: { type: Date },
    sumInsured: { type: Number },
    
    // Insurance Specifics
    insuredDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true }, // "Expired Date" in your sheet
    typeInsurancePolicy: { type: String },
    isDBEBeneficiary: { type: String, enum: ['Yes', 'No'], default: 'No' },
    insuranceCompany: { type: String },

    // Notification Logic
    officerEmail: { type: String, required: true },
    directorEmail: { type: String, required: true },
    reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
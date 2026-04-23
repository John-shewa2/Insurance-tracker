const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    borrowerName: { type: String, required: true, trim: true },
    approvedLoan: { type: Number, required: true, min: 0 },
    listFixedAsset: { type: String, required: true },
    assetCode: { 
        type: String, 
        unique: false, 
        sparse: true, 
        required: false,
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
    remark: { type: String, default: '' },
    reminder60DaysSent: { type: Boolean, default: false },
    reminder30DaysSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

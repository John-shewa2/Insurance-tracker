const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { Resend } = require('resend');
require('dotenv').config();

const projectSchema = new mongoose.Schema({
    borrowerName: { type: String, required: true },
    approvedLoan: { type: Number, required: true },
    outstandingLoan: { type: Number, required: true },
    listFixedAsset: { type: String, required: true },
    isInsured: { type: String, default: 'Yes' },
    assetCode: { type: String, default: '' }, // Made optional
    estimatedValueCollateral: { type: Number, default: 0 }, // Made optional
    estimationDate: { type: Date }, // Made optional
    sumInsured: { type: Number, default: 0 },
    insuredDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    typeInsurancePolicy: { type: String, default: '' },
    isDBEBeneficiary: { type: String, default: 'No' },
    insuranceCompany: { type: String, default: '' },
    officerEmail: { type: String, required: true },
    directorEmail: { type: String, required: true },
    reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.error("❌ Connection Error:", err));

app.post('/api/projects/add', async (req, res) => {
    try {
        console.log("Incoming Data:", req.body); // Check your terminal for this!
        const newProject = new Project(req.body);
        const saved = await newProject.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("Validation Error:", err.message); // This tells you exactly what failed
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/projects/all', async (req, res) => {
    try {
        const projects = await Project.find().sort({ expiryDate: 1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

cron.schedule('0 9 * * *', async () => {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const expiring = await Project.find({
        expiryDate: {
            $gte: new Date(oneMonthFromNow.setHours(0,0,0,0)),
            $lte: new Date(oneMonthFromNow.setHours(23,59,59,999))
        },
        reminderSent: false
    });

    for (const project of expiring) {
        await resend.emails.send({
            from: 'Insurance Tracker <onboarding@resend.dev>',
            to: [project.officerEmail],
            cc: [project.directorEmail],
            subject: `Action Required: Renewal for ${project.borrowerName}`,
            html: `<p>Insurance for <b>${project.borrowerName}</b> expires on ${project.expiryDate.toDateString()}. Please renew.</p>`
        });
        project.reminderSent = true;
        await project.save();
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
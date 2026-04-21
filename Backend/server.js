const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
require('dotenv').config();

// Models
const Project = require('./models/project');
const User = require('./models/User');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.error("❌ Connection Error:", err));

// --- AUTHENTICATION ROUTES ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = new User({ name, email, password, role });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret_local_key', 
            { expiresIn: '8h' }
        );
        res.json({ token, role: user.role, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PROJECT ROUTES ---

// GET: All projects
app.get('/api/projects/all', async (req, res) => {
    try {
        const projects = await Project.find().sort({ expiryDate: 1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Add new project
app.post('/api/projects/add', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const saved = await newProject.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT: Update project
app.put('/api/projects/update/:id', async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE: Remove project
app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- EXPORT TO EXCEL ---

app.get('/api/projects/export', async (req, res) => {
    try {
        const projects = await Project.find().sort({ expiryDate: 1 });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Insurance Tracker');

        worksheet.columns = [
            { header: 'Borrower Name', key: 'borrowerName', width: 25 },
            { header: 'Approved Loan', key: 'approvedLoan', width: 15 },
            { header: 'Asset', key: 'listFixedAsset', width: 20 },
            { header: 'Asset Code', key: 'assetCode', width: 15 },
            { header: 'Expiry Date', key: 'expiryDate', width: 15 },
            { header: 'Sum Insured', key: 'sumInsured', width: 15 },
            { header: 'Responsible Officer', key: 'officerEmail', width: 25 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        projects.forEach(p => {
            const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            worksheet.addRow({
                borrowerName: p.borrowerName,
                approvedLoan: p.approvedLoan,
                listFixedAsset: p.listFixedAsset,
                assetCode: p.assetCode,
                expiryDate: new Date(p.expiryDate).toDateString(),
                sumInsured: p.sumInsured,
                officerEmail: p.officerEmail,
                status: days < 0 ? 'EXPIRED' : (days <= 60 ? 'CRITICAL' : 'ACTIVE')
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Insurance_Report.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- REMINDER CRON JOB (Daily at 9:00 AM) ---

cron.schedule('0 9 * * *', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check for 60-day reminders
    const date60Days = new Date(today);
    date60Days.setDate(today.getDate() + 60);

    const expiring60 = await Project.find({
        expiryDate: {
            $gte: new Date(date60Days.setHours(0,0,0,0)),
            $lte: new Date(date60Days.setHours(23,59,59,999))
        },
        reminder60DaysSent: false
    });

    for (const project of expiring60) {
        await resend.emails.send({
            from: 'Insurance Tracker <onboarding@resend.dev>',
            to: [project.officerEmail],
            cc: [project.directorEmail],
            subject: `60-Day Notice: Renewal for ${project.borrowerName}`,
            html: `<p><b>60-Day Advance Warning:</b> Insurance for <b>${project.borrowerName}</b> expires on ${project.expiryDate.toDateString()}.</p>`
        });
        project.reminder60DaysSent = true;
        await project.save();
    }

    // 2. Check for 30-day reminders
    const date30Days = new Date(today);
    date30Days.setDate(today.getDate() + 30);

    const expiring30 = await Project.find({
        expiryDate: {
            $gte: new Date(date30Days.setHours(0,0,0,0)),
            $lte: new Date(date30Days.setHours(23,59,59,999))
        },
        reminder30DaysSent: false
    });

    for (const project of expiring30) {
        await resend.emails.send({
            from: 'Insurance Tracker <onboarding@resend.dev>',
            to: [project.officerEmail],
            cc: [project.directorEmail],
            subject: `30-Day Notice: Renewal for ${project.borrowerName}`,
            html: `<p><b>Final 30-Day Notice:</b> Insurance for <b>${project.borrowerName}</b> expires on ${project.expiryDate.toDateString()}. Action required immediately.</p>`
        });
        project.reminder30DaysSent = true;
        await project.save();
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
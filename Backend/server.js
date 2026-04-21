const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
require('dotenv').config();

const Project = require('./models/project');
const User = require('./models/User');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ DB Connected"))
    .catch(err => console.error(err));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: "Invalid" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    res.json({ token, role: user.role, name: user.name });
});

// Project Routes
app.get('/api/projects/all', async (req, res) => res.json(await Project.find().sort({ expiryDate: 1 })));
app.post('/api/projects/add', async (req, res) => res.status(201).json(await new Project(req.body).save()));
app.put('/api/projects/update/:id', async (req, res) => res.json(await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/api/projects/:id', async (req, res) => { await Project.findByIdAndDelete(req.params.id); res.json({ m: "ok" }); });

// Export
app.get('/api/projects/export', async (req, res) => {
    const projects = await Project.find();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    sheet.columns = [
        { header: 'Borrower', key: 'b', width: 25 },
        { header: 'Asset', key: 'a', width: 20 },
        { header: 'Expiry', key: 'e', width: 15 },
        { header: 'Officer', key: 'o', width: 25 }
    ];
    projects.forEach(p => sheet.addRow({ b: p.borrowerName, a: p.listFixedAsset, e: p.expiryDate.toDateString(), o: p.officerEmail }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
});

// Reminder Logic
cron.schedule('0 9 * * *', async () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const windows = [{ d: 60, f: 'reminder60DaysSent' }, { d: 30, f: 'reminder30DaysSent' }];

    for (const win of windows) {
        const target = new Date(today);
        target.setDate(today.getDate() + win.d);
        const expiring = await Project.find({
            expiryDate: { $gte: new Date(target.setHours(0,0,0,0)), $lte: new Date(target.setHours(23,59,59,999)) },
            [win.f]: false
        });

        for (const p of expiring) {
            await transporter.sendMail({
                from: `"System" <${process.env.EMAIL_USER}>`,
                to: p.officerEmail,
                cc: p.directorEmail,
                subject: `${win.d}-Day Notice: ${p.borrowerName}`,
                text: `Insurance for ${p.borrowerName} expires on ${p.expiryDate.toDateString()}.`
            });
            p[win.f] = true;
            await p.save();
        }
    }
});

app.listen(process.env.PORT || 5000, '0.0.0.0');
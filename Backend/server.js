const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const cron = require('node-cron'); // Removed: not needed for Vercel Cron integration
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
require('dotenv').config();

const Project = require('./models/project');
const User = require('./models/User');

const app = express();

// --- ROBUST CORS CONFIGURATION ---
// This version handles the Vercel deployment errors you encountered previously.
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL // Your main Vercel URL from Render dashboard
];

app.use(cors({
    origin: function (origin, callback) {
        // 1. Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // 2. Allow any Vercel preview URL from your project (Fixes deployment mismatches)
        const isVercelPreview = /^https:\/\/insurance-tracker.*\.vercel\.app$/.test(origin);
        
        if (allowedOrigins.includes(origin) || isVercelPreview) {
            callback(null, true);
        } else {
            // Log the blocked origin to help you debug if deployment fails again
            console.log("CORS blocked origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI, {
    family: 4 // Force IPv4 to resolve MongoDB connection issues on Render
})
.then(() => console.log("✅ DB Connected"))
.catch(err => console.error("❌ DB Connection Error:", err));

// --- EMAIL TRANSPORTER ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// --- MIDDLEWARE: VERIFY ADMIN ---
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        if (decoded.role !== 'Admin') {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid token." });
    }
};

// --- AUTH ROUTES ---

// Public Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: '8h' }
        );
        
        res.json({ token, role: user.role, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Protected Registration Route (Admins Only)
app.post('/api/auth/register', verifyAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: "User already exists" });

        const newUser = new User({ name, email, password, role });
        await newUser.save();
        res.status(201).json({ message: `${role} registered successfully: ${name}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PROJECT ROUTES ---
app.get('/api/projects/all', async (req, res) => res.json(await Project.find().sort({ expiryDate: 1 })));
app.post('/api/projects/add', async (req, res) => res.status(201).json(await new Project(req.body).save()));
app.put('/api/projects/update/:id', async (req, res) => res.json(await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/api/projects/:id', async (req, res) => { await Project.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); });

// --- EXCEL EXPORT ---
app.get('/api/projects/export', async (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).send("Export failed");
    }
});

// --- CRON REMINDERS FUNCTION ---
const sendReminders = async () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const windows = [{ days: 60, field: 'reminder60DaysSent' }, { days: 30, field: 'reminder30DaysSent' }];

    for (const win of windows) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + win.days);
        
        const expiring = await Project.find({
            expiryDate: { 
                $gte: new Date(targetDate.setHours(0,0,0,0)), 
                $lte: new Date(targetDate.setHours(23,59,59,999)) 
            },
            [win.field]: false
        });

        for (const p of expiring) {
            try {
                await transporter.sendMail({
                    from: `"System" <${process.env.EMAIL_USER}>`,
                    to: p.officerEmail,
                    cc: p.directorEmail,
                    subject: `${win.days}-Day Notice: ${p.borrowerName}`,
                    text: `Insurance for ${p.borrowerName} expires on ${p.expiryDate.toDateString()}.`
                });
                p[win.field] = true;
                await p.save();
            } catch (err) { console.error(err); }
        }
    }
};

// --- CRON REMINDERS ROUTE (for Vercel Cron) ---
app.get('/api/reminders', async (req, res) => {
    try {
        await sendReminders();
        res.json({ message: 'Reminders sent successfully' });
    } catch (err) {
        console.error('Reminder error:', err);
        res.status(500).json({ error: 'Failed to send reminders' });
    }
});

// --- CRON REMINDERS ---
// Removed cron.schedule since Vercel doesn't support persistent processes
// Use Vercel Cron integration instead (configured in vercel.json)

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
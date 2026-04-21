const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
require('dotenv').config();

// Models
const Project = require('./models/project');
const User = require('./models/User');

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.error("❌ Connection Error:", err));

// --- NODEMAILER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address (e.g., yourname@gmail.com)
    pass: process.env.EMAIL_PASS  // Your 16-character App Password
  }
});

// Verify email connection on start
transporter.verify((error, success) => {
  if (error) console.error("❌ Email Auth Failed:", error);
  else console.log("📧 Email Server Ready");
});

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

app.get('/api/projects/all', async (req, res) => {
    try {
        const projects = await Project.find().sort({ expiryDate: 1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects/add', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const saved = await newProject.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

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
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Remark', key: 'remark', width: 30 }
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
                status: days < 0 ? 'EXPIRED' : (days <= 60 ? 'CRITICAL' : 'ACTIVE'),
                remark: p.remark || ''
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

cron.schedule('* * * * *', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkAndSend = async (daysOut, flagField, subjectPrefix) => {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysOut);

        const expiring = await Project.find({
            expiryDate: {
                $gte: new Date(targetDate.setHours(0,0,0,0)),
                $lte: new Date(targetDate.setHours(23,59,59,999))
            },
            [flagField]: false
        });

        for (const project of expiring) {
            try {
                const mailOptions = {
                    from: `"Insurance Portal" <${process.env.EMAIL_USER}>`,
                    to: project.officerEmail,
                    cc: project.directorEmail,
                    subject: `${subjectPrefix}: Renewal for ${project.borrowerName}`,
                    html: `
                        <h3>Insurance Renewal Notice</h3>
                        <p>This is an automated reminder that the insurance coverage for <b>${project.borrowerName}</b> is approaching expiry.</p>
                        <ul>
                            <li><b>Asset:</b> ${project.listFixedAsset}</li>
                            <li><b>Asset Code:</b> ${project.assetCode}</li>
                            <li><b>Expiry Date:</b> ${new Date(project.expiryDate).toDateString()}</li>
                        </ul>
                        <p>Please take the necessary steps to renew the policy.</p>
                    `
                };

                await transporter.sendMail(mailOptions);
                project[flagField] = true;
                await project.save();
                console.log(`✅ Email sent for ${project.borrowerName}`);
            } catch (err) {
                console.error(`❌ Email error for ${project.borrowerName}:`, err.message);
            }
        }
    };

    await checkAndSend(60, 'reminder60DaysSent', '60-Day Notice');
    await checkAndSend(30, 'reminder30DaysSent', '30-Day Notice');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { Resend } = require('resend');
require('dotenv').config();

const Project = require('./models/Project');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/projects', projectRoutes);

// --- AUTOMATION LOGIC (CRON JOB) ---
// Runs every day at 09:00 AM to check for renewals
cron.schedule('0 9 * * *', async () => {
    console.log('🔍 Running daily insurance expiration check...');
    
    try {
        const today = new Date();
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(today.getMonth() + 1);

        // Find projects expiring exactly 30 days from now that haven't received a reminder
        const expiringProjects = await Project.find({
            expiryDate: {
                $gte: new Date(oneMonthFromNow.setHours(0, 0, 0, 0)),
                $lte: new Date(oneMonthFromNow.setHours(23, 59, 59, 999))
            },
            reminderSent: false
        });

        if (expiringProjects.length === 0) {
            console.log('ℹ️ No projects require renewal reminders today.');
            return;
        }

        for (const project of expiringProjects) {
            const { data, error } = await resend.emails.send({
                from: 'Insurance Tracker <onboarding@resend.dev>',
                to: [project.officerEmail],
                cc: [project.directorEmail],
                subject: `⚠️ Action Required: Insurance Renewal for ${project.projectName}`,
                html: `
                    <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                        <h2>Insurance Renewal Reminder</h2>
                        <p>This is an automated notification that the insurance coverage for <strong>${project.projectName}</strong> is due for renewal in 30 days.</p>
                        <hr />
                        <p><strong>Policy Details:</strong></p>
                        <ul>
                            <li><strong>Policy Number:</strong> ${project.policyNumber}</li>
                            <li><strong>Expiry Date:</strong> ${new Date(project.expiryDate).toDateString()}</li>
                        </ul>
                        <p>Please ensure the renewal is processed to avoid a lapse in coverage.</p>
                        <br />
                        <p><small>This is a system-generated email sent to the Officer and Director.</small></p>
                    </div>
                `
            });

            if (error) {
                console.error(`❌ Failed to send email for ${project.projectName}:`, error);
            } else {
                // Update database so we don't send duplicate emails tomorrow
                project.reminderSent = true;
                await project.save();
                console.log(`📧 Reminder sent to ${project.officerEmail} (CC: ${project.directorEmail})`);
            }
        }
    } catch (err) {
        console.error('❌ Automation Task Error:', err);
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is humming along on port ${PORT}`);
});
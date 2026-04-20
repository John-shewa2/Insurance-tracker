const express = require('express');
const router = express.Router();
const Project = require('./models/project');

// POST: Register a new project insurance
router.post('/add', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET: Fetch all projects for the dashboard
router.get('/all', async (req, res) => {
    try {
        const projects = await Project.find().sort({ expiryDate: 1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE: Remove a project
router.delete('/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Project deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
const Bug = require('../models/Bug');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
const createBug = async (req, res) => {
    try {
        const { title, description, stepsToReproduce, priority, severity } = req.body;
        const bug = new Bug({
            title,
            description,
            stepsToReproduce,
            priority,
            severity,
            reporter: req.user._id
        });
        await bug.save();
        res.status(201).json(bug);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getBugs = async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.priority) filters.priority = req.query.priority;
        if (req.query.severity) filters.severity = req.query.severity;
        if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;

        const bugs = await Bug.find(filters)
            .populate('reporter', 'name email')
            .populate('assignedTo', 'name email');
        res.json(bugs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getBugById = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id)
            .populate('reporter', 'name email')
            .populate('assignedTo', 'name email');
        if (!bug) return res.status(404).json({ message: 'Bug not found' });
        res.json(bug);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateBug = async (req, res) => {
    try {
        const { title, description, stepsToReproduce, priority, severity, status, assignedTo } = req.body;
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        bug.title = title || bug.title;
        bug.description = description || bug.description;
        bug.stepsToReproduce = stepsToReproduce || bug.stepsToReproduce;
        bug.priority = priority || bug.priority;
        bug.severity = severity || bug.severity;
        bug.status = status || bug.status;
        bug.assignedTo = assignedTo || bug.assignedTo;

        await bug.save();
        res.json(bug);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const deleteBug = async (req, res) => {
    try {
        const bug = await Bug.findByIdAndDelete(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });
        res.json({ message: 'Bug deleted' });
        res.json({ message: 'Bug deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const uploadAttachment = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        bug.attachments.push(req.file.path);
        await bug.save();
        res.json({ message: 'Attachment uploaded', attachment: req.file.path });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getAttachments = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        res.json(bug.attachments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const assignBug = async (req, res) => {
    const { id } = req.params;
    const { assignedTo } = req.body;

    try {
        const bug = await Bug.findById(id);
        if (!bug) {
            return res.status(404).json({ message: 'Bug not found' });
        }
        const developer = await User.findById(assignedTo);
        if (!developer || developer.role !== 'Developer') {
            return res.status(400).json({ message: 'Invalid developer ID or role' });
        }
        bug.assignedTo = assignedTo;
        await bug.save();

        return res.status(200).json(bug);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateBugStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const bug = await Bug.findById(id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        bug.status = status;
        await bug.save();

        res.json({ message: 'Bug status updated successfully', bug });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateBugPriority = async (req, res) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;

        const bug = await Bug.findById(id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        if (!['Low', 'Medium', 'High', 'critical'].includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority level' });
        }

        bug.priority = priority;
        await bug.save();

        res.json({ message: 'Bug priority updated successfully', bug });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateBugSeverity = async (req, res) => {
    try {
        const { id } = req.params;
        const { severity } = req.body;

        const bug = await Bug.findById(id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        if (!['Minor', 'Major', 'Critical', 'Blocker'].includes(severity)) {
            return res.status(400).json({ message: 'Invalid severity level' });
        }

        bug.severity = severity;
        await bug.save();

        res.json({ message: 'Bug severity updated successfully', bug });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const resolveBug = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });
        if (bug.status !== 'In Progress') {
            return res.status(400).json({ message: 'Bug must be "In Progress" to be marked as "Resolved"' });
        }

        bug.status = 'Resolved';
        await bug.save();
        res.json(bug);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
const reopenBug = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });
        if (bug.status !== 'Resolved') {
            return res.status(400).json({ message: 'Only "Resolved" bugs can be reopened' });
        }

        bug.status = 'In Progress';
        await bug.save();
        res.json(bug);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
const closeBug = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });
        if (bug.status !== 'Resolved') {
            return res.status(400).json({ message: 'Bug must be "Resolved" to be closed' });
        }

        bug.status = 'Closed';
        await bug.save();
        res.json(bug);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
module.exports = {
    createBug,
    getBugs,
    getBugById,
    updateBug,
    deleteBug,
    uploadAttachment,
    getAttachments,
    upload, assignBug, updateBugStatus, updateBugPriority, updateBugSeverity, resolveBug,
    reopenBug,
    closeBug,
};

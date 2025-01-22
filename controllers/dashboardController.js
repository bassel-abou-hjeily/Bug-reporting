const Bug = require('../models/Bug');
const getBugSummary = async (req, res) => {
    try {
        const { status, priority, severity, assignedTo } = req.query;
        let filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (severity) filter.severity = severity;
        if (assignedTo) filter.assignedTo = assignedTo;
        const bugs = await Bug.find(filter)
            .populate('reporter', 'name email')
            .populate('assignedTo', 'name email');

        res.status(200).json(bugs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving bugs', error });
    }
};

const getTeamPerformance = async (req, res) => {
    try {
        const performanceData = await Bug.aggregate([
            { $match: { status: 'Resolved' } },
            {
                $group: {
                    _id: '$assignedTo',
                    resolvedBugs: { $sum: 1 },
                    avgResolutionTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'developer'
                }
            },
            { $unwind: '$developer' },
            {
                $project: {
                    _id: 0,
                    developerName: '$developer.name',
                    resolvedBugs: 1,
                    avgResolutionTime: { $divide: ['$avgResolutionTime', 1000 * 60 * 60 * 24] }
                }
            }
        ]);

        res.status(200).json(performanceData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving team performance data', error });
    }
};

const getBugHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const bug = await Bug.findById(id)
            .populate('reporter', 'name email')
            .populate('assignedTo', 'name email')
            .populate('comments');

        if (!bug) {
            return res.status(404).json({ message: 'Bug not found' });
        }

        res.status(200).json(bug);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving bug history', error });
    }
};

module.exports = { getBugSummary, getTeamPerformance, getBugHistory };


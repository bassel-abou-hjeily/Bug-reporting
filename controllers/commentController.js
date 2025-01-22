const Bug = require('../models/Bug');
const Comment = require('../models/Comment');
const addComment = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        const comment = new Comment({
            bug: bug._id,
            user: req.user._id,
            text: req.body.text,
        });

        await comment.save();
        bug.comments.push(comment._id);
        await bug.save();

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ bug: req.params.id }).populate('user', 'name role');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    addComment,
    getComments,
    deleteComment,
};

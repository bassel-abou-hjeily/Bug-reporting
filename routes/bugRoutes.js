const express = require('express');
const {
    createBug,
    getBugs,
    getBugById,
    updateBug,
    deleteBug,
    uploadAttachment,
    getAttachments,
    upload,
    assignBug, updateBugStatus, updateBugPriority, updateBugSeverity,
    resolveBug, reopenBug, closeBug
} = require('../controllers/bugController');
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const { authorizeRole, protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/', protect, createBug);
router.get('/', protect, getBugs);
router.get('/:id', protect, getBugById);
router.put('/:id', protect, updateBug);
router.delete('/:id', protect, admin, deleteBug);
router.post('/:id/attachments', protect, upload.single('attachment'), uploadAttachment);
router.get('/:id/attachments', protect, getAttachments);
router.put('/:id/assign', authorizeRole('Manager'), assignBug);
router.put('/:id/status', authorizeRole('Developer'), updateBugStatus);
router.put('/:id/priority', authorizeRole('Manager'), updateBugPriority);
router.put('/:id/severity', authorizeRole('Manager'), updateBugSeverity);
router.put('/:id/resolve', protect, authorizeRole('Developer'), resolveBug);
router.put('/:id/reopen', protect, authorizeRole('Tester', 'Manager'), reopenBug);
router.put('/:id/close', protect, authorizeRole('Tester', 'Manager'), closeBug);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', protect, getComments);
router.delete('/:id/comments/:commentId', protect, authorizeRole('Admin', 'Manager'), deleteComment);
module.exports = router;

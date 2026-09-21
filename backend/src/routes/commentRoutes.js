const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');
const { commentValidation } = require('../middleware/validator');

router.get('/', commentController.getComments);
router.post('/', authenticate, commentValidation.create, commentController.createComment);
router.patch('/:id', authenticate, commentController.updateComment);
router.delete('/:id', authenticate, commentController.deleteComment);
router.post('/:id/vote', authenticate, commentController.voteComment);
router.post('/:id/flag', authenticate, commentController.flagComment);

module.exports = router;
const express = require('express');
const router = express.Router();
const userSoulController = require('../controllers/userSoulController');
const { authenticate } = require('../middleware/auth');
const { userSoulValidation } = require('../middleware/validator');

router.get('/', authenticate, userSoulController.getUserSouls);
router.post('/', authenticate, userSoulValidation.assign, userSoulController.assignSoul);
router.patch('/:id', authenticate, userSoulController.updateUserSoul);
router.post('/reorder', authenticate, userSoulController.reorderSouls);
router.delete('/:id', authenticate, userSoulController.removeUserSoul);

module.exports = router;
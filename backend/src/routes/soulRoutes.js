const express = require('express');
const router = express.Router();
const soulController = require('../controllers/soulController');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roleCheck');
const { soulValidation } = require('../middleware/validator');

router.get('/', soulController.getAllSouls);
router.get('/stats/:id', soulController.getSoulStats);
router.get('/:id', soulController.getSoulById);
router.post('/', authenticate, soulValidation.create, soulController.createSoul);
router.patch('/:id', authenticate, requireMinRole('content_manager'), soulController.updateSoul);
router.post('/:id/approve', authenticate, requireMinRole('content_manager'), soulController.approveSoul);
router.post('/:id/reject', authenticate, requireMinRole('content_manager'), soulController.rejectSoul);
router.post('/merge', authenticate, requireMinRole('admin'), soulController.mergeSouls);
router.delete('/:id', authenticate, requireMinRole('admin'), soulController.deleteSoul);

module.exports = router;
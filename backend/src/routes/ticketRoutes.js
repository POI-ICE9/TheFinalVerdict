const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roleCheck');
const { ticketValidation } = require('../middleware/validator');
const { ticketLimiter } = require('../middleware/rateLimiter');

router.post('/', authenticate, ticketLimiter, ticketValidation.create, ticketController.createTicket);
router.get('/my', authenticate, ticketController.getUserTickets);
router.get('/stats', authenticate, requireMinRole('support'), ticketController.getTicketStats);
router.get('/', authenticate, requireMinRole('support'), ticketController.getAllTickets);
router.get('/:id', authenticate, ticketController.getTicketById);
router.post('/:id/reply', authenticate, ticketValidation.reply, ticketController.replyToTicket);
router.patch('/:id', authenticate, requireMinRole('support'), ticketController.updateTicket);
router.post('/:id/rate', authenticate, ticketController.rateTicket);

// Templates
router.get('/templates/list', authenticate, requireMinRole('support'), ticketController.getTemplates);
router.post('/templates', authenticate, requireMinRole('support'), ticketController.createTemplate);
router.delete('/templates/:id', authenticate, requireMinRole('support'), ticketController.deleteTemplate);

module.exports = router;
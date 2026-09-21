const express = require('express');
const router = express.Router();
const realmController = require('../controllers/realmController');
const { authenticate } = require('../middleware/auth');

router.get('/user/:userId', realmController.getUserRealms);
router.get('/:id', realmController.getRealmById);
router.patch('/:id', authenticate, realmController.updateRealm);

module.exports = router;
const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/attempt', requireAuth, ctrl.saveAttempt);
router.post('/submit', requireAuth, ctrl.submitAssignment);
router.get('/progress', requireAuth, ctrl.getProgress);
module.exports = router;

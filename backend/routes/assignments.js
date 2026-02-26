const router = require('express').Router();
const ctrl = require('../controllers/assignmentController');

router.get('/', ctrl.getAllAssignments);
router.get('/:id', ctrl.getAssignmentById);

router.post('/admin/seed', (req, res, next) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}, ctrl.seedAssignments);

module.exports = router;

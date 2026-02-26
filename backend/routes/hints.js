const router = require('express').Router();
const { getHint } = require('../controllers/hintController');
router.post('/', getHint);
module.exports = router;

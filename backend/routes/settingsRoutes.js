const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, requireRole('admin'));

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;

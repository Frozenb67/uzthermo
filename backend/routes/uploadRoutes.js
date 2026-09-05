const express = require('express');
const { upload, uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, requireRole('admin', 'manager'), upload.single('file'), uploadFile);

module.exports = router;

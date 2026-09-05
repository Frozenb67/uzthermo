const express = require('express');
const {
  getInstallers,
  createBookingRequest,
  updateBookingStatus,
} = require('../controllers/installerController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getInstallers);
router.post('/requests', createBookingRequest);
router.patch(
  '/:installerId/requests/:bookingId',
  protect,
  requireRole('admin', 'manager'),
  updateBookingStatus
);

module.exports = router;

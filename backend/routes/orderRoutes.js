const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  notifyCustomer,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', createOrder); // guest checkout allowed
router.get('/', protect, requireRole('admin', 'manager', 'warehouse_clerk'), getOrders);
router.get('/:id', protect, requireRole('admin', 'manager', 'warehouse_clerk'), getOrderById);
router.patch('/:id/status', protect, requireRole('admin', 'manager'), updateOrderStatus);
router.post('/:id/notify', protect, requireRole('admin', 'manager'), notifyCustomer);

module.exports = router;

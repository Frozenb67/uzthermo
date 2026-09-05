const express = require('express');
const {
  getSalesTrends,
  getRevenueByCategory,
  getLowStock,
  getTopSellers,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, requireRole('admin', 'manager'));

router.get('/analytics/sales-trends', getSalesTrends);
router.get('/analytics/revenue-by-category', getRevenueByCategory);
router.get('/analytics/low-stock', getLowStock);
router.get('/analytics/top-sellers', getTopSellers);

module.exports = router;

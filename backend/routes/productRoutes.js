const express = require('express');
const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdatePrices,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.patch('/bulk-price', protect, requireRole('admin', 'manager'), bulkUpdatePrices);
router.get('/id/:id', protect, requireRole('admin', 'manager', 'warehouse_clerk'), getProductById);
router.get('/:slug', getProductBySlug);
router.post('/', protect, requireRole('admin', 'manager'), createProduct);
router.put('/:id', protect, requireRole('admin', 'manager'), updateProduct);
router.delete('/:id', protect, requireRole('admin'), deleteProduct);

module.exports = router;

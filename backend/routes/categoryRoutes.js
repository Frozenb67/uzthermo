const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, requireRole('admin', 'manager'), createCategory);
router.put('/:id', protect, requireRole('admin', 'manager'), updateCategory);
router.delete('/:id', protect, requireRole('admin'), deleteCategory);

module.exports = router;

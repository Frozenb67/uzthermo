const Category = require('../models/Category');

async function getCategories(req, res, next) {
  try {
    const categories = await Category.find().sort('sortOrder');
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

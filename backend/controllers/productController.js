const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

function slugify(text) {
  const transliteration = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    қ: 'q', ғ: 'g', ҳ: 'h', ў: 'u', ң: 'ng',
  };

  return String(text || '')
    .toLowerCase()
    .split('')
    .map((character) => transliteration[character] ?? character)
    .join('')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function validateVariants(variants) {
  if (variants === undefined) return;
  if (!Array.isArray(variants)) throw new Error('Variants must be an array');

  const seen = new Set();
  variants.forEach((variant) => {
    const size = String(variant?.size || '').trim();
    const price = variant?.price;
    if (!size) throw new Error('Variant size is required');
    if (price === '' || price === null || price === undefined) {
      throw new Error(`Enter a price for size ${size}`);
    }
    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      throw new Error(`Price for size ${size} must be a number greater than 0`);
    }
    const key = size.toLowerCase();
    if (seen.has(key)) throw new Error(`Variant ${size} already exists`);
    seen.add(key);
  });
}

async function getProducts(req, res, next) {
  try {
    const {
      search, category, brand, minPrice, maxPrice,
      minKW, maxKW, diameter, inStock, hotDeal,
      page = 1, limit = 20, sort = '-createdAt',
    } = req.query;

    const query = { isActive: true };

    if (search) query.$text = { $search: search };

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        // Accept a category slug too (e.g. ?category=boilers), not just its ObjectId.
        const cat = await Category.findOne({ slug: category });
        query.category = cat ? cat._id : null; // no such category -> empty result set
      }
    }

    if (brand) query.brand = { $in: brand.split(',') };
    if (hotDeal === 'true') query.isHotDeal = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minKW || maxKW) {
      query['specifications.powerKW'] = {};
      if (minKW) query['specifications.powerKW'].$gte = Number(minKW);
      if (maxKW) query['specifications.powerKW'].$lte = Number(maxKW);
    }

    if (diameter) query['specifications.diameter'] = diameter;
    if (inStock === 'true') query.stock = { $gt: 0 };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    next(error);
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('compatibleWith', 'title slug images price discountPrice');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    validateVariants(req.body.variants);
    const payload = {
      ...req.body,
      slug: req.body.slug?.trim() || slugify(req.body.title),
    };
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    validateVariants(req.body.variants);
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  } catch (error) {
    if (error.name === 'ValidationError' || error.message.includes('Discount price') || error.message.includes('Variant') || error.message.includes('price for size')) {
      res.status(400);
    }
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
}

async function bulkUpdatePrices(req, res, next) {
  try {
    const { category, percent } = req.body;

    if (percent === undefined || percent === null) {
      res.status(400);
      throw new Error('percent is required, e.g. 5 for +5% or -10 for -10%');
    }

    const filter = category ? { category } : {};
    const multiplier = 1 + Number(percent) / 100;
    const products = await Product.find(filter);

    await Promise.all(
      products.map((product) => {
        product.price = Math.round(product.price * multiplier);
        if (product.discountPrice) {
          product.discountPrice = Math.round(product.discountPrice * multiplier);
        }
        return product.save();
      })
    );

    res.json({ updated: products.length, multiplier });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdatePrices,
};

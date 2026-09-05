const Order = require('../models/Order');
const Product = require('../models/Product');

async function getSalesTrends(req, res, next) {
  try {
    const trends = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    res.json(trends);
  } catch (error) {
    next(error);
  }
}

async function getRevenueByCategory(req, res, next) {
  try {
    const revenue = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$items.qty', '$items.unitPrice'] } },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $project: { _id: 0, category: '$category.name', revenue: 1 } },
    ]);

    res.json(revenue);
  } catch (error) {
    next(error);
  }
}

async function getLowStock(req, res, next) {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
    }).select('title sku stock lowStockThreshold unit');

    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function getTopSellers(req, res, next) {
  try {
    const top = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          title: { $first: '$items.title' },
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.qty', '$items.unitPrice'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 10 },
    ]);

    res.json(top);
  } catch (error) {
    next(error);
  }
}

module.exports = { getSalesTrends, getRevenueByCategory, getLowStock, getTopSellers };

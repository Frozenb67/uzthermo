const Order = require('../models/Order');
const { notifyNewOrder, notifyOrderStatusChange } = require('../services/telegramBot');

async function createOrder(req, res, next) {
  try {
    const order = await Order.create(req.body);

    // Fire-and-forget: a Telegram outage must never fail the checkout itself.
    // The manager can always see the order in /admin even if this notification drops.
    notifyNewOrder(order).catch((error) => {
      console.error('[orderController] Telegram notification failed:', error.message);
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .populate('user', 'name phone email');
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name phone email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    notifyOrderStatusChange(order).catch((error) => {
      console.error('[orderController] Telegram status notification failed:', error.message);
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function notifyCustomer(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const sent = await notifyOrderStatusChange(order);
    if (!sent) {
      res.status(502);
      throw new Error('Telegram notification could not be sent — check bot configuration in /admin');
    }

    order.telegramNotifiedAt = new Date();
    await order.save();

    res.json({ message: 'Notification sent' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  notifyCustomer,
};

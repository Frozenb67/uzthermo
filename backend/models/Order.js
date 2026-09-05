const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    // Optional: only set when the storefront is backed by a real, seeded Product
    // document. The frontend currently runs on a demo catalog (lib/mockData.js)
    // with no matching Mongo _id, so this is null for those orders — `sku` below
    // is the reliable identifier snapshotted at order time either way.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    title: { type: String, required: true }, // snapshot at time of order
    sku: { type: String, required: true },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    selectedUnit: {
      type: String,
      enum: ['pcs', 'meters'],
      default: 'pcs',
    },
    selectedVariant: {
      size: { type: String, default: null },
      price: { type: Number, default: null, min: 0 },
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const guestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    guest: {
      type: guestSchema,
      default: null,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    deliveryAddress: {
      region: String,
      city: String,
      street: String,
      building: String,
      apartment: String,
      landmark: String,
      raw: String, // free-text address as typed at checkout, when not split into fields
    },
    // GPS coordinates captured via navigator.geolocation at checkout, if the
    // customer granted location access — used for bot.sendLocation() to the manager.
    deliveryLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['UZS', 'USD'],
      default: 'UZS',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'click', 'payme', 'bank_transfer'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    installerRequested: {
      type: Boolean,
      default: false,
    },
    installer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Installer',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    telegramNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Either a registered user or a guest object must be present
orderSchema.pre('validate', function (next) {
  if (!this.user && !this.guest) {
    return next(new Error('Order requires either a user reference or guest details'));
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

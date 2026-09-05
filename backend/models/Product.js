const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "Datasheet", "Install Manual", "Warranty Card"
    url: { type: String, required: true },
    type: { type: String, enum: ['datasheet', 'manual', 'warranty', 'other'], default: 'other' },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0.01 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      index: true, // Bosch, Protherm, WAVIN, Fondital, Wilo, Ariston...
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
      validate: {
        // Only meaningful for document-level validation (new Product(), .save(),
        // Product.create()) where `this` is the actual document and `this.price`
        // is reliably populated. Under findByIdAndUpdate's update-validator
        // context, `this.price` is not dependably bound to the document even
        // with runValidators: true — enforcing it correctly there is handled
        // instead by the pre('findOneAndUpdate') hook below, so this validator
        // deliberately no-ops (returns true) whenever `this.price` is undefined
        // rather than false-rejecting a value it can't actually check.
        validator: function (value) {
          if (value == null) return true;
          if (this.price === undefined) return true;
          return value <= this.price;
        },
        message: 'Discount price must not exceed the base price',
      },
    },
    currency: {
      type: String,
      enum: ['UZS', 'USD'],
      default: 'UZS',
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      enum: ['pcs', 'meters'],
      default: 'pcs',
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    images: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    // Dynamic technical specifications, e.g.
    // { diameter: "20mm", maxPressure: "16 bar", powerKW: 24, fuelType: "gas" }
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    documents: {
      type: [documentSchema],
      default: [],
    },
    compatibleWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    isHotDeal: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', sku: 'text', brand: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ isHotDeal: 1, isActive: 1 });

// The discountPrice path validator above works for `new Product().save()` /
// `Product.create()`, where `this` inside the validator is the full document.
// It silently misbehaves for `findByIdAndUpdate(..., { runValidators: true })`
// (used by the admin edit form) — Mongoose's update-validator context does
// NOT reliably bind `this.price` to the document there, so a perfectly valid
// discountPrice update can fail (or, worse, an invalid one could pass). This
// hook re-checks discountPrice <= price correctly for that update path,
// falling back to the current stored price when only discountPrice changes.
// NOTE: deliberately async with no `next` parameter — Mongoose treats a hook
// as promise-based the moment it's declared `async`, so mixing that with a
// manual next(err) callback silently breaks error propagation (the error
// gets swallowed instead of rejecting the update). Throwing is the correct
// way to fail an async pre-hook.
productSchema.pre(['findOneAndUpdate', 'updateOne'], async function checkDiscountPrice() {
  const update = this.getUpdate();
  // Fields can land at the top level of the update object OR inside $set —
  // Mongoose's timestamps plugin injects its own `$set: { updatedAt }`
  // alongside top-level fields, so `update.$set || update` isn't safe: it
  // picks whichever $set exists even when the field we want is top-level.
  const newDiscountPrice = update.discountPrice ?? update.$set?.discountPrice;

  if (newDiscountPrice == null) return;

  const newPrice =
    update.price ?? update.$set?.price ?? (await this.model.findOne(this.getQuery()).select('price'))?.price;

  if (newPrice != null && newDiscountPrice > newPrice) {
    throw new Error('Discount price must not exceed the base price');
  }
});

productSchema.virtual('discountPercent').get(function () {
  if (!this.discountPrice || !this.price) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);

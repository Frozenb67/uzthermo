const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    serviceType: {
      type: String,
      enum: ['boiler_mounting', 'pipe_layout', 'radiator_install', 'pump_install', 'other'],
      required: true,
    },
    address: { type: String, required: true },
    preferredDate: { type: Date },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'in_progress', 'done', 'cancelled'],
      default: 'new',
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  { timestamps: true }
);

const installerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Installer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    specialization: {
      type: [String],
      enum: ['boilers', 'pipes', 'radiators', 'pumps', 'gas_heaters', 'general_plumbing'],
      default: [],
    },
    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    completedProjects: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    serviceRegions: {
      type: [String],
      default: [],
    },
    bookingRequests: {
      type: [bookingRequestSchema],
      default: [],
    },
  },
  { timestamps: true }
);

installerSchema.index({ specialization: 1, isAvailable: 1 });
installerSchema.index({ rating: -1 });

module.exports = mongoose.model('Installer', installerSchema);

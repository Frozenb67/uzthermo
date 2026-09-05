const Installer = require('../models/Installer');

async function getInstallers(req, res, next) {
  try {
    const { specialization } = req.query;
    const filter = { isAvailable: true };
    if (specialization) filter.specialization = specialization;

    const installers = await Installer.find(filter).sort('-rating');
    res.json(installers);
  } catch (error) {
    next(error);
  }
}

async function createBookingRequest(req, res, next) {
  try {
    const { installerId, ...booking } = req.body;

    const installer = await Installer.findById(installerId);
    if (!installer) {
      res.status(404);
      throw new Error('Installer not found');
    }

    installer.bookingRequests.push(booking);
    await installer.save();

    res.status(201).json(installer);
  } catch (error) {
    next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { installerId, bookingId } = req.params;
    const { status } = req.body;

    const installer = await Installer.findById(installerId);
    if (!installer) {
      res.status(404);
      throw new Error('Installer not found');
    }

    const booking = installer.bookingRequests.id(bookingId);
    if (!booking) {
      res.status(404);
      throw new Error('Booking request not found');
    }

    booking.status = status;
    await installer.save();

    res.json(installer);
  } catch (error) {
    next(error);
  }
}

module.exports = { getInstallers, createBookingRequest, updateBookingStatus };

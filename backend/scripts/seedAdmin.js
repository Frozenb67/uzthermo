// Creates (or promotes) the store's first admin user so /admin has someone who
// can log in. Run once: `node scripts/seedAdmin.js`
//
// Reads credentials from env vars if set, otherwise falls back to a default —
// change the password after first login either way.
//   ADMIN_EMAIL=owner@uzthermo.uz ADMIN_PASSWORD=... node scripts/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.env.ADMIN_EMAIL || 'admin@uzthermo.uz';
const password = process.env.ADMIN_PASSWORD || 'admin12345';
const name = process.env.ADMIN_NAME || 'Store Admin';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  let user = await User.findOne({ email });

  if (user) {
    user.role = 'admin';
    await user.save();
    console.log(`Existing user promoted to admin: ${email}`);
  } else {
    user = await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin user created: ${email} / ${password}`);
    console.log('Log in at the site with these credentials, then change the password.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});

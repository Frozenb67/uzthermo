// Seeds the top-level categories shown in the mega-menu / catalog sidebar.
// Idempotent — safe to re-run (upserts by slug). Run: node scripts/seedCategories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const CATEGORIES = [
  { name: 'Фитинги', slug: 'fittings', icon: 'Wrench', sortOrder: 1, filterAttributes: ['diameter'] },
  { name: 'Трубы', slug: 'pipes', icon: 'PipetteIcon', sortOrder: 2, filterAttributes: ['diameter'] },
  { name: 'Канализационные трубы', slug: 'sewer-pipes', icon: 'Droplets', sortOrder: 3, filterAttributes: ['diameter'] },
  { name: 'PPR трубы', slug: 'ppr-pipes', icon: 'PipetteIcon', sortOrder: 4, filterAttributes: ['diameter'] },
  { name: 'Водяные бойлеры', slug: 'water-boilers', icon: 'Thermometer', sortOrder: 5, filterAttributes: ['volume'] },
  { name: 'Радиаторы отопления', slug: 'radiators', icon: 'AlignJustify', sortOrder: 6, filterAttributes: [] },
  { name: 'Системы водоснабжения', slug: 'water-supply', icon: 'Waves', sortOrder: 7, filterAttributes: [] },
  { name: 'Комплектующие для труб', slug: 'pipe-fittings', icon: 'GitBranch', sortOrder: 8, filterAttributes: ['diameter'] },
  { name: 'Краны и клапаны', slug: 'taps-valves', icon: 'Wrench', sortOrder: 9, filterAttributes: ['diameter'] },
  { name: 'Сантехнические аксессуары', slug: 'plumbing-accessories', icon: 'Droplets', sortOrder: 10, filterAttributes: [] },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const cat of CATEGORIES) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
  }

  console.log(`Seeded ${CATEGORIES.length} categories.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});

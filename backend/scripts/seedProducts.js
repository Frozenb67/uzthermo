// Seeds the plumbing and water-supply catalog into MongoDB so the admin panel
// and, once wired up, the live storefront have real data to work with.
// Idempotent — upserts by SKU. Run after seedCategories.js:
//   node scripts/seedCategories.js && node scripts/seedProducts.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const PRODUCTS = [
  { sku: 'VT-FIT-20-CR', slug: 'valtec-compression-fitting-20mm', title: 'Компрессионный фитинг Valtec 20 мм', brand: 'Valtec', category: 'fittings', price: 22000, discountPrice: 18000, stock: 140, unit: 'pcs', specifications: { diameter: '20mm' }, isHotDeal: true, description: 'Надёжный компрессионный фитинг для систем горячего и холодного водоснабжения.' },
  { sku: 'WVN-PIP-25', slug: 'wavin-pipe-25mm', title: 'Труба Wavin 25 мм для водоснабжения', brand: 'Wavin', category: 'pipes', price: 46000, stock: 220, unit: 'meters', specifications: { diameter: '25mm' }, description: 'Гибкая высокопрочная труба для внутренней разводки и подключения сантехнических узлов.' },
  { sku: 'HNC-SW-110', slug: 'henco-sewer-pipe-110mm', title: 'Канализационная труба Henco 110 мм', brand: 'Henco', category: 'sewer-pipes', price: 68000, stock: 98, unit: 'meters', specifications: { diameter: '110mm' }, description: 'Надёжная канализационная труба для наружных и внутренних стояков.' },
  { sku: 'UPN-PPR-32', slug: 'uponor-ppr-pipe-32mm', title: 'PPR труба Uponor 32 мм PN16', brand: 'Uponor', category: 'ppr-pipes', price: 76000, discountPrice: 61000, stock: 180, unit: 'meters', specifications: { diameter: '32mm' }, isHotDeal: true, description: 'Прочная полипропиленовая труба для горячей и холодной воды по системам PN16.' },
  { sku: 'AQU-BOIL-50', slug: 'aqua-electric-water-boiler-50l', title: 'Электрический водонагреватель Aqua 50 л', brand: 'Aqua', category: 'water-boilers', price: 11800000, stock: 40, unit: 'pcs', specifications: { volume: '50L' }, description: 'Накопительный электрический бойлер для квартиры и частного дома.' },
  { sku: 'ROC-RAD-500', slug: 'roca-aluminum-radiator-500', title: 'Алюминиевый радиатор Roca 500 мм', brand: 'Roca', category: 'radiators', price: 540000, stock: 28, unit: 'pcs', specifications: { size: '500mm' }, description: 'Компактный алюминиевый радиатор с высокой теплоотдачей и стильным дизайном.' },
  { sku: 'KOH-COL-3', slug: 'kohler-water-supply-collector-3-way', title: 'Коллектор систем водоснабжения Kohler 3-ходовой', brand: 'Kohler', category: 'water-supply', price: 990000, stock: 12, unit: 'pcs', specifications: { type: '3-way' }, description: 'Равномерное распределение потоков воды по зонам и удобный контроль давления.' },
  { sku: 'VT-PIPE-TEE-25', slug: 'valtec-tee-branch-25mm', title: 'Тройник Valtec 25 мм для труб', brand: 'Valtec', category: 'pipe-fittings', price: 32000, stock: 90, unit: 'pcs', specifications: { diameter: '25mm' }, description: 'Тройник для аккуратного соединения двух линий в одной точке сети.' },
  { sku: 'HNC-VALVE-1', slug: 'henco-ball-valve-1-inch', title: 'Шаровый кран Henco 1 дюйм', brand: 'Henco', category: 'taps-valves', price: 79000, stock: 52, unit: 'pcs', specifications: { diameter: '1"' }, description: 'Надёжный шаровый кран с быстрым перекрытием и плотным уплотнением.' },
  { sku: 'ROC-ACC-SET', slug: 'roca-plumbing-accessories-kit', title: 'Комплект сантехнических аксессуаров Roca', brand: 'Roca', category: 'plumbing-accessories', price: 470000, stock: 24, unit: 'pcs', specifications: { set: 'Complete' }, description: 'Универсальный набор креплений, заглушек и соединительных элементов для монтажа.' },
  { sku: 'UPN-COND-20', slug: 'uponor-pipe-connector-20mm', title: 'Муфта Uponor 20 мм для трубы', brand: 'Uponor', category: 'pipe-fittings', price: 28000, stock: 110, unit: 'pcs', specifications: { diameter: '20mm' }, description: 'Плотное и долговечное соединение для систем подпитки и распределения воды.' },
  { sku: 'AQU-BOIL-80', slug: 'aqua-electric-water-boiler-80l', title: 'Электрический бойлер Aqua 80 л', brand: 'Aqua', category: 'water-boilers', price: 14600000, stock: 18, unit: 'pcs', specifications: { volume: '80L' }, isHotDeal: true, description: 'Классический накопительный электрический водонагреватель для надёжной подачи тёплой воды.' },
  { sku: 'WVN-PEX-16', slug: 'wavin-pex-pipe-16mm', title: 'Металлопластиковая труба Wavin 16 мм', brand: 'Wavin', category: 'pipes', price: 34000, stock: 300, unit: 'meters', specifications: { diameter: '16mm' }, description: 'Гибкая труба для скрытой разводки в системах холодного и горячего водоснабжения.' },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const categories = await Category.find();
  const categoryIdBySlug = Object.fromEntries(categories.map((c) => [c.slug, c._id]));

  let created = 0;
  let updated = 0;

  for (const p of PRODUCTS) {
    const categoryId = categoryIdBySlug[p.category];
    if (!categoryId) {
      console.warn(`Skipping ${p.sku}: category "${p.category}" not found — run seedCategories.js first`);
      continue;
    }

    const doc = { ...p, category: categoryId };
    const result = await Product.findOneAndUpdate({ sku: p.sku }, doc, {
      upsert: true,
      new: true,
      rawResult: true,
    });
    if (result.lastErrorObject?.updatedExisting) updated += 1;
    else created += 1;
  }

  console.log(`Seeded products: ${created} created, ${updated} updated.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});

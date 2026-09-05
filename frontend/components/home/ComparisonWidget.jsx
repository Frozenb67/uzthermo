'use client';

import { useTranslation } from '../../lib/i18n/useTranslation';
import { useCompareStore } from '../../store/useCompareStore';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    title: 'Boiler 100L',
    sku: 'BOILER-100',
    slug: 'boiler-100l',
    specifications: {
      'Объём': '100 л',
      'Теплообменник': '1',
      'Высота': '850 мм',
      'Вес': '45 кг',
      'Диаметр': '460 мм',
      'Анод': '10 см',
      'Металл': '2 мм',
      'Полиуретан': '45 мм',
      'Вместимость': '95,2 л',
      'Максимальное давление': '10 бар',
      'Максимальная температура': '85°C',
      'Покраска': 'Эмаль',
    },
  },
  {
    id: 2,
    title: 'Boiler 150L',
    sku: 'BOILER-150',
    slug: 'boiler-150l',
    specifications: {
      'Объём': '150 л',
      'Теплообменник': '2',
      'Высота': '1100 мм',
      'Вес': '65 кг',
      'Диаметр': '520 мм',
      'Анод': '12 см',
      'Металл': '2 мм',
      'Полиуретан': '50 мм',
      'Вместимость': '145 л',
      'Максимальное давление': '10 бар',
      'Максимальная температура': '85°C',
      'Покраска': 'Эмаль',
    },
  },
  {
    id: 3,
    title: 'Boiler 200L',
    sku: 'BOILER-200',
    slug: 'boiler-200l',
    specifications: {
      'Объём': '200 л',
      'Теплообменник': '2',
      'Высота': '1200 мм',
      'Вес': '85 кг',
      'Диаметр': '580 мм',
      'Анод': '14 см',
      'Металл': '2.5 мм',
      'Полиуретан': '50 мм',
      'Вместимость': '195 л',
      'Максимальное давление': '10 бар',
      'Максимальная температура': '85°C',
      'Покраска': 'Эмаль',
    },
  },
];

function parseNumericValue(value) {
  if (typeof value === 'number') return value;
  const match = String(value).match(/[\d.]+/);
  return match ? Number(match[0]) : NaN;
}

function ComparisonWidget() {
  const { t } = useTranslation();
  const addItem = useCompareStore((s) => s.addItem);

  // Collect all unique characteristic names
  const allCharacteristics = new Set();
  SAMPLE_PRODUCTS.forEach((product) => {
    Object.keys(product.specifications).forEach((name) => {
      allCharacteristics.add(name);
    });
  });

  const sortedCharacteristics = Array.from(allCharacteristics).sort();

  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-charcoal mb-2">Сравнение товаров</h2>
            <p className="text-slate-600">Выберите товары для детального сравнения характеристик</p>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 bg-heat text-white px-6 py-3 rounded-full font-semibold hover:bg-heat/90 transition-colors"
          >
            Полное сравнение
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 w-48 sticky left-0 bg-slate-50 z-10">
                  Характеристика
                </th>
                {SAMPLE_PRODUCTS.map((product) => (
                  <th key={product.sku} className="px-6 py-4 text-center min-w-[200px]">
                    <div className="flex flex-col items-center gap-3">
                      <h3 className="font-bold text-charcoal text-sm">{product.title}</h3>
                      <button
                        type="button"
                        onClick={() => addItem(product)}
                        className="w-full bg-charcoal text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-charcoal/90 transition-colors"
                      >
                        Сравнить
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCharacteristics.map((characteristic, idx) => {
                const values = SAMPLE_PRODUCTS.map((p) => p.specifications[characteristic] || '—');
                const numericValues = values
                  .map((v) => (v !== '—' ? parseNumericValue(v) : NaN))
                  .filter((v) => !isNaN(v));
                
                const best = numericValues.length > 1 ? Math.max(...numericValues) : null;
                const worst = numericValues.length > 1 ? Math.min(...numericValues) : null;

                return (
                  <tr
                    key={characteristic}
                    className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100/50 transition-colors`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 sticky left-0 bg-inherit z-10">
                      {characteristic}
                    </td>
                    {values.map((value, i) => {
                      const parsedValue = parseNumericValue(value);
                      let bgColor = '';
                      
                      if (!isNaN(parsedValue) && numericValues.length > 1) {
                        if (parsedValue === best && best !== worst) {
                          bgColor = 'bg-emerald-50 text-emerald-700 font-semibold';
                        } else if (parsedValue === worst && best !== worst) {
                          bgColor = 'bg-red-50 text-red-700 font-semibold';
                        }
                      }

                      return (
                        <td
                          key={`${SAMPLE_PRODUCTS[i].sku}-${characteristic}`}
                          className={`px-6 py-4 text-center text-sm ${bgColor}`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/catalog"
            className="text-heat font-semibold hover:underline text-sm"
          >
            Выбрать другие товары
          </Link>
          <span className="text-slate-400">•</span>
          <Link
            href="/compare"
            className="text-heat font-semibold hover:underline text-sm"
          >
            Перейти к сравнению
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ComparisonWidget;

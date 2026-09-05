# Implementation Changes - Before & After

## File 1: ProductFormModal.jsx (Admin Form)

### BEFORE
```jsx
{/* Dynamic spec key/value editor */}
<div>
  <div className="flex items-center justify-between mb-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      Specifications
    </p>
    <button
      type="button"
      onClick={addSpecRow}
      className="flex items-center gap-1 text-xs font-semibold text-heat hover:underline"
    >
      <Plus size={13} /> Add spec
    </button>
  </div>
  <div className="space-y-2">
    {specs.map((row, i) => (
      <div key={i} className="flex items-center gap-2">
        <input
          placeholder="key (e.g. powerKW)"
          value={row.key}
          onChange={(e) => updateSpec(i, 'key', e.target.value)}
          className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-heat/30"
        />
        <input
          placeholder="value (e.g. 24)"
          value={row.value}
          onChange={(e) => updateSpec(i, 'value', e.target.value)}
          className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-heat/30"
        />
        <button
          type="button"
          onClick={() => removeSpecRow(i)}
          className="shrink-0 text-slate-300 hover:text-heat"
          aria-label="Remove spec"
        >
          <Trash2 size={15} />
        </button>
      </div>
    ))}
    {specs.length === 0 && (
      <p className="text-xs text-slate-400">No specifications yet — e.g. diameter: 20mm, powerKW: 24</p>
    )}
  </div>
</div>
```

### AFTER
```jsx
{/* Dynamic characteristics editor */}
<div>
  <div className="flex items-center justify-between mb-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      Characteristics
    </p>
    <button
      type="button"
      onClick={addSpecRow}
      className="flex items-center gap-1 text-xs font-semibold text-heat hover:underline"
    >
      <Plus size={13} /> Add characteristic
    </button>
  </div>
  <div className="space-y-2">
    {specs.map((row, i) => (
      <div key={i} className="flex items-center gap-2">
        <input
          placeholder="Characteristic name (e.g. Volume, Height)"
          value={row.key}
          onChange={(e) => updateSpec(i, 'key', e.target.value)}
          className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-heat/30"
        />
        <input
          placeholder="Value (e.g. 100 l, 850 mm)"
          value={row.value}
          onChange={(e) => updateSpec(i, 'value', e.target.value)}
          className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-heat/30"
        />
        <button
          type="button"
          onClick={() => removeSpecRow(i)}
          className="shrink-0 text-slate-300 hover:text-heat"
          aria-label="Remove characteristic"
        >
          <Trash2 size={15} />
        </button>
      </div>
    ))}
    {specs.length === 0 && (
      <p className="text-xs text-slate-400">No characteristics yet — e.g. Объём: 100 л, Вес: 45 кг</p>
    )}
  </div>
</div>
```

### Changes
- Label: "Specifications" → "Characteristics"
- Button: "Add spec" → "Add characteristic"
- Placeholder: "key (e.g. powerKW)" → "Characteristic name (e.g. Volume, Height)"
- Placeholder: "value (e.g. 24)" → "Value (e.g. 100 l, 850 mm)"
- Helper text: "diameter: 20mm, powerKW: 24" → "Объём: 100 л, Вес: 45 кг"
- aria-label: "Remove spec" → "Remove characteristic"

---

## File 2: Product Detail Page ([slug]/page.js)

### BEFORE
```jsx
return (
  <main className="min-h-screen bg-slate-50/60 py-8">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-slate-400">
        <Link href="/catalog" className="hover:text-heat">Catalog</Link>
        <span className="mx-2">/</span>{product.title}
      </nav>
      <section className="grid gap-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-10">
        {/* Gallery and product info */}
        {/* ... main product section ... */}
      </section>
    </div>
  </main>
);
```

### AFTER
```jsx
return (
  <main className="min-h-screen bg-slate-50/60 py-8">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-slate-400">
        <Link href="/catalog" className="hover:text-heat">Catalog</Link>
        <span className="mx-2">/</span>{product.title}
      </nav>
      <section className="grid gap-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-10">
        {/* Gallery and product info */}
        {/* ... main product section ... */}
      </section>

      {/* Characteristics Section - NEW */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="mt-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:p-10">
          <h2 className="mb-6 text-xl font-bold text-charcoal">Characteristics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(product.specifications).map(([name, value]) => (
              <div key={name} className="flex flex-col rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{name}</p>
                <p className="text-sm font-semibold text-charcoal">{String(value)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  </main>
);
```

### Changes
- Added new "Characteristics" section after main product section
- Displays all characteristics from `product.specifications`
- Responsive grid: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Only renders if product has characteristics

---

## File 3: Compare Page (page.js)

### BEFORE - Hardcoded Rows
```jsx
const HIGHER_IS_BETTER = {
  price: false,
  powerKW: true,
  stock: true,
};

function ROWS(items, t) {
  const hasKW = items.some((p) => p.specifications?.powerKW);
  const hasDiameter = items.some((p) => p.specifications?.diameter);

  return [
    { key: 'brand', label: t('brand'), get: (p) => p.brand, numeric: false },
    { key: 'price', label: 'Price', get: (p) => p.discountPrice || p.price, numeric: true, format: formatCurrency },
    hasKW ? { key: 'powerKW', label: t('power_output').replace(' (kW)', ''), get: (p) => p.specifications?.powerKW || null, numeric: true, format: (v) => `${v} kW` } : null,
    hasDiameter ? { key: 'diameter', label: t('pipe_diameter'), get: (p) => p.specifications?.diameter || null, numeric: false } : null,
    { key: 'unit', label: 'Sold By', get: (p) => (p.unit === 'meters' ? t('per_meter') : t('per_piece')), numeric: false },
    { key: 'stock', label: 'Stock', get: (p) => p.stock, numeric: true, format: (v) => `${v} units` },
  ].filter(Boolean);
}

// Usage:
const rows = ROWS(items, t);
```

### AFTER - Dynamic Rows
```jsx
const HIGHER_IS_BETTER = {
  price: false,
  // Default: assume higher is better for most characteristics
  // Override with false for characteristics where lower is better
};

function parseNumericValue(value) {
  if (typeof value === 'number') return value;
  // Try to extract numeric part from strings like "100 l", "850 mm", "45 кг"
  const match = String(value).match(/[\d.]+/);
  return match ? Number(match[0]) : NaN;
}

function generateDynamicRows(items, t) {
  // Collect all unique characteristic names from all products
  const allCharacteristicNames = new Set();
  
  items.forEach((product) => {
    if (product.specifications && typeof product.specifications === 'object') {
      Object.keys(product.specifications).forEach((name) => {
        allCharacteristicNames.add(name);
      });
    }
  });

  // Add standard fields at the top (Brand, Price, Unit, Stock)
  const standardRows = [];
  
  // Brand
  standardRows.push({
    key: 'brand',
    label: t('brand'),
    get: (p) => p.brand || '—',
    numeric: false,
  });

  // Price (always second, and lower is better)
  standardRows.push({
    key: 'price',
    label: 'Price',
    get: (p) => p.discountPrice || p.price,
    numeric: true,
    format: (v) => v ? `${Math.round(v).toLocaleString()} UZS` : '—',
  });

  // Unit / Sold By
  standardRows.push({
    key: 'unit',
    label: 'Sold By',
    get: (p) => (p.unit === 'meters' ? t('per_meter') : t('per_piece')),
    numeric: false,
  });

  // Stock
  standardRows.push({
    key: 'stock',
    label: 'Stock',
    get: (p) => p.stock,
    numeric: true,
    format: (v) => v !== null && v !== undefined ? `${v} units` : '—',
  });

  // Dynamic characteristics from products
  const characteristicRows = Array.from(allCharacteristicNames)
    .sort()
    .map((name) => {
      // Determine if this characteristic contains numeric values
      const values = items.map((p) => (p.specifications && p.specifications[name]) || null);
      const numericValues = values.map((v) => v !== null && v !== undefined ? parseNumericValue(v) : NaN).filter((v) => !isNaN(v));
      const isNumericCharacteristic = numericValues.length > 0 && numericValues.length === values.filter((v) => v !== null && v !== undefined).length;

      return {
        key: `spec_${name}`,
        label: name,
        get: (p) => (p.specifications && p.specifications[name]) || null,
        numeric: isNumericCharacteristic,
        format: (v) => (v !== null && v !== undefined ? String(v) : '—'),
      };
    });

  return [...standardRows, ...characteristicRows];
}

// Usage:
const rows = generateDynamicRows(items, t);
```

### Changes
- Removed hardcoded ROWS function with specific field names (powerKW, diameter)
- Added `parseNumericValue()` to extract numbers from strings with units
- Added `generateDynamicRows()` function that:
  - Collects all unique characteristic names dynamically
  - Creates rows for standard fields first (Brand, Price, Unit, Stock)
  - Creates rows for all characteristics (sorted A-Z)
  - Intelligently detects numeric characteristics
  - Handles missing characteristics (shows "—")
- Removed unused `formatCurrency` import

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Characteristics in Admin** | Generic "key/value" fields | Clear "Characteristic name/Value" with localized examples |
| **Product Page Display** | No characteristics shown | Full characteristics section with responsive grid |
| **Comparison Rows** | Hardcoded (only Brand, Price, PowerKW, Diameter, Unit, Stock) | Completely dynamic (all characteristics from products) |
| **Missing Characteristics** | N/A | Shows "—" for products missing a characteristic |
| **Numeric Detection** | Manual (hardcoded powerKW, stock) | Automatic (detects any numeric characteristic) |
| **Comparison Highlighting** | Only powerKW and stock | All numeric characteristics |
| **Scalability** | Limited to predefined fields | Unlimited characteristics |
| **Maintainability** | Code changes needed to add new fields | No code changes needed |

---

## Breaking Changes
✅ **NONE** - This is 100% backward compatible. All existing features continue to work.

## Migration Required
✅ **NONE** - Existing products continue to work. Characteristics are stored in existing `specifications` field.

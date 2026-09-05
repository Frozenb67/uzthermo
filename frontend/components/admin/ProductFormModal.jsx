'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Loader2, ImagePlus, Link2 } from 'lucide-react';
import { apiFetch, uploadImage, getProductImageUrl } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';

const MAX_IMAGE_MB = 10;

function slugify(text) {
  const transliteration = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    қ: 'q', ғ: 'g', ҳ: 'h', ў: 'u', ң: 'ng',
  };

  return text
    .toLowerCase()
    .split('')
    .map((character) => transliteration[character] ?? character)
    .join('')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const EMPTY_FORM = {
  title: '',
  sku: '',
  brand: '',
  category: '',
  price: '',
  discountPrice: '',
  stock: '',
  unit: 'pcs',
  description: '',
  isHotDeal: false,
  isFeatured: false,
};

/**
 * Create/edit modal for admin product management. Pass `product` (a full
 * product doc, with populated category) to edit, or omit it to create new.
 * `specifications` is edited as free-form key/value rows here and assembled
 * into a plain object on submit — the backend casts it into the Product
 * model's Mixed Map automatically.
 */
export default function ProductFormModal({ product, categories, isOpen, onClose, onSaved }) {
  const token = useAuthStore((s) => s.token);
  const isEdit = Boolean(product);

  const [form, setForm] = useState(EMPTY_FORM);
  const [specs, setSpecs] = useState([]); // [{ key, value }]
  const [variants, setVariants] = useState([]); // [{ size, price }]
  const [images, setImages] = useState([]); // backend-relative "/uploads/..." paths OR full external URLs
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        sku: product.sku || '',
        brand: product.brand || '',
        category: product.category?._id || product.category || '',
        price: product.price ?? '',
        discountPrice: product.discountPrice ?? '',
        stock: product.stock ?? '',
        unit: product.unit || 'pcs',
        description: product.description || '',
        isHotDeal: Boolean(product.isHotDeal),
        isFeatured: Boolean(product.isFeatured),
      });
      setSpecs(Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value: String(value) })));
      setVariants(Array.isArray(product.variants) ? product.variants.map((variant) => ({ size: variant.size || '', price: variant.price ?? '' })) : []);
      setImages(product.images || []);
    } else {
      setForm(EMPTY_FORM);
      setSpecs([]);
      setVariants([]);
      setImages([]);
    }
    setError('');
  }, [product, isOpen]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (fileInputRef.current) fileInputRef.current.value = ''; // allow re-picking the same file
    if (files.length === 0) return;

    setError('');
    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
          throw new Error(`${file.name} is over ${MAX_IMAGE_MB}MB`);
        }
        const url = await uploadImage(file, token);
        setImages((prev) => [...prev, url]);
      }
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  function addImageUrl() {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setError('Image URL must start with http:// or https://');
      return;
    }
    setError('');
    setImages((prev) => [...prev, url]);
    setImageUrlInput('');
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSpec(index, field, value) {
    setSpecs((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addSpecRow() {
    setSpecs((rows) => [...rows, { key: '', value: '' }]);
  }

  function removeSpecRow(index) {
    setSpecs((rows) => rows.filter((_, i) => i !== index));
  }

  function updateVariant(index, field, value) {
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addVariantRow() {
    setVariants((rows) => [...rows, { size: '', price: '' }]);
  }

  function removeVariantRow(index) {
    setVariants((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Guards the race where submitting fires before an in-flight image
    // upload resolves: the product would save with the old `images` array,
    // and the upload's setImages() would land a moment later into an
    // already-closed (and already-submitted) form, silently losing the image.
    if (uploading) {
      setError('Please wait for the image upload to finish before saving.');
      return;
    }

    if (!form.title || !form.sku || !form.category || !form.price || !form.stock) {
      setError('Title, SKU, category, price, and stock are required.');
      return;
    }

    const seenVariants = new Set();
    for (const variant of variants) {
      const size = variant.size.trim();
      if (!size) {
        setError('Enter a size for every variant.');
        return;
      }
      if (variant.price === '' || variant.price === null || variant.price === undefined) {
        setError(`Enter a price for size ${size}`);
        return;
      }
      if (!Number.isFinite(Number(variant.price)) || Number(variant.price) <= 0) {
        setError(`Price for size ${size} must be a number greater than 0`);
        return;
      }
      const key = size.toLowerCase();
      if (seenVariants.has(key)) {
        setError(`Variant ${size} already exists.`);
        return;
      }
      seenVariants.add(key);
    }

    const specifications = Object.fromEntries(
      specs.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value])
    );

    const generatedSlug = slugify(form.title);
    if (!generatedSlug) {
      setError('Title must contain letters or numbers so a product URL can be generated.');
      return;
    }

    const payload = {
      title: form.title,
      slug: isEdit ? product.slug || generatedSlug : generatedSlug,
      sku: form.sku.toUpperCase(),
      brand: form.brand,
      category: form.category,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
      unit: form.unit,
      description: form.description,
      isHotDeal: form.isHotDeal,
      isFeatured: form.isFeatured,
      specifications,
      images,
      variants: variants.map((variant) => ({ size: variant.size.trim(), price: Number(variant.price) })),
    };

    setSaving(true);
    try {
      const saved = isEdit
        ? await apiFetch(`/api/products/${product._id}`, { method: 'PUT', body: payload, token })
        : await apiFetch('/api/products', { method: 'POST', body: payload, token });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] overflow-y-auto">
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-7 my-8"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-charcoal"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <h2 className="text-lg font-bold text-charcoal mb-5">
                {isEdit ? 'Edit Product' : 'Add Product'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30 sm:col-span-2"
                  />
                  <input
                    required
                    placeholder="SKU"
                    value={form.sku}
                    onChange={(e) => update('sku', e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                  />
                  <input
                    placeholder="Brand"
                    value={form.brand}
                    onChange={(e) => update('brand', e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                  />

                  <select
                    required
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={form.unit}
                    onChange={(e) => update('unit', e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                  >
                    <option value="pcs">pcs</option>
                    <option value="meters">meters</option>
                  </select>

                  <input
                    required
                    type="number"
                    placeholder="Price (UZS)"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                  />
                  <input
                    type="number"
                    placeholder="Discount price (optional)"
                    value={form.discountPrice}
                    onChange={(e) => update('discountPrice', e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                  />
                  <input
                    required
                    type="number"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={(e) => update('stock', e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30"
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.isHotDeal}
                      onChange={(e) => update('isHotDeal', e.target.checked)}
                      className="accent-heat"
                    />
                    Hot deal
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => update('isFeatured', e.target.checked)}
                      className="accent-heat"
                    />
                    Featured product
                  </label>
                </div>

                {/* Size and price variants */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Sizes and prices
                    </p>
                    <button
                      type="button"
                      onClick={addVariantRow}
                      className="flex items-center gap-1 text-xs font-semibold text-heat hover:underline"
                    >
                      <Plus size={13} /> Add size
                    </button>
                  </div>
                  <div className="space-y-2">
                    {variants.map((variant, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          placeholder="Size / volume (e.g. 150 l)"
                          value={variant.size}
                          onChange={(e) => updateVariant(i, 'size', e.target.value)}
                          className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-heat/30"
                        />
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          placeholder="Price (UZS)"
                          value={variant.price}
                          onChange={(e) => updateVariant(i, 'price', e.target.value)}
                          className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-heat/30"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantRow(i)}
                          className="shrink-0 text-slate-300 hover:text-heat"
                          aria-label="Remove size"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                    {variants.length === 0 && (
                      <p className="text-xs text-slate-400">Sizes and prices not added</p>
                    )}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Images
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1 text-xs font-semibold text-heat hover:underline disabled:opacity-50"
                    >
                      {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                      {uploading ? 'Uploading…' : 'Upload image'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-1 rounded-lg border border-slate-200 px-3 py-2 focus-within:ring-2 focus-within:ring-heat/30">
                      <Link2 size={13} className="text-slate-400 shrink-0" />
                      <input
                        type="url"
                        placeholder="Or paste an image URL (https://…)"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addImageUrl();
                          }
                        }}
                        className="w-full text-xs outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="flex items-center gap-1 text-xs font-semibold text-heat border border-heat/30 rounded-lg px-3 py-2 hover:bg-heat/5 transition-colors shrink-0"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>

                  {images.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No images yet — the product card will show a placeholder until you upload one.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {images.map((img, i) => (
                        <div key={img + i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getProductImageUrl({ image: img })}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                            aria-label="Remove image"
                          >
                            <Trash2 size={16} />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-heat/90 text-white text-[9px] font-semibold text-center py-0.5">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <textarea
                  placeholder="Description"
                  rows={2}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-heat/30 resize-none"
                />

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

                {error && <p className="text-xs text-heat">{error}</p>}

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full flex items-center justify-center gap-2 bg-charcoal text-white text-sm font-semibold py-3 rounded-xl hover:bg-charcoal/90 transition-colors disabled:opacity-60"
                >
                  {(saving || uploading) && <Loader2 size={15} className="animate-spin" />}
                  {uploading ? 'Waiting for image upload…' : isEdit ? 'Save Changes' : 'Create Product'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

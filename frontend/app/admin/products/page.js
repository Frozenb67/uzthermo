'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Pencil, Trash2, Loader2, Star } from 'lucide-react';
import { apiFetch } from '../../../lib/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { formatCurrency } from '../../../lib/utils';
import ProductFormModal from '../../../components/admin/ProductFormModal';
import BulkPriceTool from '../../../components/admin/BulkPriceTool';

export default function AdminProductsPage() {
  const token = useAuthStore((s) => s.token);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiFetch('/api/products?limit=200'),
        apiFetch('/api/categories'),
      ]);
      setProducts(productsData.items);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Could not load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openCreate() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  function handleSaved(saved) {
    setProducts((prev) => {
      const exists = prev.some((p) => p._id === saved._id);
      return exists ? prev.map((p) => (p._id === saved._id ? saved : p)) : [saved, ...prev];
    });
  }

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    setDeletingId(product._id);
    try {
      await apiFetch(`/api/products/${product._id}`, { method: 'DELETE', token });
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      alert(err.message || 'Could not delete product');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-heat mb-1">
            <Package size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide">Product Management</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal">Products</h1>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-heat text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-heat/90 transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {categories.length > 0 && (
        <div className="mb-6">
          <BulkPriceTool categories={categories} onApplied={loadAll} />
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-heat/5 border border-heat/20 text-heat text-sm px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading products…</p>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-charcoal max-w-xs truncate">
                    <span className="inline-flex items-center gap-1.5">
                      {p.isFeatured && <Star size={13} className="text-amber-500" fill="currentColor" />}
                      {p.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{p.sku}</td>
                  <td className="px-4 py-3 text-slate-500">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{p.stock} {p.unit}</td>
                  <td className="px-4 py-3 text-right font-semibold text-charcoal">
                    {formatCurrency(p.discountPrice || p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-heat hover:bg-heat/5 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p._id}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-heat hover:bg-heat/5 transition-colors disabled:opacity-50"
                        aria-label="Delete"
                      >
                        {deletingId === p._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-10">
              No products yet — click &quot;Add Product&quot; to create the first one.
            </p>
          )}
        </div>
      )}

      <ProductFormModal
        isOpen={modalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with ${res.status}`);
  }
  return data;
}

// Flattens a backend Product doc (populated category, Map-as-object specs)
// into the same shape frontend/lib/mockData.js's PRODUCTS use — so catalog,
// cart, wishlist, compare, and product-detail components don't need to know
// or care whether a product came from the live API or the demo fallback.
export function normalizeProduct(p) {
  return {
    _id: p._id,
    sku: p.sku,
    slug: p.slug,
    title: p.title,
    brand: p.brand,
    category: p.category?.slug || p.category || '',
    images: p.images || [],
    image: p.images?.[0] || null,
    price: p.price,
    discountPrice: p.discountPrice || null,
    variants: Array.isArray(p.variants) ? p.variants : [],
    stock: p.stock,
    unit: p.unit,
    specifications: p.specifications || {},
    isHotDeal: Boolean(p.isHotDeal),
    description: p.description || '',
  };
}

// Resolves a product's image to a URL an <img> tag can actually load.
// Uploaded images come back from the backend as relative paths (e.g.
// "/uploads/xyz.png") which must be pointed at the API origin, not the
// frontend's own origin. The bundled demo catalog's placeholder paths
// (lib/mockData.js) don't correspond to real files, so this returns null
// for those — callers should fall back to a plain gray box in that case.
export function getProductImageUrl(product) {
  const path = product?.image || product?.images?.[0];
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/')) return `${API_BASE}${path}`;
  return null;
}

// Uploads a single image file (from an <input type="file">) and returns its
// backend-relative URL, e.g. "/uploads/167...-photo.png". Admin/manager only.
export async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Upload failed with ${res.status}`);
  }
  return data.url;
}

// Best-effort live fetch — returns null (never throws) so every call site can
// fall back to the bundled demo catalog when the backend is offline or empty.
export async function tryFetchLiveProducts(query = '') {
  try {
    const data = await apiFetch(`/api/products?limit=200${query}`);
    if (!data.items?.length) return null;
    return data.items.map(normalizeProduct);
  } catch {
    return null;
  }
}

export async function tryFetchLiveProductBySlug(slug) {
  try {
    const data = await apiFetch(`/api/products/${slug}`);
    return normalizeProduct(data);
  } catch {
    return null;
  }
}

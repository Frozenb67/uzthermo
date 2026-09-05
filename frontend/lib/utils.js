export function formatCurrency(amount, currency = 'UZS') {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return `${new Intl.NumberFormat('ru-RU').format(amount)} UZS`;
}

export function discountPercent(price, discountPrice) {
  if (!discountPrice || !price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

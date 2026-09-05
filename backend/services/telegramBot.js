const axios = require('axios');
const Settings = require('../models/Settings');

const TELEGRAM_API = 'https://api.telegram.org';

// Bot credentials are editable at runtime from the admin panel (Settings model),
// with .env values as the fallback for first boot. Cached briefly so every order
// doesn't hit the DB, but a token/chat-id change in /admin takes effect within a minute.
let cachedConfig = null;
let cachedAt = 0;
const CONFIG_TTL_MS = 60 * 1000;

async function getConfig() {
  const now = Date.now();
  if (cachedConfig && now - cachedAt < CONFIG_TTL_MS) {
    return cachedConfig;
  }

  try {
    const settings = await Settings.getSingleton();
    cachedConfig = {
      token: settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '',
      chatId: settings.telegramChatId || process.env.TELEGRAM_CHAT_ID || '',
      usdExchangeRate: settings.usdExchangeRate || 12700,
    };
  } catch (error) {
    // DB unavailable — fall back to env vars so the bot still works.
    cachedConfig = {
      token: process.env.TELEGRAM_BOT_TOKEN || '',
      chatId: process.env.TELEGRAM_CHAT_ID || '',
      usdExchangeRate: 12700,
    };
  }

  cachedAt = now;
  return cachedConfig;
}

// Call after saving new credentials from the admin panel so the next
// notification picks them up immediately instead of waiting for the TTL.
function invalidateConfigCache() {
  cachedConfig = null;
  cachedAt = 0;
}

async function telegramRequest(method, payload) {
  const { token } = await getConfig();

  if (!token) {
    console.warn(`[telegramBot] No bot token configured, skipping ${method}`);
    return null;
  }

  try {
    const { data } = await axios.post(`${TELEGRAM_API}/bot${token}/${method}`, payload, {
      timeout: 10000,
    });
    return data;
  } catch (error) {
    console.error(`[telegramBot] ${method} failed:`, error.response?.data || error.message);
    return null;
  }
}

async function sendMessage(text, options = {}) {
  const { chatId } = await getConfig();
  if (!chatId) {
    console.warn('[telegramBot] No chat id configured, skipping sendMessage');
    return null;
  }

  return telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
    ...options,
  });
}

async function sendLocation(latitude, longitude, options = {}) {
  const { chatId } = await getConfig();
  if (!chatId) {
    console.warn('[telegramBot] No chat id configured, skipping sendLocation');
    return null;
  }

  return telegramRequest('sendLocation', {
    chat_id: chatId,
    latitude,
    longitude,
    ...options,
  });
}

function googleMapsLinkFromCoords(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function googleMapsLinkFromAddress(addressText) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;
}

function formatMoney(amount, currency, usdExchangeRate) {
  if (currency === 'USD') {
    const usd = amount / usdExchangeRate;
    return `$${usd.toFixed(2)}`;
  }
  return `${new Intl.NumberFormat('ru-RU').format(amount)} UZS`;
}

function formatAddress(deliveryAddress) {
  if (!deliveryAddress) return null;
  if (deliveryAddress.raw) return deliveryAddress.raw;

  const parts = [
    deliveryAddress.region,
    deliveryAddress.city,
    deliveryAddress.street,
    deliveryAddress.building,
    deliveryAddress.apartment ? `apt. ${deliveryAddress.apartment}` : null,
    deliveryAddress.landmark,
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : null;
}

const PAYMENT_LABELS = {
  cash: 'Cash on Delivery',
  card: 'Card',
  click: 'Click',
  payme: 'Payme',
  bank_transfer: 'Bank Transfer',
};

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function buildOrderMessage(order) {
  const { usdExchangeRate } = await getConfig();
  const customerName = order.user?.name || order.guest?.name || 'Unknown';
  const customerPhone = order.user?.phone || order.guest?.phone || 'N/A';

  const itemLines = order.items
    .map((item) => {
      const specBits = [];
      if (item.selectedUnit) specBits.push(item.selectedUnit);
      const specText = specBits.length ? ` (${specBits.join(', ')})` : '';
      return `  • ${escapeHtml(item.title)}${specText} — ${item.qty} × ${formatMoney(item.unitPrice, order.currency, usdExchangeRate)}`;
    })
    .join('\n');

  const addressText = formatAddress(order.deliveryAddress);
  const hasCoords = Boolean(order.deliveryLocation?.lat && order.deliveryLocation?.lng);

  // Location gets its own bold, unmissable block near the top of the message —
  // this is the single most operationally important field for the delivery driver.
  const locationBlock = [];
  if (hasCoords) {
    const { lat, lng } = order.deliveryLocation;
    locationBlock.push('📍 <b>CUSTOMER LOCATION (GPS shared)</b>');
    if (addressText) locationBlock.push(escapeHtml(addressText));
    locationBlock.push(`Coordinates: <code>${lat}, ${lng}</code>`);
    locationBlock.push(`<a href="${googleMapsLinkFromCoords(lat, lng)}">Open live location on Google Maps</a>`);
    locationBlock.push('(a live map pin follows this message)');
  } else if (addressText) {
    locationBlock.push('📍 <b>CUSTOMER LOCATION (address only)</b>');
    locationBlock.push(escapeHtml(addressText));
    locationBlock.push(`<a href="${googleMapsLinkFromAddress(addressText)}">Open on Google Maps</a>`);
  } else {
    locationBlock.push('📍 <b>CUSTOMER LOCATION:</b> Not provided — call to confirm delivery address');
  }

  const lines = [
    `🛒 <b>New Order #${String(order._id).slice(-6).toUpperCase()}</b>`,
    `🗓 ${new Date(order.createdAt || Date.now()).toLocaleString('en-GB')}`,
    '',
    `👤 <b>Customer:</b> ${escapeHtml(customerName)}`,
    `📞 <b>Phone:</b> ${escapeHtml(customerPhone)}`,
    '',
    ...locationBlock,
    '',
    '📦 <b>Items:</b>',
    itemLines,
    '',
    `💰 <b>Total:</b> ${formatMoney(order.totalPrice, order.currency, usdExchangeRate)}`,
    `💳 <b>Payment:</b> ${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}`,
    order.installerRequested ? '🛠 <b>Installer requested</b>' : null,
  ].filter((line) => line !== null);

  return lines.join('\n');
}

/**
 * Main entry point — call this right after Order.create() in the order controller.
 * Sends the formatted order summary, then a native Telegram map marker
 * (bot.sendLocation) if the customer shared GPS coordinates at checkout.
 * Never throws: a Telegram outage must not block order placement.
 */
async function notifyNewOrder(order) {
  try {
    const message = await buildOrderMessage(order);
    await sendMessage(message);

    if (order.deliveryLocation?.lat && order.deliveryLocation?.lng) {
      await sendLocation(order.deliveryLocation.lat, order.deliveryLocation.lng);
    }

    return true;
  } catch (error) {
    console.error('[telegramBot] notifyNewOrder failed:', error.message);
    return false;
  }
}

async function notifyOrderStatusChange(order) {
  try {
    const customerName = order.user?.name || order.guest?.name || 'Customer';
    const message = [
      `🔔 <b>Order #${String(order._id).slice(-6).toUpperCase()} updated</b>`,
      `Customer: ${escapeHtml(customerName)}`,
      `New status: <b>${order.status}</b>`,
    ].join('\n');
    await sendMessage(message);
    return true;
  } catch (error) {
    console.error('[telegramBot] notifyOrderStatusChange failed:', error.message);
    return false;
  }
}

module.exports = {
  sendMessage,
  sendLocation,
  notifyNewOrder,
  notifyOrderStatusChange,
  invalidateConfigCache,
  googleMapsLinkFromCoords,
  googleMapsLinkFromAddress,
};

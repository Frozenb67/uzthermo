// Superseded by ../services/telegramBot.js (adds dynamic admin-configurable
// credentials, sendLocation, and HTML order formatting). Re-exported here so
// any existing imports of this path keep working.
const { sendMessage } = require('../services/telegramBot');

module.exports = { sendTelegramMessage: sendMessage };

const Settings = require('../models/Settings');
const { invalidateConfigCache } = require('../services/telegramBot');

async function getSettings(req, res, next) {
  try {
    const settings = await Settings.getSingleton();
    // Never leak the raw bot token to the client — only whether it's set.
    res.json({
      telegramChatId: settings.telegramChatId,
      telegramBotTokenSet: Boolean(settings.telegramBotToken),
      usdExchangeRate: settings.usdExchangeRate,
    });
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const { telegramBotToken, telegramChatId, usdExchangeRate } = req.body;

    const settings = await Settings.getSingleton();
    if (telegramBotToken !== undefined) settings.telegramBotToken = telegramBotToken;
    if (telegramChatId !== undefined) settings.telegramChatId = telegramChatId;
    if (usdExchangeRate !== undefined) settings.usdExchangeRate = usdExchangeRate;
    await settings.save();

    invalidateConfigCache();

    res.json({
      telegramChatId: settings.telegramChatId,
      telegramBotTokenSet: Boolean(settings.telegramBotToken),
      usdExchangeRate: settings.usdExchangeRate,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSettings, updateSettings };

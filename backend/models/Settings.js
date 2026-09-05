const mongoose = require('mongoose');

// Singleton document holding store-wide runtime configuration that admins can
// edit from the dashboard without redeploying (Telegram bot credentials, etc).
const settingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'app_settings',
      unique: true,
    },
    telegramBotToken: {
      type: String,
      default: '',
    },
    telegramChatId: {
      type: String,
      default: '',
    },
    usdExchangeRate: {
      type: Number,
      default: 12700,
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let settings = await this.findOne({ singletonKey: 'app_settings' });
  if (!settings) {
    settings = await this.create({
      singletonKey: 'app_settings',
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
      telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);

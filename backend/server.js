const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

// --- Telegram Bot Setup ---
const token = process.env.TELEGRAM_BOT_TOKEN;
const ROOT_CHAT_ID = process.env.TELEGRAM_ROOT_CHAT_ID;
let bot;

if (token && ROOT_CHAT_ID) {
  bot = new TelegramBot(token, { polling: true });
  console.log('🤖 Telegram Bot initialized.');

  bot.on('polling_error', (error) => {
    console.error(`Telegram Polling Error: ${error.code} - ${error.message}`);
  });
  
  // Optional: Respond to /start command for confirmation
  bot.onText(/\/start/, (msg) => {
    if (String(msg.chat.id) === String(ROOT_CHAT_ID)) {
        bot.sendMessage(msg.chat.id, '🚀 **نظام المراقبة متصل.**', { parse_mode: 'Markdown' });
    }
  });

} else {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN or TELEGRAM_ROOT_CHAT_ID not found in environment variables. Bot notifications will be disabled.');
}


// --- Express Server Setup ---
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- API Endpoints ---

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Notification endpoint for Telegram bot
app.post('/api/notify', (req, res) => {
    if (!bot) {
        return res.status(503).json({ status: 'error', message: 'Telegram Bot is not configured.' });
    }

    const { event, details, user, isRoot } = req.body;

    let icon = isRoot ? '🚨' : '🔔';
    let title = isRoot ? 'نشاط بصلاحيات جذرية (ROOT)' : 'نشاط مستخدم';
    
    const message = `${icon} <b>${title}</b>\n` +
                    `👤 <b>المستخدم:</b> ${user}\n` +
                    `📌 <b>الحدث:</b> ${event}\n` +
                    `📝 <b>التفاصيل:</b> ${details}\n` +
                    `⏰ <b>الوقت:</b> ${new Date().toLocaleTimeString('ar-YE')}`;

    bot.sendMessage(ROOT_CHAT_ID, message, { parse_mode: 'HTML' }).catch(err => {
        console.error("Failed to send Telegram message:", err.message);
    });
    
    res.json({ status: 'sent' });
});

app.listen(port, () => {
  console.log(`✅ YemenJPT backend listening at http://localhost:${port}`);
});

require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
  console.log("❌ BOT_TOKEN Missing");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

const sessions = {};

const durations = [
  { id: "1h", name: "1 Hours", price: 10 },
  { id: "5h", name: "5 Hours", price: 20 },
  { id: "1d", name: "1 Days", price: 80 },
  { id: "3d", name: "3 Days", price: 150 },
  { id: "7d", name: "7 Days", price: 250 },
  { id: "30d", name: "30 Days", price: 350 },
  { id: "60d", name: "60 Days", price: 500 }
];

const bulkOptions = [1, 5, 10, 25, 50, 100, 200];

function mainMenu(chatId) {
  sessions[chatId] = {
    game: "PUBG MOBILE INDIA",
    devices: 1,
    duration: null,
    bulk: 1,
    customKey: ""
  };

  bot.sendMessage(chatId, `
🔥 *MIJANUR KURO AI GLASS BOT*

🎮 Game: PUBG MOBILE INDIA

Select option below:
`, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎮 Game Select", callback_data: "game" }],
        [{ text: "📱 Max Devices", callback_data: "devices" }],
        [{ text: "⏳ Duration", callback_data: "duration" }],
        [{ text: "🔑 Use Custom Key", callback_data: "custom" }],
        [{ text: "📦 Bulk Generation", callback_data: "bulk" }],
        [{ text: "💰 Cost Estimation", callback_data: "cost" }],
        [{ text: "✅ Generate License", callback_data: "generate" }]
      ]
    }
  });
}

bot.onText(/\/start/, msg => {
  mainMenu(msg.chat.id);
});

bot.on("callback_query", async query => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (!sessions[chatId]) {
    sessions[chatId] = {
      game: "PUBG MOBILE INDIA",
      devices: 1,
      duration: null,
      bulk: 1,
      customKey: ""
    };
  }

  const s = sessions[chatId];

  if (data === "game") {
    s.game = "PUBG MOBILE INDIA";
    bot.sendMessage(chatId, `
🎮 *GAME SELECTED*

✅ PUBG MOBILE INDIA
`, { parse_mode: "Markdown" });
  }

  if (data === "devices") {
    bot.sendMessage(chatId, `
📱 *MAX DEVICES*

Type device quantity.

Example:
1
2
5
10
`, { parse_mode: "Markdown" });

    s.waiting = "devices";
  }

  if (data === "duration") {
    bot.sendMessage(chatId, `
⏳ *SELECT DURATION*

Choose one option:
`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: durations.map(d => [
          { text: `${d.name} — ₹${d.price}/Device`, callback_data: `dur_${d.id}` }
        ])
      }
    });
  }

  if (data.startsWith("dur_")) {
    const id = data.replace("dur_", "");
    s.duration = durations.find(d => d.id === id);

    bot.sendMessage(chatId, `
✅ *DURATION SELECTED*

⏳ ${s.duration.name}
💰 ₹${s.duration.price}/Device
`, { parse_mode: "Markdown" });
  }

  if (data === "custom") {
    bot.sendMessage(chatId, `
🔑 *CUSTOM KEY*

Type your custom key.

Example:
MIJANUR-VIP-001

Send "skip" for auto key.
`, { parse_mode: "Markdown" });

    s.waiting = "custom";
  }

  if (data === "bulk") {
    bot.sendMessage(chatId, `
📦 *BULK GENERATION*

Select total keys:
`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: bulkOptions.map(n => [
          { text: `${n} Key${n > 1 ? "s" : ""}`, callback_data: `bulk_${n}` }
        ])
      }
    });
  }

  if (data.startsWith("bulk_")) {
    s.bulk = Number(data.replace("bulk_", ""));

    bot.sendMessage(chatId, `
✅ *BULK SELECTED*

📦 Total Keys: ${s.bulk}
`, { parse_mode: "Markdown" });
  }

  if (data === "cost") {
    if (!s.duration) {
      return bot.sendMessage(chatId, "⚠️ Please select Duration first.");
    }

    const total = s.devices * s.duration.price * s.bulk;

    bot.sendMessage(chatId, `
💰 *COST ESTIMATION*

🎮 Game: ${s.game}
📱 Devices: ${s.devices}
⏳ Duration: ${s.duration.name}
📦 Bulk: ${s.bulk} Key
💵 Price: ₹${s.duration.price}/Device

✅ Total Cost: ₹${total}
`, { parse_mode: "Markdown" });
  }

  if (data === "generate") {
    if (!s.duration) {
      return bot.sendMessage(chatId, "⚠️ Please select Duration first.");
    }

    const total = s.devices * s.duration.price * s.bulk;
    let keys = [];

    for (let i = 1; i <= s.bulk; i++) {
      const key = s.customKey
        ? `${s.customKey}-${i}`
        : `KURO-${s.game.replaceAll(" ", "")}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
      keys.push(key);
    }

    bot.sendMessage(chatId, `
✅ *LICENSE GENERATED SUCCESSFULLY*

🎮 Game: ${s.game}
📱 Max Devices: ${s.devices}
⏳ Duration: ${s.duration.name}
📦 Total Keys: ${s.bulk}
💰 Total Cost: ₹${total}

🔑 *LICENSE KEYS:*

${keys.map(k => `\`${k}\``).join("\n")}

🔥 MIJANUR KURO AI GLASS BOT
`, { parse_mode: "Markdown" });
  }

  bot.answerCallbackQuery(query.id);
});

bot.on("message", msg => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!sessions[chatId] || text.startsWith("/")) return;

  const s = sessions[chatId];

  if (s.waiting === "devices") {
    const num = Number(text);

    if (!num || num < 1) {
      return bot.sendMessage(chatId, "❌ Invalid device number. Example: 1");
    }

    s.devices = num;
    s.waiting = null;

    bot.sendMessage(chatId, `
✅ *MAX DEVICES SAVED*

📱 Devices: ${s.devices}
`, { parse_mode: "Markdown" });
  }

  if (s.waiting === "custom") {
    if (text.toLowerCase() === "skip") {
      s.customKey = "";
      bot.sendMessage(chatId, "✅ Auto key mode selected.");
    } else {
      s.customKey = text;
      bot.sendMessage(chatId, `
✅ *CUSTOM KEY SAVED*

🔑 ${s.customKey}
`, { parse_mode: "Markdown" });
    }

    s.waiting = null;
  }
});

console.log("✅ Kuro Telegram Bot Started Successfully");
const { Telegraf, Markup } = require('telegraf');
const { Low, JSONFile } = require('lowdb');

const bot = new Telegraf('7171985185:AAFEZwue6ATQI-Mz8NZNFhwv00OHKPsUXUs'); // Tokenni almashtir

// Database sozlamasi
const adapter = new JSONFile('db.json');
const db = new Low(adapter);
await db.read();
db.data ||= { ratings: [] };

// Guruhdagi har bir xabardan keyin baholash tugmalari chiqarish
bot.on('message', async (ctx) => {
  if (!ctx.message || !ctx.message.text || ctx.message.chat.type === 'private') return;

  const msgId = ctx.message.message_id;
  const chatId = ctx.message.chat.id;

  await ctx.reply('Iltimos, ushbu xabarga baho bering:', {
    reply_to_message_id: msgId,
    ...Markup.inlineKeyboard([
      [Markup.button.callback('👍', `like_${chatId}_${msgId}`), Markup.button.callback('👎', `dislike_${chatId}_${msgId}`)]
    ])
  });
});

// Baholash tugmalariga ishlov berish
bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  const [action, chatId, msgId] = callbackData.split('_');

  // Foydalanuvchi oldin baho berganmi?
  const oldRating = db.data.ratings.find(r => r.userId === userId && r.msgId === msgId && r.chatId === chatId);
  if (oldRating) {
    await ctx.answerCbQuery('Siz allaqachon baho bergansiz!');
    return;
  }

  // Yangi bahoni saqlash
  db.data.ratings.push({
    userId,
    chatId,
    msgId,
    value: action === 'like' ? 1 : -1
  });
  await db.write();

  await ctx.answerCbQuery(`Siz ${action === 'like' ? '👍' : '👎'} baho berdingiz!`);

  // Baho statistikasi
  const allRatings = db.data.ratings.filter(r => r.msgId === msgId && r.chatId === chatId);
  const likes = allRatings.filter(r => r.value === 1).length;
  const dislikes = allRatings.filter(r => r.value === -1).length;

  await ctx.editMessageReplyMarkup({
    inline_keyboard: [
      [
        Markup.button.callback(`👍 ${likes}`, `like_${chatId}_${msgId}`),
        Markup.button.callback(`👎 ${dislikes}`, `dislike_${chatId}_${msgId}`)
      ]
    ]
  });
});

bot.launch();

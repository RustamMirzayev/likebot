import { Telegraf, Markup } from 'telegraf';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Bot tokenni environment variable dan oling (railway uchun tavsiya etiladi)
const bot = new Telegraf(process.env.BOT_TOKEN);

// lowdb uchun adapter va default data
const adapter = new JSONFile('db.json');
const defaultData = { ratings: [] };
const db = new Low(adapter, defaultData);

async function main() {
  // DBni o'qiymiz
  await db.read();

  // Agar ma'lumot bo'lmasa defaultni qo'yamiz
  db.data ||= defaultData;

  // Har qanday guruhdagi matnga javobda baholash tugmalarini yuborish
  bot.on('message', async (ctx) => {
    // Private chatda ishlatmaymiz
    if (ctx.chat.type === 'private' || !ctx.message.text) return;

    const msgId = ctx.message.message_id;
    const chatId = ctx.chat.id;

    await ctx.reply('Iltimos, ushbu xabarga baho bering:', {
      reply_to_message_id: msgId,
      ...Markup.inlineKeyboard([
        [Markup.button.callback('👍', `like_${chatId}_${msgId}`), Markup.button.callback('👎', `dislike_${chatId}_${msgId}`)]
      ])
    });
  });

  // Baholash tugmalari bosilganda ishlov berish
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

    // Yangi bahoni saqlaymiz
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

    // Tugmalarni yangilash
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
  console.log('Bot ishga tushdi');
}

main();

import { Telegraf, Markup } from 'telegraf';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const bot = new Telegraf('TOKENINGIZNI_BUYERGA_QOYING'); // Tokeningizni yozing

// Lowdb uchun adapter yaratamiz
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

// Async funktsiyani ishga tushiramiz, await ishlatish uchun
async function main() {
  await db.read();
  db.data ||= { ratings: [] };

  // Guruhdagi har bir xabarga baholash tugmalari qo'shamiz
  bot.on('message', async (ctx) => {
    if (!ctx.message || !ctx.message.text) return;
    if (ctx.message.chat.type === 'private') return; // faqat guruhlar uchun

    const msgId = ctx.message.message_id;
    const chatId = ctx.message.chat.id;

    await ctx.reply('Iltimos, ushbu xabarga baho bering:', {
      reply_to_message_id: msgId,
      ...Markup.inlineKeyboard([
        [Markup.button.callback('👍', `like_${chatId}_${msgId}`), Markup.button.callback('👎', `dislike_${chatId}_${msgId}`)]
      ])
    });
  });

  // Baholash tugmalariga ishlov beramiz
  bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    const userId = ctx.from.id;

    const [action, chatId, msgId] = callbackData.split('_');

    // Foydalanuvchi allaqachon baho berganmi?
    const oldRating = db.data.ratings.find(r => r.userId === userId && r.msgId === Number(msgId) && r.chatId === Number(chatId));
    if (oldRating) {
      await ctx.answerCbQuery('Siz allaqachon baho bergansiz!');
      return;
    }

    // Yangi bahoni saqlaymiz
    db.data.ratings.push({
      userId,
      chatId: Number(chatId),
      msgId: Number(msgId),
      value: action === 'like' ? 1 : -1
    });
    await db.write();

    await ctx.answerCbQuery(`Siz ${action === 'like' ? '👍' : '👎'} baho berdingiz!`);

    // Hozirgi xabar uchun baho statistikasi
    const allRatings = db.data.ratings.filter(r => r.msgId === Number(msgId) && r.chatId === Number(chatId));
    const likes = allRatings.filter(r => r.value === 1).length;
    const dislikes = allRatings.filter(r => r.value === -1).length;

    // Tugmalarni baholar soni bilan yangilaymiz
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          Markup.button.callback(`👍 ${likes}`, `like_${chatId}_${msgId}`),
          Markup.button.callback(`👎 ${dislikes}`, `dislike_${chatId}_${msgId}`)
        ]
      ]
    });
  });

  // Botni ishga tushiramiz
  bot.launch();
  console.log('Bot ishga tushdi...');
}

// Async funktsiyani chaqiramiz
main();

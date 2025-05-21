import { Telegraf, Markup } from 'telegraf';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
const bot = new Telegraf('7742188405:AAFsOeT9JQATnho8h5GqeMfYDWtu7aOu4hc');
const adapter = new JSONFile('db.json');
const defaultData = { ratings: [] };
const db = new Low(adapter, defaultData);
async function main() {
  await db.read();
  db.data ||= defaultData;
  bot.on('message', async (ctx) => {
    if (ctx.chat.type === 'private' || !ctx.message.text) return;
    const msgId = ctx.message.message_id;
    const chatId = ctx.chat.id;
    if(ctx.message.text.includes("#")){
    await ctx.reply('Iltimos, postga baho bering:', {
      reply_to_message_id: msgId,
      ...Markup.inlineKeyboard([
        [Markup.button.callback('👍', `like_${chatId}_${msgId}`), Markup.button.callback('👎', `dislike_${chatId}_${msgId}`)]
      ])
    });
    }
  });
  bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    const userId = ctx.from.id;
    const [action, chatId, msgId] = callbackData.split('_');
    const oldRating = db.data.ratings.find(r => r.userId === userId && r.msgId === msgId && r.chatId === chatId);
    if (oldRating) {
      await ctx.answerCbQuery('Siz allaqachon baho bergansiz!');
      return;
    }
    db.data.ratings.push({
      userId,
      chatId,
      msgId,
      value: action === 'like' ? 1 : -1
    });
    await db.write();
    await ctx.answerCbQuery(`Siz ${action === 'like' ? '👍' : '👎'} baho berdingiz!`);
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
  console.log('Bot ishga tushdi');
}

main();

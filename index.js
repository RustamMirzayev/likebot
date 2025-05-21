import { Telegraf, Markup } from 'telegraf';

const bot = new Telegraf('7171985185:AAFEZwue6ATQI-Mz8NZNFhwv00OHKPsUXUs');

const likesCount = {};

bot.on('message', async (ctx) => {
  const text = ctx.message.text;
  if (text && text.trim().endsWith('#')) {
    const messageId = ctx.message.message_id;

    await ctx.reply('Like yoki Unlike bosing:', Markup.inlineKeyboard([
      Markup.button.callback(`👍 Like (${likesCount[messageId]?.like || 0})`, `like_${messageId}`),
      Markup.button.callback(`👎 Unlike (${likesCount[messageId]?.unlike || 0})`, `unlike_${messageId}`),
    ]));
  }
});

bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  const [action, messageId] = data.split('_');

  if (!likesCount[messageId]) {
    likesCount[messageId] = { like: 0, unlike: 0, users: new Set() };
  }

  if (!likesCount[messageId].users.has(userId)) {
    if (action === 'like') {
      likesCount[messageId].like++;
    } else if (action === 'unlike') {
      likesCount[messageId].unlike++;
    }
    likesCount[messageId].users.add(userId);

    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          { text: `👍 Like (${likesCount[messageId].like})`, callback_data: `like_${messageId}` },
          { text: `👎 Unlike (${likesCount[messageId].unlike})`, callback_data: `unlike_${messageId}` }
        ]
      ]
    });

    await ctx.answerCbQuery('Sizning ovozingiz qabul qilindi!');
  } else {
    await ctx.answerCbQuery('Siz allaqachon ovoz berdingiz!', { show_alert: true });
  }
});

bot.launch();
console.log('Bot ishga tushdi');

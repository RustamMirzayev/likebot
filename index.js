import { Telegraf, Markup } from "telegraf";

const botToken = '7691683453:AAFYXGzYEvfYbhzErB_vfygKxXUvXXUgESo';
if (!botToken) {
  console.error("Bot token topilmadi!");
  process.exit(1);
}

const bot = new Telegraf(botToken);

// Храним реакции для каждого сообщения
const postReactions = new Map(); // key: messageId, value: { like: Set, unlike: Set }

bot.on("message", async (ctx) => {
  try {
    const text = ctx.message.text;
    if (!text) return;

    // Проверяем наличие хэштега
    const hasHashtag = ctx.message.entities?.some(e => e.type === "hashtag");
    if (!hasHashtag) return;

    const msgId = ctx.message.message_id;

    // Если реакции уже есть - не создаём заново
    if (!postReactions.has(msgId)) {
      postReactions.set(msgId, {
        like: new Set(),
        unlike: new Set()
      });

      await ctx.reply(
        "Reaksiya qoldiring:",
        {
          reply_to_message_id: msgId,
          ...Markup.inlineKeyboard([
            Markup.button.callback("👍 0", `like_${msgId}`),
            Markup.button.callback("👎 0", `unlike_${msgId}`)
          ])
        }
      );
    }
  } catch (err) {
    console.error("Xatolik:", err);
  }
});

// ... (rest of your code)

bot.on("callback_query", async (ctx) => {
  try {
    const data = ctx.callbackQuery?.data;
    const fromId = ctx.from?.id;
    const message = ctx.callbackQuery?.message; // This refers to the "Reaksiya qoldiring:" message

    if (!data || !fromId || !message) {
      return ctx.answerCbQuery("Noto‘g‘ri so‘rov.");
    }

    const [action, msgId] = data.split("_");
    const originalMessageId = Number(msgId); // This is the ID of the *original* message with the hashtag

    const reaction = postReactions.get(originalMessageId);
    if (!reaction) {
      return ctx.answerCbQuery("Post topilmadi.");
    }

    if (reaction.like.has(fromId) || reaction.unlike.has(fromId)) {
      return ctx.answerCbQuery("Siz allaqachon ovoz bergansiz!");
    }

    if (action === "like") {
      reaction.like.add(fromId);
      await ctx.answerCbQuery("Siz like berdingiz!");
    } else if (action === "unlike") {
      reaction.unlike.add(fromId);
      await ctx.answerCbQuery("Siz unlike berdingiz!");
    } else {
      return ctx.answerCbQuery("Noma’lum amal.");
    }

    const likeCount = reaction.like.size;
    const unlikeCount = reaction.unlike.size;

    // Update the keyboard using the message.message_id of the "Reaksiya qoldiring:" message
    await ctx.telegram.editMessageReplyMarkup(
      ctx.chat.id,
      message.message_id, // Use message.message_id here as it's the ID of the message with the buttons
      undefined,
      Markup.inlineKeyboard([
        Markup.button.callback(`👍 ${likeCount}`, `like_${originalMessageId}`),
        Markup.button.callback(`👎 ${unlikeCount}`, `unlike_${originalMessageId}`)
      ])
    );

  } catch (err) {
    console.error("Callback xatolik:", err);
    await ctx.answerCbQuery("Xatolik yuz berdi!");
  }
});

// ... (rest of your code)


(async () => {
  try {
    await bot.launch();
    console.log("✅ Bot ishga tushdi");
  } catch (err) {
    console.error("❌ Bot ishga tushmadi:", err);
  }
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

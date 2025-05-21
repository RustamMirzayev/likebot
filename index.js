import { Telegraf, Markup } from "telegraf";

const botToken = '7691683453:AAFYXGzYEvfYbhzErB_vfygKxXUvXXUgESo';
if (!botToken) {
  console.error("Bot token topilmadi!");
  process.exit(1);
}

const bot = new Telegraf(botToken);

// Har bir post uchun like/unlike va kimlar bosgani
const postReactions = new Map(); // key: messageId, value: { like: Set, unlike: Set }

bot.on("message", async (ctx) => {
  try {
    const text = ctx.message.text;
    if (!text) return;

    const hasHashtag = ctx.message.entities?.some(e => e.type === "hashtag");
    if (!hasHashtag) return;

    const msgId = ctx.message.message_id;
    const chatId = ctx.chat.id;

    // Har bir postga bosh holatda like/unlike uchun Setlar
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
  } catch (err) {
    console.error("Xatolik:", err);
  }
});

bot.on("callback_query", async (ctx) => {
  try {
    const data = ctx.callbackQuery.data;
    const fromId = ctx.from.id;
    const [action, msgId] = data.split("_");
    const messageId = Number(msgId);

    const reaction = postReactions.get(messageId);
    if (!reaction) return ctx.answerCbQuery("Post topilmadi.");

    if (reaction.like.has(fromId) || reaction.unlike.has(fromId)) {
      return ctx.answerCbQuery("Siz allaqachon ovoz bergansiz!");
    }

    if (action === "like") {
      reaction.like.add(fromId);
      await ctx.answerCbQuery("Siz like berdingiz!");
    } else if (action === "unlike") {
      reaction.unlike.add(fromId);
      await ctx.answerCbQuery("Siz unlike berdingiz!");
    }

    const likeCount = reaction.like.size;
    const unlikeCount = reaction.unlike.size;

    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        Markup.button.callback(`👍 ${likeCount}`, `like_${messageId}`),
        Markup.button.callback(`👎 ${unlikeCount}`, `unlike_${messageId}`)
      ])
    );
  } catch (err) {
    console.error("Callback xatolik:", err);
    await ctx.answerCbQuery("Xatolik yuz berdi!");
  }
});

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

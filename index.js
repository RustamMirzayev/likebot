import { Telegraf, Markup } from "telegraf";

const botToken = '7691683453:AAFYXGzYEvfYbhzErB_vfygKxXUvXXUgESo';
if (!botToken) {
  console.error("Bot token mavjud emas!");
  process.exit(1);
}

const bot = new Telegraf(botToken);

// Har bir post uchun alohida like/unlike saqlaymiz
const postReactions = new Map();

bot.on("message", async (ctx) => {
  try {
    const text = ctx.message.text;
    if (!text) return;

    const hasHashtag = ctx.message.entities?.some(e => e.type === "hashtag");
    if (!hasHashtag) return;

    const msgId = ctx.message.message_id;
    postReactions.set(msgId, { like: 0, unlike: 0 });

    await ctx.reply(
      "Reaksiya qoldiring:",
      {
        reply_to_message_id: msgId,
        ...Markup.inlineKeyboard([
          Markup.button.callback("👍", `like_${msgId}`),
          Markup.button.callback("👎", `unlike_${msgId}`)
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
    const [action, msgId] = data.split("_");
    const id = Number(msgId);

    if (!postReactions.has(id)) return;

    const reaction = postReactions.get(id);
    if (action === "like") {
      reaction.like++;
      await ctx.answerCbQuery("Siz like berdingiz!");
    } else if (action === "unlike") {
      reaction.unlike++;
      await ctx.answerCbQuery("Siz unlike berdingiz!");
    }

    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        Markup.button.callback(`👍 ${reaction.like}`, `like_${id}`),
        Markup.button.callback(`👎 ${reaction.unlike}`, `unlike_${id}`)
      ])
    );
  } catch (err) {
    console.error("Callback xatolik:", err);
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

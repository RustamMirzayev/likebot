import { Telegraf, Markup } from "telegraf";

const botToken = '7691683453:AAFYXGzYEvfYbhzErB_vfygKxXUvXXUgESo';
if (!botToken) {
  console.error("Bot token topilmadi!");
  process.exit(1);
}

const bot = new Telegraf(botToken);

// Храним реакции для каждого сообщения
// key: originalMessageId, value: { like: Set, unlike: Set, replyMessageId: Number }
const postReactions = new Map();

bot.on("message", async (ctx) => {
  try {
    const text = ctx.message.text;
    if (!text) return;

    // Проверяем наличие хэштега
    const hasHashtag = ctx.message.entities?.some(e => e.type === "hashtag");
    if (!hasHashtag) return;

    const originalMsgId = ctx.message.message_id;

    // If reactions for this original message already exist, don't create new ones
    if (!postReactions.has(originalMsgId)) {
      const sentMessage = await ctx.reply(
        "Reaksiya qoldiring:",
        {
          reply_to_message_id: originalMsgId,
          ...Markup.inlineKeyboard([
            Markup.button.callback("👍 0", `like_${originalMsgId}`),
            Markup.button.callback("👎 0", `unlike_${originalMsgId}`)
          ])
        }
      );

      // Store the reply message ID along with the reaction data
      postReactions.set(originalMsgId, {
        like: new Set(),
        unlike: new Set(),
        replyMessageId: sentMessage.message_id // Store the ID of the message with buttons
      });
    }
  } catch (err) {
    console.error("Xatolik:", err);
  }
});

bot.on("callback_query", async (ctx) => {
  try {
    const data = ctx.callbackQuery?.data;
    const fromId = ctx.from?.id;
    // We don't directly use ctx.callbackQuery.message.message_id for updating anymore.
    // Instead, we get the replyMessageId from our stored `postReactions` map.

    if (!data || !fromId) {
      return ctx.answerCbQuery("Noto‘g‘ri so‘rov.");
    }

    const [action, originalMsgIdStr] = data.split("_");
    const originalMessageId = Number(originalMsgIdStr); // This is the ID of the *original* message with the hashtag

    const reactionData = postReactions.get(originalMessageId);
    if (!reactionData) {
      return ctx.answerCbQuery("Post topilmadi.");
    }

    // Check if the user has already reacted to this original post
    if (reactionData.like.has(fromId) || reactionData.unlike.has(fromId)) {
      return ctx.answerCbQuery("Siz allaqachon ovoz bergansiz!");
    }

    if (action === "like") {
      reactionData.like.add(fromId);
      await ctx.answerCbQuery("Siz like berdingiz!");
    } else if (action === "unlike") {
      reactionData.unlike.add(fromId);
      await ctx.answerCbQuery("Siz unlike berdingiz!");
    } else {
      return ctx.answerCbQuery("Noma’lum amal.");
    }

    const likeCount = reactionData.like.size;
    const unlikeCount = reactionData.unlike.size;

    // Use the stored replyMessageId to update the correct message's keyboard
    await ctx.telegram.editMessageReplyMarkup(
      ctx.chat.id,
      reactionData.replyMessageId, // <-- Use the stored replyMessageId here
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

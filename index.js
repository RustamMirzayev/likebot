import { Telegraf, Markup } from "telegraf";

const botToken = '7691683453:AAFYXGzYEvfYbhzErB_vfygKxXUvXXUgESo';
if (!botToken) {
  console.error("7691683453:AAFYXGzYEvfYbhzErB_vfygKxXUvXXUgESo");
  process.exit(1);
}

const bot = new Telegraf(botToken);

let likeCount = 0;
let unlikeCount = 0;

bot.on("message", async (ctx) => {
  try {
    const text = ctx.message.text;
    if (!text) return;

    const hasHashtag = ctx.message.entities?.some((e) => e.type === "hashtag");

    if (hasHashtag) {
      likeCount = 0;
      unlikeCount = 0;

      await ctx.reply(
        "Postda hashtag bor. Like yoki Unlike tugmasini bosing:",
        Markup.inlineKeyboard([
          Markup.button.callback(`👍 ${likeCount}`, "like"),
          Markup.button.callback(`👎 ${unlikeCount}`, "unlike"),
        ])
      );
    }
  } catch (error) {
    console.error("Xatolik:", error);
  }
});

bot.action("like", async (ctx) => {
  likeCount++;
  await ctx.answerCbQuery("Siz like berdingiz!");

  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      Markup.button.callback(`👍 ${likeCount}`, "like"),
      Markup.button.callback(`👎 ${unlikeCount}`, "unlike"),
    ])
  );
});

bot.action("unlike", async (ctx) => {
  unlikeCount++;
  await ctx.answerCbQuery("Siz unlike berdingiz!");

  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      Markup.button.callback(`👍 ${likeCount}`, "like"),
      Markup.button.callback(`👎 ${unlikeCount}`, "unlike"),
    ])
  );
});

(async () => {
  try {
    await bot.launch();
    console.log("✅ Bot ishga tushdi");
  } catch (error) {
    console.error("❌ Bot ishga tushmadi:", error);
  }
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

import { Telegraf, Markup } from "telegraf";

const botToken = '7691683453:AAFYXGzYEvfYbhzErB_vfygKxXUvXXUgESo';
if (!botToken) {
  console.error("Bot token yo'q!");
  process.exit(1);
}

const bot = new Telegraf(botToken);

// Guruhdagi xabarlarni tinglash
bot.on("message", async (ctx) => {
  try {
    const text = ctx.message.text;

    // Matn mavjudligini tekshirish
    if (!text) return;

    // Hashtag mavjudligini tekshirish (entities orqali)
    const hasHashtag = ctx.message.entities?.some((e) => e.type === "hashtag");

    if (hasHashtag) {
      await ctx.reply(
        "Postda hashtag bor. Like yoki Unlike tugmalarini bosing:",
        Markup.inlineKeyboard([
          Markup.button.callback("👍 Like", "like"),
          Markup.button.callback("👎 Unlike", "unlike"),
        ])
      );
    }

  } catch (error) {
    console.error("Xatolik:", error);
  }
});

// Like tugmasi bosilganda
bot.action("like", async (ctx) => {
  await ctx.answerCbQuery("Siz like berdingiz!");
  await ctx.reply(`${ctx.from.first_name} postni like qildi 👍`);
});

// Unlike tugmasi bosilganda
bot.action("unlike", async (ctx) => {
  await ctx.answerCbQuery("Siz unlike berdingiz!");
  await ctx.reply(`${ctx.from.first_name} postni unlike qildi 👎`);
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

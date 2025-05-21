import { Telegraf, Markup } from "telegraf";

const botToken = '7171985185:AAFEZwue6ATQI-Mz8NZNFhwv00OHKPsUXUs';
if (!botToken) {
  console.error("7171985185:AAFEZwue6ATQI-Mz8NZNFhwv00OHKPsUXUs");
  process.exit(1);
}

const bot = new Telegraf(botToken);

// Guruhda kelgan har qanday xabarni tinglaymiz
bot.on("message", async (ctx) => {
  try {
    const text = ctx.message.text;
    if (!text) return; // Agar matn bo'lmasa, chiqamiz

    // Agar post oxirida '#' bo'lsa
    if (text.trim().endsWith("#")) {
      // Like va Unlike tugmalarini inline keyboard sifatida yuboramiz
      await ctx.reply(
        "Bu post oxirida # bor. Like yoki Unlike tugmalarini bosing.",
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

// Like tugmasi bosilganda javob
bot.action("like", async (ctx) => {
  await ctx.answerCbQuery("Siz Like berdingiz!");
  await ctx.reply(`${ctx.from.first_name} postni like qildi 👍`);
});

// Unlike tugmasi bosilganda javob
bot.action("unlike", async (ctx) => {
  await ctx.answerCbQuery("Siz Unlike berdingiz!");
  await ctx.reply(`${ctx.from.first_name} postni unlike qildi 👎`);
});

(async () => {
  try {
    await bot.launch();
    console.log("Bot ishga tushdi");
  } catch (error) {
    console.error("Bot ishga tushmadi:", error);
  }
})();

// Ctrl+C bosilganda to‘g‘ri to‘xtatish uchun
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

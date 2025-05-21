import { Telegraf, Markup } from "telegraf";

const botToken = "7171985185:AAFEZwue6ATQI-Mz8NZNFhwv00OHKPsUXUs";
if (!botToken) {
  console.error("7171985185:AAFEZwue6ATQI-Mz8NZNFhwv00OHKPsUXUs");
  process.exit(1);
}

const bot = new Telegraf(botToken);

bot.on("message", async (ctx) => {
  try {
    console.log("Kelgan xabar:", ctx.message);
    const text = ctx.message.text;
    if (!text) return;

    if (text.trim().endsWith("#")) {
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

bot.action("like", async (ctx) => {
  await ctx.answerCbQuery("Siz Like berdingiz!");
  await ctx.reply(`${ctx.from.first_name} postni like qildi 👍`);
});

bot.action("unlike", async (ctx) => {
  await ctx.answerCbQuery("Siz Unlike berdingiz!");
  await ctx.reply(`${ctx.from.first_name} postni unlike qildi 👎`);
});

bot.launch();
console.log("Bot ishga tushdi");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

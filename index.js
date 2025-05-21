import { Telegraf, Markup } from "telegraf";

const botToken = "7171985185:AAFEZwue6ATQI-Mz8NZNFhwv00OHKPsUXUs";
const bot = new Telegraf(botToken);

bot.on("message", async (ctx) => {
  const text = ctx.message.text || ctx.message.caption;
  console.log("Guruhdan kelgan xabar:", ctx.message); // muhim!

  if (text && text.trim().endsWith("#")) {
    await ctx.reply(
      "✅ Bu post oxirida # bor. Like yoki Unlike tugmalarini bosing.",
      Markup.inlineKeyboard([
        Markup.button.callback("👍 Like", "like"),
        Markup.button.callback("👎 Unlike", "unlike"),
      ])
    );
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
console.log("🤖 Bot ishga tushdi");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

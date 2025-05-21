bot.on("callback_query", async (ctx) => {
  try {
    const data = ctx.callbackQuery?.data;
    const fromId = ctx.from?.id;
    const message = ctx.callbackQuery?.message;

    if (!data || !fromId || !message) {
      return ctx.answerCbQuery("Noto‘g‘ri so‘rov.");
    }

    const [action, msgId] = data.split("_");
    const messageId = Number(msgId);

    const reaction = postReactions.get(messageId);
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

    // Обновляем клавиатуру с явным указанием chat_id и message_id
    await ctx.telegram.editMessageReplyMarkup(
      ctx.chat.id,
      message.message_id,
      undefined,
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

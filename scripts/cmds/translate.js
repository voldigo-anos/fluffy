 axios = require('axios'); const defaultEmojiTranslate = "🫠";

module.exports = { config: { name: "translate", aliases: ["trans", "trad"], version: "1.5", author: "NTKhang + mod by cadrique", countDown: 5, role: 0, shortDescription: { vi: "Dịch văn bản", en: "Translate text" }, longDescription: { vi: "Dịch văn bản sang ngôn ngữ mong muốn", en: "Translate text to the desired language" }, category: "ai", guide: { vi: "   {pn} <văn bản>: Dịch văn bản sang ngôn ngữ của box chat bạn hoặc ngôn ngữ mặc định của bot" + "\n   {pn} <văn bản> -> <ISO 639-1>: Dịch văn bản sang ngôn ngữ mong muốn" + "\n   hoặc có thể phản hồi 1 tin nhắn để dịch nội dung của tin nhắn đó" + "\n   Ví dụ:" + "\n    {pn} hello -> vi" + "\n   {pn} -r [on | off]: Bật hoặc tắt chế độ tự động dịch tin nhắn khi có người thả cảm xúc vào tin nhắn" + "\n   {pn} -r set <emoji>: Đặt emoji để dịch tin nhắn trong nhóm chat của bạn", en: "   {pn} <text>: Translate text to the language of your chat box or the default language of the bot" + "\n   {pn} <text> -> <ISO 639-1>: Translate text to the desired language" + "\n   or you can reply a message to translate the content of that message" + "\n   Example:" + "\n    {pn} hello -> vi" + "\n   {pn} -r [on | off]: Turn on or off the automatic translation mode when someone reacts to the message" + "\n   {pn} -r set <emoji>: Set the emoji to translate the message in your chat group" } },

langs: {
	vi: {
		translateTo: "🌐 Dịch từ %1 sang %2",
		invalidArgument: "❌ Sai cú pháp, vui lòng chọn on hoặc off",
		turnOnTransWhenReaction: `✅ 𝗧𝗿𝗮𝗻𝘀𝗹𝗮𝘁𝗲-𝗥𝗲𝗮𝗰𝘁 𝗔𝗰𝘁𝗶𝘃𝗲𝗱!\n💫 Hãy thả cảm xúc \"${defaultEmojiTranslate}\" vào bất kỳ tin nhắn nào để dịch (không hỗ trợ tin nhắn của bot).\n⚠️ Chỉ hoạt động sau khi bật.`,
		turnOffTransWhenReaction: "✅ Đã tắt chức năng dịch khi thả cảm xúc.",
		inputEmoji: "🌀 Thả cảm xúc vào tin nhắn này để chọn emoji dịch.",
		emojiSet: "✅ Emoji dịch đã đặt thành %1"
	},
	en: {
		translateTo: "🌐 Translated from %1 to %2",
		invalidArgument: "❌ Invalid argument, please choose on or off",
		turnOnTransWhenReaction: `✅ 𝗧𝗿𝗮𝗻𝘀𝗹𝗮𝘁𝗲-𝗥𝗲𝗮𝗰𝘁 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱!\n💫 Try reacting \"${defaultEmojiTranslate}\" to any message to translate it (bot messages not supported).\n⚠️ Only works after enabling.`,
		turnOffTransWhenReaction: "✅ Translate-on-react has been disabled.",
		inputEmoji: "🌀 React to this message to set your translate emoji.",
		emojiSet: "✅ Translate emoji set to %1"
	}
},

onStart: async function ({ message, event, args, threadsData, getLang, commandName }) {
	if (["-r", "-react", "-reaction"].includes(args[0])) {
		if (args[1] == "set") {
			return message.reply(getLang("inputEmoji"), (err, info) =>
				global.GoatBot.onReaction.set(info.messageID, {
					type: "setEmoji",
					commandName,
					messageID: info.messageID,
					authorID: event.senderID
				})
			);
		}
		const isEnable = args[1] == "on" ? true : args[1] == "off" ? false : null;
		if (isEnable == null)
			return message.reply(getLang("invalidArgument"));
		await threadsData.set(event.threadID, isEnable, "data.translate.autoTranslateWhenReaction");
		return message.reply(isEnable ? getLang("turnOnTransWhenReaction") : getLang("turnOffTransWhenReaction"));
	}

	const { body = "" } = event;
	let content;
	let langCodeTrans;
	const langOfThread = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;

	if (event.messageReply) {
		content = event.messageReply.body;
		let lastIndexSeparator = body.lastIndexOf("->");
		if (lastIndexSeparator == -1)
			lastIndexSeparator = body.lastIndexOf("=>");

		if (lastIndexSeparator != -1 && (body.length - lastIndexSeparator == 4 || body.length - lastIndexSeparator == 5))
			langCodeTrans = body.slice(lastIndexSeparator + 2);
		else if ((args[0] || "").match(/\w{2,3}/))
			langCodeTrans = args[0].match(/\w{2,3}/)[0];
		else
			langCodeTrans = langOfThread;
	} else {
		content = event.body;
		let lastIndexSeparator = content.lastIndexOf("->");
		if (lastIndexSeparator == -1)
			lastIndexSeparator = content.lastIndexOf("=>");

		if (lastIndexSeparator != -1 && (content.length - lastIndexSeparator == 4 || content.length - lastIndexSeparator == 5)) {
			langCodeTrans = content.slice(lastIndexSeparator + 2);
			content = content.slice(content.indexOf(args[0]), lastIndexSeparator);
		} else
			langCodeTrans = langOfThread;
	}

	if (!content)
		return message.SyntaxError();
	translateAndSendMessage(content, langCodeTrans, message, getLang);
},

onChat: async ({ event, threadsData }) => {
	if (!await threadsData.get(event.threadID, "data.translate.autoTranslateWhenReaction"))
		return;
	global.GoatBot.onReaction.set(event.messageID, {
		commandName: 'translate',
		messageID: event.messageID,
		body: event.body,
		type: "translate"
	});
},

onReaction: async ({ message, Reaction, event, threadsData, getLang }) => {
	switch (Reaction.type) {
		case "setEmoji": {
			if (event.userID != Reaction.authorID)
				return;
			const emoji = event.reaction;
			if (!emoji)
				return;
			await threadsData.set(event.threadID, emoji, "data.translate.emojiTranslate");
			return message.reply(getLang("emojiSet", emoji), () => message.unsend(Reaction.messageID));
		}
		case "translate": {
			const emojiTrans = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || "🌍";
			if (event.reaction == emojiTrans) {
				const langCodeTrans = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
				const content = Reaction.body;
				Reaction.delete();
				translateAndSendMessage(content, langCodeTrans, message, getLang);
			}
		}
	}
}

};

async function translate(text, langCode) { const res = await axios.get(https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}); return { text: res.data[0].map(item => item[0]).join(''), lang: res.data[2] }; }

async function translateAndSendMessage(content, langCodeTrans, message, getLang) { const { text, lang } = await translate(content.trim(), langCodeTrans.trim());

const finalMessage = [
	`🌸 𝑻𝒓𝒂𝒏𝒔𝒍𝒂𝒕𝒊𝒐𝒏 ✨`,
	`━━━━━━━━━━━━━━━━━━`,
	`🔹 𝗙𝗿𝗼𝗺: ${lang.toUpperCase()}  ➜  𝗧𝗼: ${langCodeTrans.toUpperCase()}`,
	`🔸 𝗧𝗲𝘅𝘁:\n${text}`,
	`━━━━━━━━━━━━━━━━━━`,
	`🌐 ${getLang("translateTo", lang, langCodeTrans)}`
].join('\n');

return message.reply(finalMessage);

}


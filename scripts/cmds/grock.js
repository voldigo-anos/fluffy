const axios = require("axios");

const fontMathias = (text) => {
  const map = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀",
    h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇",
    o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎",
    v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦",
    H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭",
    O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴",
    V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };
  return text.split("").map(c => map[c] || c).join("");
};

module.exports = {
  config: {
    name: "grock",
    version: "2.1",
    author: "Aesther",
    countDown: 3,
    role: 0,
    shortDescription: "🤖 Parle avec l’IA stylée (Grok)",
    longDescription: "Pose-lui une question, elle te répondra joliment. Tu peux continuer à discuter via reply.",
    category: "🤖 IA",
    guide: {
      fr: "{pn} Que penses-tu du chocolat ?"
    }
  },

  onStart: async function ({ message, args, event }) {
    const userInput = args.join(" ");
    if (!userInput)
      return message.reply("💬 Pose-moi une question, exemple :\nai2 Pourquoi le ciel est bleu ?");

    const prompt = `Réponds précisément à cette question : ${userInput}`;
    const apiUrl = `https://api.nekorinn.my.id/ai/grok-3?text=${encodeURIComponent(prompt)}`;

    try {
      const res = await axios.get(apiUrl);
      const answer = res.data.result || "Je n’ai pas compris. 😕";

      const msg = `〔🧠 𝗚𝗥𝗢𝗞〕─
➤ ${fontMathias(userInput)}

─〔🎴 𝗥𝗘𝗣𝗢𝗡𝗦𝗘〕
${fontMathias(answer)}
`;

      const replyMsg = await message.reply(msg);
      global.GoatBot.onReply.set(replyMsg.messageID, {
        commandName: "ai2",
        messageID: replyMsg.messageID,
        author: event.senderID,
        previousPrompt: userInput
      });

    } catch (e) {
      console.error("❌ Erreur:", e);
      message.reply("⚠️ Erreur lors de la requête à Grok.");
    }
  },

  onReply: async function ({ message, event, Reply }) {
    const userInput = event.body;
    const prompt = `Tu es en pleine conversation. Réponds à cela en lien avec ce qui précède : ${userInput}`;
    const apiUrl = `https://api.nekorinn.my.id/ai/grok-3?text=${encodeURIComponent(prompt)}`;

    try {
      const res = await axios.get(apiUrl);
      const answer = res.data.result || "Je ne sais pas quoi répondre 🫤";

      const msg = `╭──〔🔁 𝗖𝗢𝗡𝗧𝗜𝗡𝗨𝗘〕──╮
➤ ${fontMathias(userInput)}

╰──〔🎯 𝗥𝗘𝗣𝗢𝗡𝗦𝗘〕──╯
${fontMathias(answer)}
`;

      const replyMsg = await message.reply(msg);
      global.GoatBot.onReply.set(replyMsg.messageID, {
        commandName: "ai2",
        messageID: replyMsg.messageID,
        author: event.senderID,
        previousPrompt: userInput
      });

    } catch (e) {
      console.error("❌ Erreur:", e);
      message.reply("⚠️ Erreur lors de la réponse de Grok.");
    }
  }
};

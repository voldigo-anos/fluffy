@cmd install 00ai.js const axios = require("axios");

const Prefixes = ["ai", "anjara", "Ae"];

const fonts = {
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨",
  J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱",
  S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
};

const stickers = [
  "254594546003916", "254595732670464", "254593389337365",
  "37117808696806", "254597316003639", "254598806003490",
  "254596219337082", "2379537642070973", "2379545095403561",
  "2379551785402892", "254597059336998"
];

const RP = "Réponds à cette question  et ajoute des emojis  convenable";

function applyFont(text) {
  return text.split('').map(char => fonts[char] || char).join('');
}

function splitMessage(text, maxLength = 2000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks;
}

module.exports = {
  config: {
    name: "ai",
    aliases: ["ae"],
    version: "1.5",
    author: "Aesther",
    countDown: 2,
    role: 0,
    shortDescription: "🤖 Pose une question à l'IA",
    longDescription: "Obtiens une réponse stylisée de l'IA avec un design lisible et décoratif.",
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function ({ message, args, event, api }) {
    const prompt = args.join(" ").trim();
    const threadID = event.threadID;
    const messageID = event.messageID;

    if (!prompt) {
      const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
      return message.send({ sticker: randomSticker });
    }

    try {
      const apiUrl = `https://api.diioffc.web.id/api/ai/turbo?query=${encodeURIComponent(`${RP} : ${prompt}`)}`;
      const { data } = await axios.get(apiUrl, { timeout: 15000 });
      const response = data?.result?.message || data?.message || data?.result || "🤖 Aucune réponse reçue.";

      const styled = applyFont(response.toString());
      const chunks = splitMessage(styled);
      const sent = [];

      for (const chunk of chunks) {
        const msg = await message.reply(chunk + (chunk === chunks[chunks.length - 1] ? " 🪐" : ""));
        sent.push(msg.messageID);

        global.GoatBot.onReply.set(msg.messageID, {
          commandName: this.config.name,
          messageID: msg.messageID,
          author: event.senderID,
          prompt
        });

        setTimeout(() => {
          global.GoatBot.onReply.delete(msg.messageID);
        }, 2 * 60 * 1000);
      }

      await api.setMessageReaction("✨", messageID, () => {}, true);

      setTimeout(() => {
        for (const id of sent) {
          api.unsendMessage(id);
        }
      }, 60 * 1000);

    } catch (err) {
      console.error(err);
      const errMsg = err.code === 'ECONNABORTED'
        ? "⚠️ Le serveur met trop de temps à répondre. Réessaie plus tard."
        : "❌ Une erreur est survenue lors de la connexion à l'API.";
      return message.reply(applyFont(errMsg));
    }
  },

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;
    const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p));
    if (!prefix) return;

    const args = event.body.slice(prefix.length).trim().split(/\s+/);
    this.onStart({ message, args, event, api });
  },

  onReply: async function ({ args, event, api, message, Reply }) {
    if (event.senderID !== Reply.author) return;

    const newPrompt = event.body.trim();
    const prompt = `${RP} : ${newPrompt}`;
    try {
      const apiUrl = `https://fastrestapis.fasturl.cloud/aillm/gpt-4o?ask=${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(apiUrl, { timeout: 15000 });
      const response = data?.result || data?.message || data?.result || "🤖 Aucune réponse obtenue.";

      const styled = applyFont(response.toString());
      const chunks = splitMessage(styled);
      const sent = [];

      for (const chunk of chunks) {
        const msg = await message.reply(chunk + (chunk === chunks[chunks.length - 1] ? " 🪐" : ""));
        sent.push(msg.messageID);

        global.GoatBot.onReply.set(msg.messageID, {
          commandName: this.config.name,
          messageID: msg.messageID,
          author: event.senderID,
          prompt
        });

        setTimeout(() => {
          global.GoatBot.onReply.delete(msg.messageID);
        }, 2 * 60 * 1000);
      }

      setTimeout(() => {
        for (const id of sent) {
          api.unsendMessage(id);
        }
      }, 60 * 1000);

    } catch (err) {
      console.error(err);
      const errMsg = err.code === 'ECONNABORTED'
        ? "⚠️ Le serveur est trop lent à répondre."
        : "❌ Une erreur s’est produite avec l'API.";
      return message.reply(applyFont(errMsg));
    }
  }
};

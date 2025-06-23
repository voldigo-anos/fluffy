const axios = require("axios");

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
  "2041021609458646", "2041021119458695", "254593389337365",
  "1747085735602678", "456548350088277", "456549450088167",
  "456538446755934", "456546006755178", "456545803421865",
  "2379551785402892", "254597059336998", "2041021119458695", "2041015182792622",
  "2041012406126233", "2041015329459274", "2041012109459596", "2041011726126301",
  "2041011836126290", "1747088982269020", "1747083702269548", "1747087128935872" 
];

const RP = "Réponds à cette question et ajoute des emojis convenables pour l'améliorer les réponse. N'ajoute pas de commentaire";

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
    version: "2.0",
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
    const messageID = event.messageID;

    if (!prompt) {
      const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
      return message.send({ sticker: randomSticker });
    }

    try {
      const apiUrl = `https://api.nekorinn.my.id/ai/grok-3?text=${encodeURIComponent(`${RP} : ${prompt}`)}`;
      const { data } = await axios.get(apiUrl, { timeout: 15000 });
      const response = typeof data.result === 'string' ? data.result : "🤖 Aucune réponse reçue.";

      const styled = applyFont(response);
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
      const apiUrl = `https://api.nekorinn.my.id/ai/grok-3?text=${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(apiUrl, { timeout: 15000 });
      const response = typeof data.result === 'string' ? data.result : "🤖 Aucune réponse.";

      const styled = applyFont(response);
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

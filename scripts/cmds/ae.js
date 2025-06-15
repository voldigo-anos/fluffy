const axios = require('axios');

const Prefixes = [
  'ae',
  'sancho',
  'kuin',
];

// Font Mathias pour le texte
function toMathiasFont(text) {
  const fonts = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
    j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
    s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
    J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
    S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
    '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺',
    '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
  };
  return text.split('').map(c => fonts[c] || c).join('');
}

module.exports = {
  config: {
    name: "ae",
    version: "1.1",
    author: "Aesther",
    longDescription: "Command with no prefix\n💬 - GPT non censuré avec un style Mathias.",
    category: "ai",
    guide: {
      fr: "Utilisez un des mots-clés suivants : ae | sancho | kuin suivi d'une question."
    },
  },

  onChat: async function ({ api, event, args, message }) {
    try {
      const prefix = Prefixes.find((p) => event.body && event.body.toLowerCase().startsWith(p));
      if (!prefix) return;

      const prompt = event.body.slice(prefix.length).trim();
      const senderID = event.senderID;
      const senderInfo = await api.getUserInfo([senderID]);
      const senderName = senderInfo[senderID].name;

      if (!prompt) {
        await message.reply(`🟢 𝘼𝙀𝙎𝙏𝙃𝙀𝙍 ⚪ :\n\n${toMathiasFont("Hello")} ${toMathiasFont(senderName)} ⁉️`);
        api.setMessageReaction("⁉️", event.messageID, () => {}, true);
        return;
      }

      const res = await axios.get(`https://api.nekorinn.my.id/ai/ripleai?text=${encodeURIComponent(prompt)}`);
      const reply = res.data.result;

      const fullMessage = `🟢 𝘼𝙀𝙎𝙏𝙃𝙀𝙍 ⚪ :\n[💬] ${toMathiasFont(senderName)}\n\n${toMathiasFont(reply)} 🟡`;

      await message.reply(fullMessage);
      api.setMessageReaction("🔞", event.messageID, () => {}, true);

    } catch (err) {
      console.error("❌ Erreur IA :", err.message);
      await message.reply("❌ Erreur lors de la génération de la réponse.");
    }
  }
};

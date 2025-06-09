const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    version: "1.2",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { fr: "🔎 Trouver les paroles d'une chanson" },
    longDescription: { fr: "Recherche les paroles d'une chanson via une API stable." },
    category: "music",
    guide: { fr: "{pn} <titre chanson>" }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query)
      return api.sendMessage("❗ Veuillez fournir le nom de la chanson.", event.threadID, event.messageID);

    try {
      const res = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`);
      const song = res.data;

      const msg = `
🎵 | **${song.title}** - ${song.author}
📄 | Paroles :

${song.lyrics.length > 1900 ? song.lyrics.slice(0, 1900) + "..." : song.lyrics}
      `;

      api.sendMessage(msg, event.threadID, event.messageID);
    } catch (e) {
      console.error(e.message);
      api.sendMessage("❌ Impossible de trouver les paroles pour cette chanson.", event.threadID, event.messageID);
    }
  }
};

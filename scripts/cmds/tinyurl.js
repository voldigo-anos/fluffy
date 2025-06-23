const axios = require("axios");

module.exports = {
  config: {
    name: "tinyurl",
    aliases: ["short", "shorturl"],
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🔗 Raccourcir une  avec TinyURL",
    longDescription: "Utilise TinyURL pour raccourcir n'importe quel lien.",
    category: "tools",
    guide: {
      fr: "tinyurl [lien]\nExemple : tinyurl https://example.com"
    }
  },

  onStart: async function ({ api, event, args }) {
    const url = args[0];

    if (!url || !url.startsWith("http")) {
      return api.sendMessage("❌ Veuillez fournir une URL valide !\nEx : tinyurl https://example.com", event.threadID, event.messageID);
    }

    try {
      const res = await axios.get(`https://delirius-apiofc.vercel.app/shorten/tinyurl?url=${encodeURIComponent(url)}`);
      const short = res.data?.data;

      if (!res.data.status || !short) {
        return api.sendMessage("❌ Erreur : Impossible de raccourcir ce lien.", event.threadID, event.messageID);
      }

      const message = `🌐 𝗟𝗶𝗲𝗻 𝗿𝗮𝗰𝗰𝗼𝘂𝗿𝗰𝗶 :\n━━━━━━━━━━━━━━\n🔗 ${short}\n━━━━━━━━━━━━━━\n📎 𝗢𝗿𝗶𝗴𝗶𝗻𝗮𝗹 : ${url}`;
      return api.sendMessage(message, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("🚫 Une erreur est survenue, réessaye plus tard.", event.threadID, event.messageID);
    }
  }
}; 

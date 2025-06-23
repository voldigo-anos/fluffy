const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ytplay",
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🎶 Rechercher et télécharger l'audio d'une vidéo YouTube",
    longDescription: {
      fr: "Effectue une recherche YouTube et télécharge l'audio avec style 🎧"
    },
    category: "music",
    guide: {
      fr: "Utilisation : ytplay <mots-clés>\nExemple : ytplay Naruto"
    }
  },

  onStart: async function ({ message, args }) {
    const query = args.join(" ");
    if (!query) return message.reply("❌ | Veuillez fournir un mot-clé de recherche.\nExemple : ytplay Naruto");

    const loading = await message.reply("🔎 | Recherche en cours...");

    try {
      // 🔗 Appel API
      const res = await axios.get(`https://api.nekorinn.my.id/downloader/ytplay-savetube?q=${encodeURIComponent(query)}`);
      const data = res.data;

      if (!data.status || !data.result || !data.result.downloadUrl) {
        return message.reply("❌ | Aucune vidéo trouvée ou erreur de téléchargement.");
      }

      const { title, channel, duration, cover, url } = data.result.metadata;
      const downloadUrl = data.result.downloadUrl;

      // 🎧 Téléchargement de l'audio
      const audioPath = path.join(__dirname, "cache", `${Date.now()}_ytplay.mp3`);
      const audioStream = await axios.get(downloadUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(audioPath, audioStream.data);

      // 🎨 Envoi avec style
      await message.reply({
        body:
`🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗣𝗹𝗮𝘆𝗲𝗿 🎧
━━━━━━━━━━━━━━━━━━
📺 𝗧𝗶𝘁𝗿𝗲 : ${title}
🕒 𝗗𝘂𝗿𝗲́𝗲 : ${duration}
📣 𝗖𝗵𝗮𝗶̂𝗻𝗲 : ${channel}
🔗 𝗟𝗶𝗲𝗻 : ${url}
━━━━━━━━━━━━━━━━━━`,
        attachment: fs.createReadStream(audioPath)
      });

      // 🧹 Nettoyage
      fs.unlinkSync(audioPath);
    } catch (err) {
      console.error(err);
      message.reply("❌ | Une erreur est survenue lors de la récupération ou du téléchargement.");
    } finally {
      // ⏳ Supprime le message de chargement
      await message.unsend(loading.messageID);
    }
  }
};

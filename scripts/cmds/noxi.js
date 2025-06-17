const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");
fs.ensureDirSync(CACHE_DIR);

module.exports = {
  config: {
    name: "noxi",
    version: "6.1",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🔞 Rechercher et télécharger des vidéos Noxi",
    longDescription: "Recherche + téléchargement auto en qualité basse, avec pagination et clean cache",
    category: "nsfw",
    guide: {
      fr: "{p}noxi <mot-clé> → recherche Noxi\n→ réponds avec numéro, 'all', '➡️' ou '⬅️'"
    }
  },

  onStart: async function ({ message, args, event }) {
    const query = args.join(" ");
    if (!query) return message.reply("⛩️ | Veuillez entrer un mot-clé pour rechercher sur Noxi.");

    try {
      const res = await axios.get(`https://delirius-apiofc.vercel.app/search/xnxxsearch?query=${encodeURIComponent(query)}`);
      const data = res.data.data;

      if (!data || data.length === 0) return message.reply("❌ | Aucun résultat trouvé.");

      const page = 1;
      const perPage = 9;
      const totalPage = Math.ceil(data.length / perPage);

      const renderPage = (p) => {
        const start = (p - 1) * perPage;
        const pageData = data.slice(start, start + perPage);
        const content = pageData.map((item, i) =>
          `🎌 ${start + i + 1}. 『 ${item.title} 』\n👁️ ${item.views}   💯 ${item.percentage}   ⚙️ ${item.quality}`
        ).join("\n\n");

        return `╭─「🔞 NOXI VIDEO SEARCH」\n│ 🔍 Mot-clé : *${query}*\n│ 📄 Page : ${p}/${totalPage}\n╰─━━━━━━━━━━━━━━━\n\n${content}\n\n✏️ Réponds avec :\n➤ un numéro (1-${data.length})\n➤ "all" pour tout télécharger\n➤ "➡️" ou "⬅️" pour naviguer.`;
      };

      const msg = await message.reply(renderPage(page));
      global.GoatBot.onReply.set(msg.messageID, {
        commandName: "noxi",
        author: event.senderID,
        data, query, page, perPage, totalPage, messageID: msg.messageID
      });

    } catch (e) {
      console.error(e);
      message.reply("❌ | Erreur lors de la recherche.");
    }
  },

  onReply: async function ({ event, api, message, Reply }) {
    const { data, author, query, page, perPage, totalPage, messageID } = Reply;
    if (event.senderID !== author) return;

    const input = event.body.trim().toLowerCase();

    if (input === "➡️" || input === "➡") {
      if (page >= totalPage) return message.reply("🚫 | Dernière page atteinte.");
      const newPage = page + 1;
      await api.editMessage(generatePage(data, query, newPage, perPage, totalPage), messageID);
      global.GoatBot.onReply.set(messageID, { ...Reply, page: newPage });
      return;
    }

    if (input === "⬅️" || input === "⬅") {
      if (page <= 1) return message.reply("🚫 | Première page atteinte.");
      const newPage = page - 1;
      await api.editMessage(generatePage(data, query, newPage, perPage, totalPage), messageID);
      global.GoatBot.onReply.set(messageID, { ...Reply, page: newPage });
      return;
    }

    if (input === "all") {
      await message.reply("📦 Téléchargement des 9 premières vidéos (qualité basse)...");
      for (const item of data.slice(0, 9)) {
        try {
          const dl = await axios.get(`https://delirius-apiofc.vercel.app/download/xnxxdl?url=${encodeURIComponent(item.link)}`);
          const video = dl.data.data;
          const filePath = path.join(CACHE_DIR, `${Date.now()}.mp4`);
          await global.utils.downloadFile(video.download.low, filePath);

          await api.sendMessage({
            body: `🎞️『 ${video.title} 』\n👁️ Vues: ${video.views} | ⚙️ Qualité: basse`,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => fs.unlinkSync(filePath));
        } catch (err) {
          console.log("❌ Erreur sur une vidéo :", err.message);
        }
      }
      return;
    }

    const num = parseInt(input);
    if (!num || num < 1 || num > data.length)
      return message.reply("❌ | Numéro invalide.");

    try {
      const dl = await axios.get(`https://delirius-apiofc.vercel.app/download/xnxxdl?url=${encodeURIComponent(data[num - 1].link)}`);
      const video = dl.data.data;
      const filePath = path.join(CACHE_DIR, `${Date.now()}.mp4`);
      await global.utils.downloadFile(video.download.low, filePath);

      await api.sendMessage({
        body: `🎌『 ${video.title} 』\n👁️ Vues : ${video.views}\n🕒 Durée : ${video.duration}\n⚙️ Qualité : basse`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));
    } catch (err) {
      console.error(err);
      message.reply("❌ | Téléchargement impossible.");
    }
  }
};

function generatePage(data, query, page, perPage, totalPage) {
  const start = (page - 1) * perPage;
  const pageData = data.slice(start, start + perPage);
  const list = pageData.map((item, i) =>
    `🎌 ${start + i + 1}. 『 ${item.title} 』\n👁️ ${item.views}   💯 ${item.percentage}   ⚙️ ${item.quality}`
  ).join("\n\n");

  return `╭─「🔞 NOXI VIDEO SEARCH」\n│ 🔍 Mot-clé : *${query}*\n│ 📄 Page : ${page}/${totalPage}\n╰─━━━━━━━━━━━━━━━\n\n${list}\n\n✏️ Réponds avec :\n➤ un numéro (1-${data.length})\n➤ "all" pour tout télécharger\n➤ "➡️" ou "⬅️" pour naviguer.`;
        }

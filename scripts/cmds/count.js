const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "nhentai",
    version: "3.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      fr: "🔍 Rechercher un doujinshi via NHentai"
    },
    category: "🍥 Anime +18",
    guide: {
      fr: "🧩 {pn} <code ou mot-clé>\nEx : {pn} vanilla"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query)
      return api.sendMessage("📌 | Veuillez entrer un code ou mot-clé.\nEx : nhentai vanilla", event.threadID, event.messageID);

    try {
      const res = await axios.get(`https://delirius-apiofc.vercel.app/anime/nhentai?query=${encodeURIComponent(query)}`);
      const data = res.data.data;

      const blockedTags = [];
      if (data.tags.some(tag => blockedTags.includes(tag.toLowerCase()))) {
        return api.sendMessage("🚫 | Ce contenu est bloqué pour des raisons de sécurité.", event.threadID, event.messageID);
      }

      const info =
`╭─〔 🌸 𝑵𝑯𝒆𝒏𝒕𝒂𝒊 - 𝑫𝒆𝒕𝒂𝒊𝒍𝒔 〕─╮
📖 Titre : ${data.title}
🆔 ID : ${data.id}
📄 Pages : ${data.pages}
📚 Tags : ${data.tags.slice(0, 10).join(", ")}${data.tags.length > 10 ? ", ..." : ""}
🌐 Langues : ${data.languages.join(", ")}
╰──────────────★彡`;

      const imgDir = path.join(__dirname, "cache", `${event.senderID}_nh`);
      await fs.ensureDir(imgDir);

      const chunks = [];
      let temp = [];

      // Télécharger les images et les regrouper en lots de 20
      for (let i = 0; i < data.images.length; i++) {
        const imgUrl = data.images[i];
        const imgPath = path.join(imgDir, `${i}.webp`);
        const img = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, img.data);
        temp.push(fs.createReadStream(imgPath));

        if (temp.length === 20 || i === data.images.length - 1) {
          chunks.push([...temp]);
          temp = [];
        }
      }

      // Envoyer le message d'information
      await api.sendMessage(info, event.threadID, event.messageID);

      // Envoyer chaque lot d'images
      for (const attachments of chunks) {
        await new Promise(resolve => {
          api.sendMessage({ attachment: attachments }, event.threadID, resolve);
        });
      }

      // 🔄 Supprimer le cache après 30 secondes
      setTimeout(() => fs.remove(imgDir), 30 * 1000);

    } catch (err) {
      console.error("❌ Erreur nhentai:", err);
      return api.sendMessage("⚠️ | Une erreur est survenue. Vérifie le code ou réessaie plus tard.", event.threadID, event.messageID);
    }
  }
};

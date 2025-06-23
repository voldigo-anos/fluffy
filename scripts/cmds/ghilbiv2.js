const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ghibli",
    aliases: ["ghiblistyle", "ghiblify"],
    version: "1.0",
    author: "Aesther",
    countDown: 10,
    role: 0,
    shortDescription: {
      fr: "🎨 Appliquer un filtre Ghibli à une image"
    },
    longDescription: {
      fr: "Transforme une image en style artistique Ghibli grâce à l'API de Nekorinn."
    },
    category: "🖼️ Image",
    guide: {
      fr: "{pn} (en réponse à une image)"
    }
  },

  onStart: async function ({ event, api, message }) {
    const { messageReply } = event;
    const cachePath = path.join(__dirname, "cache", `ghibli_${Date.now()}.jpg`);

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("📸 | Répond à une image pour que je puisse lui appliquer le style Ghibli !");
    }

    const img = messageReply.attachments[0];
    if (img.type !== "photo") {
      return message.reply("❌ | Je ne peux traiter que les **images** pour le moment.");
    }

    const imgUrl = img.url;

    try {
      message.reply("✨ | Transformation en cours... Patiente un instant ⏳");

      const apiUrl = `https://api.nekorinn.my.id/tools/img2ghibli-v2?imageUrl=${encodeURIComponent(imgUrl)}`;
      const res = await axios.get(apiUrl);
      const ghibliImage = res.data.result;

      const downloadRes = await global.utils.downloadFile(ghibliImage, cachePath);

      await message.reply({
        body: "🏞️ 𝗜𝗺𝗮𝗴𝗲 𝘀𝘁𝘆𝗹𝗲 𝗚𝗛𝗜𝗕𝗟𝗜 🎨",
        attachment: fs.createReadStream(cachePath)
      });

      fs.unlinkSync(cachePath); // Nettoyage

    } catch (err) {
      console.error("❌ Erreur Ghibli:", err);
      return message.reply("❌ Une erreur est survenue pendant la transformation.");
    }
  }
}; 

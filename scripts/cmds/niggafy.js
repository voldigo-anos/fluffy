const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "niggafy",
    version: "1.0",
    author: "Aesther",
    shortDescription: "🧠 Applique un effet Niggafy à une image",
    longDescription: "Réponds à une image pour appliquer le style 'Niggafy' via une API directe.",
    category: "image",
    guide: {
      fr: "Réponds à une image avec : {p}niggafy"
    },
    role: 0,
    countDown: 5
  },

  onStart: async function ({ message, event }) {
    const { messageReply, threadID } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("🖼️ | Veuillez répondre à une **image** pour appliquer le filtre Niggafy.");
    }

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo") {
      return message.reply("📷 | Seules les images sont supportées. Réponds à une image.");
    }

    const imageUrl = encodeURIComponent(attachment.url);
    const apiUrl = `https://api.nekorinn.my.id/tools/niggafy?imageUrl=${imageUrl}`;
    const filePath = path.join(__dirname, "cache", `niggafy_${Date.now()}.jpg`);

    try {
      // Télécharger l'image depuis l'API
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      await fs.ensureDir(path.join(__dirname, "cache"));
      fs.writeFileSync(filePath, response.data);

      // Envoyer l'image dans la conversation
      await message.reply({
        body: "🧠✨ | Voici ton image Niggafy :",
        attachment: fs.createReadStream(filePath)
      });

    } catch (error) {
      console.error("❌ Erreur Niggafy :", error.message);
      message.reply("❌ | Une erreur est survenue lors du traitement de l’image.");
    } finally {
      // Nettoyer le fichier après l'envoi
      setTimeout(() => fs.remove(filePath).catch(() => {}), 30 * 1000);
    }
  }
};

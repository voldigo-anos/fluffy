const axios = require("axios");

module.exports = {
  config: {
    name: "prompt",
    aliases: ["img2prompt", "promptimage"],
    version: "1.1",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🔍 Décris une image automatiquement",
    longDescription: "Génère une description stylisée d’une image avec IA à partir de son URL",
    category: "ai",
    guide: {
      fr: "{pn} (envoie une image ou réponds à une image)"
    }
  },

  onStart: async function ({ message, event }) {
    const attachments = event.messageReply?.attachments || event.attachments;

    if (!attachments || attachments.length === 0 || attachments[0].type !== "photo") {
      return message.reply("📸 Veuillez envoyer ou répondre à une image pour générer un prompt !");
    }

    const imageUrl = attachments[0].url;
    const apiUrl = `https://nirkyy-dev.hf.space/api/v1/image2prompt?url=${encodeURIComponent(imageUrl)}`;

    try {
      const { data } = await axios.get(apiUrl, { timeout: 15000 });

      if (data?.success && data?.data) {
        return message.reply(`🖼️ 𝗜𝗺𝗮𝗴𝗲 𝗮𝗻𝗮𝗹𝘆𝘀𝗲́𝗲 :\n\n📜 ${data.data}`);
      } else {
        return message.reply("❌ Échec de la génération de description. Essaie avec une autre image.");
      }

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ Une erreur est survenue pendant l’analyse de l’image.");
    }
  }
};

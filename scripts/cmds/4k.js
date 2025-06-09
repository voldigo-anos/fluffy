const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    version: "1.2",
    author: "Aesther",
    countDown: 10,
    role: 0,
    shortDescription: { fr: "⬆️ Améliorer la résolution d'une image" },
    longDescription: { fr: "Upscale une image via URL ou en répondant à une image (nettoyage auto du cache)" },
    category: "🖼️ Images",
    guide: { fr: "{pn} <URL de l'image> ou répondre à une image" }
  },

  onStart: async function ({ api, event, args }) {
    let imageUrl = "";

    // Vérifie si on répond à une image
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      const attachment = event.messageReply.attachments.find(att => att.type === "photo" || att.type === "image");
      if (attachment) imageUrl = attachment.url;
    }

    // Sinon, utilise l'argument
    if (!imageUrl) {
      if (!args[0]) return api.sendMessage("❗️ Veuillez fournir une URL ou répondre à une image.", event.threadID, event.messageID);
      imageUrl = args[0];
    }

    if (!imageUrl.startsWith("http")) return api.sendMessage("❌ L'URL n'est pas valide.", event.threadID, event.messageID);

    const resize = "4";
    const encodedUrl = encodeURIComponent(imageUrl);
    const apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/upscale?imageUrl=${encodedUrl}&resize=${resize}`;
    const tempFile = path.join(__dirname, "cache", `upscale_${Date.now()}.jpg`);

    try {
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      await fs.outputFile(tempFile, res.data);

      const message = `
━━━━━━ ⬆️ 𝗨𝗣𝗦𝗖𝗔𝗟𝗘 ━━━━━━
📈 𝗙𝗮𝗰𝘁𝗲𝘂𝗿  : x${resize}
📤 `;

      api.sendMessage({
        body: message,
        attachment: fs.createReadStream(tempFile)
      }, event.threadID, () => fs.unlink(tempFile), event.messageID);

    } catch (error) {
      console.error("Upscale Error:", error.message);
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      return api.sendMessage("❌ Une erreur est survenue lors du traitement de l'image.", event.threadID, event.messageID);
    }
  }
};

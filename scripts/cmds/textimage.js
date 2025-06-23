const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "textimage",
    aliases: ["ttimg", "txt2img"],
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🖌️ Génère une image depuis un texte",
    longDescription: "Transforme un prompt texte en image à l’aide d’un modèle IA",
    category: "ai",
    guide: {
      fr: "{pn} <prompt>\nEx : {pn} Anime girl holding a sign saying 'Aesther'"
    }
  },

  onStart: async function ({ message, args, event }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("📌 Donne un prompt !\nEx : `textimage Anime girl with a sword`");
    }

    const loading = await message.reply("🎨 Création de ton image... Patiente un instant !");
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const apiUrl = `https://nirkyy-dev.hf.space/api/v1/writecream-text2image?prompt=${encodedPrompt}&aspect_ratio=1%3A1`;

      const res = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 30000 });
      const imgPath = path.join(__dirname, "cache", `textimg_${Date.now()}.jpg`);
      fs.writeFileSync(imgPath, res.data);

      await message.reply({
        body: `🖼️ 𝗜𝗺𝗮𝗴𝗲 𝗴𝗲́𝗻𝗲́𝗿𝗲́𝗲 𝗱𝗲𝗽𝘂𝗶𝘀 :\n「 ${prompt} 」`,
        attachment: fs.createReadStream(imgPath)
      });

      await message.unsend(loading.messageID);
      setTimeout(() => fs.existsSync(imgPath) && fs.unlinkSync(imgPath), 60 * 1000);

    } catch (e) {
      console.error(e);
      await message.unsend(loading.messageID);
      return message.reply("❌ Erreur lors de la génération de l’image. Réessaie plus tard !");
    }
  }
};

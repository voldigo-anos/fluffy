const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "imagine",
    aliases: ["imgai", "vision"],
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🌈 Génère une image IA",
    longDescription: "Utilise un prompt pour générer une image avec une IA avancée",
    category: "ai",
    guide: {
      fr: "{pn} <prompt>\nEx : {pn} Vast rice fields with flowing rivers"
    }
  },

  onStart: async function ({ message, args, event }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("💡 Merci d’entrer un prompt !\nEx : `imagine A cyberpunk samurai in Tokyo`");
    }

    const wait = await message.reply("🔮 Laisse-moi imaginer ton image magique...");

    try {
      const url = `https://nirkyy-dev.hf.space/api/v1/imagine?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });

      const imgPath = path.join(__dirname, "cache", `imagine_${Date.now()}.jpg`);
      fs.writeFileSync(imgPath, res.data);

      await message.reply({
        body: `🌌 𝗜𝗺𝗮𝗴𝗲 𝗴𝗲́𝗻𝗲́𝗿𝗲́𝗲 𝗱𝗲𝗽𝘂𝗶𝘀 :\n『 ${prompt} 』`,
        attachment: fs.createReadStream(imgPath)
      });

      await message.unsend(wait.messageID);
      setTimeout(() => fs.existsSync(imgPath) && fs.unlinkSync(imgPath), 60 * 1000);

    } catch (err) {
      console.error(err);
      await message.unsend(wait.messageID);
      return message.reply("❌ Une erreur est survenue lors de la génération de l’image. Réessaie plus tard !");
    }
  }
};

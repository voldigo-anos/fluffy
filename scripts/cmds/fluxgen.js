const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "flux",
    aliases: ["fluxgen", "aigen", "fluxfast"],
    version: "1.0",
    author: "Aesther",
    countDown: 4,
    role: 0,
    shortDescription: "🎨 Génère une image via prompt (Flux AI)",
    longDescription: "Utilise Flux pour générer une image à partir d'une description comme 'Sunset on beach'.",
    category: "image",
    guide: {
      fr: "{pn} <prompt>\nEx : {pn} Sunset on beach"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    const prompt = args.join(" ");
    if (!prompt)
      return message.reply("🖌️ Donne une description pour générer l’image !\n\nExemple : `flux anime girl flying`");

    const loading = await message.reply("⏳ Génération en cours via Flux...");

    try {
      const url = `https://nirkyy-dev.hf.space/api/v1/fluxfast?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 20000
      });

      const imgPath = path.join(__dirname, "cache", `flux_${Date.now()}.jpg`);
      fs.ensureDirSync(path.dirname(imgPath));
      fs.writeFileSync(imgPath, res.data);

      await message.reply({
        body: `✨ 𝗙𝗹𝘂𝘅 : 『 ${prompt} 』`,
        attachment: fs.createReadStream(imgPath)
      });

      await api.unsendMessage(loading.messageID);

      setTimeout(() => {
        fs.existsSync(imgPath) && fs.unlinkSync(imgPath);
      }, 60 * 1000);

    } catch (e) {
      console.error(e);
      await api.unsendMessage(loading.messageID);
      message.reply("❌ Erreur lors de la génération. Vérifie ta connexion ou réessaie plus tard.");
    }
  }
};

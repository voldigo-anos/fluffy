const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "brat",
    version: "1.0",
    author: "Aesther",
    shortDescription: "🎥 Génère une vidéo 'Brat' avec ton texte",
    longDescription: "Crée une vidéo drôle avec un prompt de type 'SHIBI Goku cry get spanked by Freeza'.",
    category: "fun",
    guide: {
      fr: "{p}brat <texte>\n\nExemple : brat Goku gets angry at Vegeta"
    },
    role: 0,
    countDown: 10
  },

  onStart: async function ({ args, message }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("✏️ | Donne-moi un texte pour générer la vidéo Brat.");

    const encodedText = encodeURIComponent(prompt);
    const apiUrl = `https://api.nekorinn.my.id/maker/bratvid?text=${encodedText}`;
    const fileName = `brat_${Date.now()}.mp4`;
    const filePath = path.join(__dirname, "cache", fileName);

    try {
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      await fs.ensureDir(path.join(__dirname, "cache"));
      fs.writeFileSync(filePath, res.data);

      await message.reply({
        body: `🎬 | Vidéo générée pour : ${prompt}`,
        attachment: fs.createReadStream(filePath)
      });

    } catch (error) {
      console.error("❌ Erreur génération vidéo Brat :", error.message);
      return message.reply("❌ | Impossible de générer la vidéo pour l'instant.");
    } finally {
      setTimeout(() => fs.remove(filePath).catch(() => {}), 60 * 1000); // Auto clear après 1 min
    }
  }
};

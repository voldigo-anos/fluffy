const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "magic",
    aliases: ["magicstudio", "aiwizard"],
    version: "2.0",
    author: "Aesther",
    countDown: 8,
    role: 0,
    shortDescription: "✨ Génère plusieurs images magiques via IA",
    longDescription: {
      fr: "Génère 3 variantes d'une image magique à partir d'un prompt textuel avec Magic Studio"
    },
    category: "ai",
    guide: {
      fr: "{pn} <prompt magique>\n\n🧙 Ex : {pn} sorcier avec dragon de feu"
    }
  },

  onStart: async function ({ message, args, event }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("🔮 Tu dois donner une description magique !");

    const baseUrl = "https://api.siputzx.my.id/api/ai/magicstudio?prompt=";
    const imagePaths = [];
    const attachments = [];

    try {
      // Génération de 3 images différentes
      for (let i = 0; i < 3; i++) {
        const url = `${baseUrl}${encodeURIComponent(prompt)}&seed=${Date.now() + i}`;
        const imgPath = path.join(__dirname, "cache", `magic_${Date.now()}_${i}.jpg`);

        const res = await axios.get(url, { responseType: "arraybuffer", timeout: 60000 });
        fs.writeFileSync(imgPath, res.data);
        imagePaths.push(imgPath);
        attachments.push(fs.createReadStream(imgPath));
      }

      // Envoi des images
      await message.reply({
        body: `✨ 𝗠𝗮𝗴𝗶𝗰 𝗦𝘁𝘂𝗱𝗶𝗼 𝗫𝟯\n🧙 Prompt : ${prompt}`,
        attachment: attachments
      });

      // Clear cache auto après 30 sec
      setTimeout(() => {
        imagePaths.forEach(file => {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        });
      }, 30 * 1000);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Une erreur est survenue. Réessaie avec un autre prompt magique !");
    }
  }
};

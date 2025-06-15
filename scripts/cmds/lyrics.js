const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "lyrics",
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      fr: "🎤 Obtiens les paroles d'une chanson via Genius"
    },
    longDescription: {
      fr: "Recherche et affiche les paroles complètes, titre, artiste, image et plus encore depuis Genius Lyrics."
    },
    category: "🎵 Musique",
    guide: {
      fr: "genius | nom de la chanson\nEx: genius | Lana Del Rey Norman"
    }
  },

  onStart: async function ({ args, message }) {
    const query = args.join(" ");
    if (!query)
      return message.reply("❌ Merci d’indiquer le nom d’une chanson.\nEx: genius | Lana Del Rey Norman");

    const apiUrl = `https://api.nekorinn.my.id/search/genius-lyrics?q=${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data.result;

      if (!data || !data.lyrics) {
        return message.reply("❌ Aucune parole trouvée pour cette chanson.");
      }

      const {
        title,
        desc,
        artists,
        cover,
        tags,
        language,
        lyrics
      } = data;

      const msg = `🎶 *𝗧𝗜𝗧𝗥𝗘* : ${title}\n👤 *𝗔𝗥𝗧𝗜𝗦𝗧𝗘* : ${artists}\n🌐 *𝗟𝗔𝗡𝗚𝗨𝗘* : ${language}\n🏷️ *𝗧𝗔𝗚𝗦* : ${tags}\n\n📝 *𝗗𝗘𝗦𝗖𝗥𝗜𝗣𝗧𝗜𝗢𝗡* :\n${desc}\n\n🎼 *𝗣𝗔𝗥𝗢𝗟𝗘𝗦* :\n${lyrics}`;

      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);

      const imgPath = path.join(cachePath, `genius_${Date.now()}.jpg`);
      const imgRes = await axios.get(cover, { responseType: "arraybuffer" });
      await fs.writeFile(imgPath, imgRes.data);

      await message.reply({
        body: msg,
        attachment: fs.createReadStream(imgPath)
      });

      setTimeout(() => fs.unlink(imgPath, () => {}), 60 * 1000); // Auto-delete après 1 min

    } catch (err) {
      console.error("❌ Erreur lors de la récupération des paroles :", err);
      return message.reply("⚠️ Une erreur est survenue. Réessaie plus tard.");
    }
  }
};

const fs = require('fs');
const axios = require('axios');
const path = require('path');

module.exports = {
  config: {
    name: "google",
    aliases: ["img", "image"],
    version: "1.0",
    author: "aesther",
    countDown: 5,
    role: 0,
    shortDescription: "Recherche d'images",
    longDescription: "Recherche des images via Google Images (API Pinterest)",
    category: "image",
    guide: {
      en: "{p}google <mot-clé> [nombre (1-20)]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
      return api.sendMessage("🔍 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗜𝗢𝗡 :\n{p}google <mot-clé> [nombre d'images]\n\nEx: {p}google chat 5", threadID, messageID);
    }

    // Nombre d'images
    let count = 5;
    const lastArg = args[args.length - 1];
    if (!isNaN(lastArg)) {
      count = Math.min(20, Math.max(1, parseInt(lastArg)));
      args.pop();
    }

    const searchQuery = args.join(" ");

    try {
      api.setMessageReaction("🔎", messageID, () => {}, true);

      const apiUrl = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(searchQuery)}`;
      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data.success || !data.results || data.results.length === 0) {
        return api.sendMessage("❌ Aucun résultat trouvé ou erreur de l'API", threadID, messageID);
      }

      const images = data.results.slice(0, count);
      const attachments = [];
      const tempPaths = [];

      await Promise.all(images.map(async (imgUrl, i) => {
        const filePath = path.join(__dirname, `temp_img_${i}.jpg`);
        const response = await axios.get(imgUrl, { responseType: 'stream', timeout: 15000 });

        await new Promise((resolve, reject) => {
          const stream = fs.createWriteStream(filePath);
          response.data.pipe(stream);
          stream.on('finish', resolve);
          stream.on('error', reject);
        });

        attachments.push(fs.createReadStream(filePath));
        tempPaths.push(filePath);
      }));

      const sentMsg = await api.sendMessage({
        body: `📌 𝗥𝗘𝗦𝗨𝗟𝗧𝗔𝗧𝗦 :\n\n"${searchQuery}" (${attachments.length} images)`,
        attachment: attachments
      }, threadID);

      // Expiration après 60 secondes
      setTimeout(() => {
        try {
          api.unsendMessage(sentMsg.messageID);
          tempPaths.forEach(file => fs.existsSync(file) && fs.unlinkSync(file));
        } catch (err) {
          console.error("⛔ Erreur lors de l'expiration du message :", err);
        }
      }, 60000);

      api.setMessageReaction("💯", messageID, () => {}, true);

    } catch (err) {
      console.error("Erreur lors de la recherche Google Image :", err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage("⚠️ Une erreur s'est produite lors de la récupération des images.", threadID, messageID);
    }
  }
};

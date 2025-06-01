const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok",
    version: "1.1",
    author: "aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Tìm kiếm và gửi video TikTok",
      en: "Search and send TikTok videos"
    },
    longDescription: {
      vi: "Tìm kiếm video TikTok theo từ khóa và chọn video để gửi",
      en: "Search TikTok videos by keyword and choose one to send"
    },
    category: "media",
    guide: {
      vi: "{pn} [từ khóa]",
      en: "{pn} [keyword]"
    }
  },

  onStart: async function ({ args, message, event, commandName }) {
    const query = args.join(" ");
    if (!query) return message.reply("❌ | Veuillez entrer un mot-clé pour rechercher une vidéo TikTok.");

    const apiUrl = `https://api.diioffc.web.id/api/search/tiktok?query=${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data.status || !data.result || data.result.length === 0) {
        return message.reply("❌ | Aucun résultat trouvé pour votre recherche.");
      }

      const results = data.result.slice(0, 10);
      let text = `📱 Résultats TikTok pour : ${query}\n\n`;

      results.forEach((item, index) => {
        text += `🔹 ${index + 1}. ${item.title}\n`;
        text += `👤 ${item.author.username} | 👁 ${item.stats.play}\n\n`;
      });

      const msg = await message.reply(text + "📩 Répondez avec le numéro de la vidéo à envoyer.");
      global.GoatBot.onReply.set(msg.messageID, {
        commandName,
        messageID: msg.messageID,
        author: event.senderID,
        result: results
      });

      setTimeout(() => {
        message.unsend(msg.messageID).catch(() => {});
      }, 60 * 1000);

    } catch (err) {
      console.error(err);
      return message.reply("❌ | Une erreur s'est produite lors de la récupération des vidéos TikTok.");
    }
  },

  onReply: async function ({ event, message, Reply }) {
    const { author, result } = Reply;
    if (event.senderID !== author) return;

    const index = parseInt(event.body);
    if (isNaN(index) || index < 1 || index > result.length) {
      return message.reply("❌ | Veuillez entrer un numéro valide correspondant à une vidéo.");
    }

    const video = result[index - 1];
    const url = video.media.no_watermark;
    const videoPath = path.join(__dirname, "cache", `${video.video_id}.mp4`);

    try {
      const res = await axios({
        url,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(videoPath);
      res.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: `🎬 ${video.title}\n👤 ${video.author.username}\n👁 ${video.stats.play} | ❤️ ${video.stats.like}`,
          attachment: fs.createReadStream(videoPath)
        });
        fs.unlinkSync(videoPath);
      });

      writer.on("error", (err) => {
        console.error("Erreur d'écriture du fichier vidéo :", err);
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        return message.reply("❌ | Échec de l'enregistrement de la vidéo.");
      });

    } catch (err) {
      console.error(err);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      return message.reply("❌ | Échec du téléchargement de la vidéo.");
    }
  }
};

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "seegore",
    aliases: ["gore", "see", "sg"],
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 1,
    shortDescription: {
      fr: "🎥 Vidéo random de Sutigore"
    },
    longDescription: {
      fr: "Envoie une vidéo choquante prise au hasard depuis le site Sutigore (seeGore)."
    },
    category: "nsfw",
    guide: {
      fr: "🩸 Utilise simplement : {pn}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://api.siputzx.my.id/api/r/seegore");
      const data = res.data.data;

      const videoUrl = data.video2 || data.video1;
      const fileName = `sutigore_${Date.now()}.mp4`;
      const filePath = path.join(__dirname, "cache", fileName);

      const videoRes = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(videoRes.data, "utf-8"));

      const message = `🩸『 𝗩𝗜𝗗𝗘́𝗢 𝗦ee𝗚𝗢𝗥𝗘 』🩸
━━━━━━━━━━━━━━━━━━━━
🔞 𝗧𝗶𝘁𝗿𝗲 : ${data.title}
🧠 𝗖𝗮𝘁𝗲́𝗴𝗼𝗿𝗶𝗲 : ${data.tag}
🕰️ 𝗠𝗶𝘀𝗲 𝗲𝗻 𝗹𝗶𝗴𝗻𝗲 : ${data.upload}
👁️ 𝗩𝘂𝗲𝘀 : ${data.view}
💬 𝗖𝗼𝗺𝗺𝗲𝗻𝘁𝗮𝗶𝗿𝗲𝘀 : ${data.comment}
👍 𝗩𝗼𝘁𝗲𝘀 : ${data.vote}
📎 𝗦𝗼𝘂𝗿𝗰𝗲 : ${data.source}
━━━━━━━━━━━━━━━━━━━━`;

      return api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Une erreur est survenue lors du chargement de la vidéo.", event.threadID, event.messageID);
    }
  }
};

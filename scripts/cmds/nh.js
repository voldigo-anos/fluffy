const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "nhentai",
    version: "1.0",
    author: "aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "📚 Send NHentai images by code"
    },
    longDescription: {
      en: "Send NHentai doujin images by code using API"
    },
    category: "media",
    guide: {
      en: "{pn} [code] — Example: {pn} 3379306"
    }
  },

  onStart: async function ({ api, event, args }) {
    const code = args[0];
    if (!code) {
      return api.sendMessage("❌ | You must provide a NHentai code.\n\n📘 Example: nh 3379306", event.threadID, event.messageID);
    }

    const threadID = event.threadID;
    const messageID = event.messageID;

    try {
      const url = `https://api.nekorinn.my.id/info/nhentai.net-getimage?url=https://nhentai.net/g/${code}`;
      const res = await axios.get(url);
      const result = res.data;

      if (!result.status || !result.result || result.result.length === 0) {
        return api.sendMessage("⚠️ | No images found or invalid code.", threadID, messageID);
      }

      const imgURLs = result.result;
      const imgPaths = [];

      const loading = await api.sendMessage("⏳ | Fetching images, please wait...", threadID);

      for (let i = 0; i < imgURLs.length; i++) {
        const imgUrl = imgURLs[i];
        const imgExt = path.extname(imgUrl).split("?")[0];
        const filePath = path.join(__dirname, `cache/nh_${code}_${i}${imgExt}`);

        const imgData = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(imgData.data, "binary"));
        imgPaths.push(fs.createReadStream(filePath));
      }

      const message = {
        body: `🔞 𝗡𝗛𝗲𝗻𝘁𝗮𝗶 𝗚𝗮𝗹𝗹𝗲𝗿𝘆\n━━━━━━━━━━━━━━━━\n📗 𝗖𝗼𝗱𝗲: ${code}\n🖼️ 𝗧𝗼𝘁𝗮𝗹: ${imgURLs.length} pages\n━━━━━━━━━━━━━━━━\n⚠️ 𝗖𝗲 𝗰𝗼𝗻𝘁𝗲𝗻𝘂 𝗲𝘀𝘁 𝗳𝗼𝗿𝘁𝗲𝗺𝗲𝗻𝘁 𝗲𝗿𝗼𝘁𝗶𝗾𝘂𝗲.\n\n📎 Images sent in one batch.`,
        attachment: imgPaths
      };

      api.sendMessage(message, threadID, async (err, info) => {
        // delete loading message
        api.unsendMessage(loading.messageID);

        // delete cache after 2 min
        setTimeout(() => {
          for (const stream of imgPaths) {
            const filePath = stream.path;
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }
          api.unsendMessage(info.messageID);
        }, 2 * 60 * 1000); // 2 minutes
      }, messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ | An error occurred while fetching images.", threadID, messageID);
    }
  }
};

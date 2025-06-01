const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "owner",
    aliases: ["info", "anja"],
    version: "1.2",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Display owner info" },
    longDescription: { en: "Get information about the bot owner with video" },
    category: "owner",
    guide: { en: "{p}owner" }
  },

  onStart: async function ({ api, event }) {
    const message = `
𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡
⊰🌟⊱ ───╌❊
(◍•ᴗ•◍) 𝗡𝗔𝗠𝗘 : 𝘼𝙉𝙅𝘼 / 𝙼𝚒𝚝𝚊𝚖𝚊 / 𝚃𝚑𝚎𝚊
⊰🌟⊱ ───╌❊
♀️ 𝗚𝗘𝗡𝗗𝗘𝗥 : 𝘎𝘪𝘳𝘭
⊰🌟⊱ ───╌❊
🏓 𝗛𝗢𝗕𝗕𝗬 : 𝘱𝘦𝘳𝘧𝘦𝘤𝘵𝘪𝘰𝘯𝘯𝘪𝘴𝘵𝘦 / 𝘵𝘦𝘢𝘤𝘩𝘦𝘳 / 𝘙𝘰𝘭𝘦𝘱𝘢𝘺𝘦𝘳 / 𝘿𝙊𝙈𝙄𝙉𝘼𝙏𝙄𝙊𝙉 😌
⊰🌟⊱ ───╌❊
💞 𝗥𝗘𝗟𝗔𝗧𝗜𝗢𝗡 : 𝙈𝘼𝙍𝙍𝙄𝙀𝘿
⊰🌟⊱ ───╌❊
🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 :
www.facebook.com/mitama.sama
www.facebook.com/Goddess-anais-Aesther
⊰🌟⊱ ───╌❊
🌸 𝗦𝗧𝗔𝗧𝗨𝗦 : 𝙄 𝘮 𝘵𝘩𝘦 𝘽𝙀𝙎𝙏 🤣🌷 🇲🇬
    `;

    const videoUrls = [
      "https://i.imgur.com/DDO686J.mp4",
      "https://i.imgur.com/WWGiRvB.mp4",
      "https://i.imgur.com/20QmmsT.mp4",
      "https://i.imgur.com/nN28Eea.mp4",
      "https://i.imgur.com/fknQ3Ut.mp4",
      "https://i.imgur.com/yXZJ4A9.mp4",
      "https://i.imgur.com/aWIyVpN.mp4",
      "https://i.imgur.com/aFIwl8X.mp4",
      "https://i.imgur.com/SJ60dUB.mp4",
      "https://i.imgur.com/ySu69zS.mp4",
      "https://i.imgur.com/mAmwCe6.mp4",
      "https://i.imgur.com/Sbztqx2.mp4",
      "https://i.imgur.com/s2d0BIK.mp4",
      "https://i.imgur.com/rWRfAAZ.mp4",
      "https://i.imgur.com/dYLBspd.mp4",
      "https://i.imgur.com/HCv8Pfs.mp4",
      "https://i.imgur.com/jdVLoxo.mp4",
      "https://i.imgur.com/hX3Znez.mp4",
      "https://i.imgur.com/cispiyh.mp4",
      "https://i.imgur.com/ApOSepp.mp4",
      "https://i.imgur.com/lFoNnZZ.mp4",
      "https://i.imgur.com/qDsEv1Q.mp4",
      "https://i.imgur.com/NjWUgW8.mp4",
      "https://i.imgur.com/ViP4uvu.mp4",
      "https://i.imgur.com/bim2U8C.mp4",
      "https://i.imgur.com/YzlGSlm.mp4",
      "https://i.imgur.com/HZpxU7h.mp4",
      "https://i.imgur.com/exTO3J4.mp4",
      "https://i.imgur.com/Xf6HVcA.mp4",
      "https://i.imgur.com/9iOci5S.mp4",
      "https://i.imgur.com/6w5tnvs.mp4",
      "https://i.imgur.com/1L0DMtl.mp4",
      "https://i.imgur.com/7wcQ8eW.mp4",
      "https://i.imgur.com/3MBTpM8.mp4",
      "https://i.imgur.com/8h1Vgum.mp4",
      "https://i.imgur.com/CTcsUZk.mp4",
      "https://i.imgur.com/e505Ko2.mp4",
      "https://i.imgur.com/3umJ6NL.mp4"
    ];

    const randomIndex = Math.floor(Math.random() * videoUrls.length);
    const chosenVideoUrl = videoUrls[randomIndex];
    const videoPath = path.join(__dirname, "owner_video.mp4");

    try {
      const response = await axios.get(chosenVideoUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      fs.writeFileSync(videoPath, Buffer.from(response.data, "binary"));

      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID);

      fs.unlinkSync(videoPath);
    } catch (error) {
      console.error("❌ Video fetch/send error:", error.message);
      api.sendMessage("⚠️ Failed to load the video. Please try again later.", event.threadID);
    }
  }
};

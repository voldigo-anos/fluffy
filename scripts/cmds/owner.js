const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "owner",
    aliases: ["info", "anja"],
    author: "Aesther",
    version: "2.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Display owner information"
    },
    longDescription: {
      en: "Get information about the bot's owner"
    },
    category: "owner",
    guide: {
      en: "{p}owner"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const loadingMessage = "💬 𝙒𝘼𝙄𝙏 𝘽𝙊𝙎𝙎 ...";
      await api.sendMessage(loadingMessage, event.threadID);

      const ownerInfo = {
        name: '𝘼𝙉𝙅𝘼/𝙼𝚒𝚝𝚊𝚖𝚊/𝚃𝚑𝚎𝚊',
        gender: '𝘎𝘪𝘳𝘭',
        hobby: '𝘱𝘦𝘳𝘧𝘦𝘤𝘵𝘪𝘰𝘯𝘯𝘪𝘴𝘵𝘦/𝘵𝘦𝘢𝘤𝘩𝘦𝘳/𝘙𝘰𝘭𝘦𝘱𝘢𝘺𝘦𝘳/𝘿𝙊𝙈𝙄𝙉𝘼𝙏𝙄𝙊𝙉😌',
        relationship: '𝙈𝘼𝙍𝙍𝙄𝙀𝘿',
        facebookLink: 'www.facebook.com/mitama.sama\nwww.facebook.com/Goddess-anais-Aesther',
        bio: '𝙄 𝘮 𝘵𝘩𝘦 𝘽𝙀𝙎𝙏🤣🌷'
      };

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
        "https://i.imgur.com/ySu69zS.mp4"
        // Réduis la liste pour alléger, tu peux remettre tous si besoin
      ];

      // Choisir une vidéo aléatoire
      const selectedUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];

      // Créer le dossier tmp s’il n'existe pas
      const tmpFolderPath = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tmpFolderPath)) {
        fs.mkdirSync(tmpFolderPath);
      }

      const videoResponse = await axios.get(selectedUrl, { responseType: 'arraybuffer' });
      const videoPath = path.join(tmpFolderPath, `owner_video_${Date.now()}.mp4`);
      fs.writeFileSync(videoPath, videoResponse.data);

      const response = `
𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡:
⊰🌟⊱┈────╌❊
(◍•ᴗ•◍) 𝗡𝗔𝗠𝗘 : ${ownerInfo.name}
⊰🌟⊱┈────╌❊
♀️ 𝗚𝗘𝗡𝗗𝗘𝗥: ${ownerInfo.gender}
⊰🌟⊱┈────╌❊
🏓 𝗛𝗢𝗕𝗕𝗬: ${ownerInfo.hobby}
⊰🌟⊱┈────╌❊
💞 𝗥𝗘𝗟𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣: ${ownerInfo.relationship}
⊰🌟⊱┈────╌❊
🔗 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: ${ownerInfo.facebookLink}
⊰🌟⊱┈────╌❊
◈ 𝗦𝗧𝗔𝗧𝗨𝗦: ${ownerInfo.bio} 🇲🇬
      `;

      await api.sendMessage({
        body: response,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, () => {
        // Supprimer la vidéo après envoi
        fs.unlinkSync(videoPath);
      });

    } catch (error) {
      console.error('Error in owner command:', error);
      api.sendMessage('❌ Une erreur est survenue pendant l\'exécution de la commande.', event.threadID);
    }
  },


  onChat: async function({ api, event }) {
    try {
      const lowerCaseBody = (event.body || "").toLowerCase();
      if (lowerCaseBody === "owner" || lowerCaseBody.includes("anja") || lowerCaseBody.includes("info")) {
        await this.onStart({ api, event });
      }
    } catch (error) {
      console.error('Error in onChat function:', error);
    }
  }
};

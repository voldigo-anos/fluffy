const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "welcomeEvent",
    version: "1.0",
    author: "Aesther",
    role: 0,
    shortDescription: "👋 Envoie une image de bienvenue automatique",
    longDescription: "Souhaite la bienvenue à chaque nouveau membre avec une image stylisée.",
    category: "event",
    dependencies: {
      "axios": "",
      "fs-extra": "",
      "path": ""
    }
  },

  onEvent: async function ({ api, event, usersData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const addedUsers = event.logMessageData.addedParticipants;

    for (const user of addedUsers) {
      const userID = user.userFbId;

      // Ne pas envoyer de bienvenue au bot lui-même
      if (userID === api.getCurrentUserID()) continue;

      const userInfo = await usersData.get(userID);
      const userName = userInfo?.name || "utilisateur inconnu";

      const description = `Bienvenue ${userName} ! 🎉 Merci de rejoindre ce groupe 💬. On est ravi de t’avoir ici 🫶`;

      const avatarUrl = encodeURIComponent(`https://graph.facebook.com/${userID}/picture?width=512&height=512`);
      const background = encodeURIComponent("https://i.ibb.co/4YBNyvP/images-76.jpg");
      const desc = encodeURIComponent(description);

      const apiUrl = `https://api.siputzx.my.id/api/canvas/welcomev4?avatar=${avatarUrl}&background=${background}&description=${desc}`;

      try {
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);

        const fileName = `welcome_${userID}.jpg`;
        const filePath = path.join(cacheDir, fileName);

        const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, res.data);

        await api.sendMessage({
          body: `🎉✨ Bienvenue à ${userName} !`,
          attachment: fs.createReadStream(filePath)
        }, threadID);

        // Clear cache après envoi
        fs.unlink(filePath, err => {
          if (err) console.error("❌ Erreur suppression image :", err);
        });

      } catch (err) {
        console.error("❌ Erreur génération image de bienvenue :", err);
        api.sendMessage(`👋 Bienvenue ${userName} !`, threadID);
      }
    }
  }
};

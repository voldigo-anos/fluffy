const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "welcomeEvent",
    version: "2.0",
    author: "Aesther",
    role: 0,
    shortDescription: "👋 Envoie une image de bienvenue automatique",
    longDescription: "Souhaite la bienvenue à chaque nouveau membre avec une image stylisée.",
    category: "event"
  },

  onEvent: async function ({ api, event, usersData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const addedUsers = logMessageData?.addedParticipants;

    if (!Array.isArray(addedUsers)) return;

    console.log("🎉 Nouveau membre détecté !");

    for (const user of addedUsers) {
      const userID = user.userFbId;

      // Ne pas envoyer de message pour le bot lui-même
      if (userID === api.getCurrentUserID()) continue;

      let userName = "utilisateur inconnu";
      try {
        const userInfo = await usersData.get(userID);
        if (userInfo?.name) userName = userInfo.name;
      } catch (e) {
        console.warn("⚠️ Impossible de récupérer le nom de l'utilisateur.");
      }

      const description = `Bienvenue ${userName} ! 🎉 Merci de rejoindre ce groupe 💬. On est ravi de t’avoir ici 🫶`;

      const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;
      const background = "https://i.ibb.co/4YBNyvP/images-76.jpg";
      const apiUrl = `https://api.siputzx.my.id/api/canvas/welcomev4?avatar=${avatarUrl}&background=${background}&description=${description}`;

      const cachePath = path.join(__dirname, "cache");
      const fileName = `welcome_${userID}.jpg`;
      const filePath = path.join(cachePath, fileName);

      try {
        await fs.ensureDir(cachePath);

        const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, res.data);

        await api.sendMessage({
          body: `🎉✨ Bienvenue à ${userName} !`,
          attachment: fs.createReadStream(filePath)
        }, threadID);

        // Supprimer l'image après envoi
        fs.unlink(filePath, err => {
          if (err) console.error("❌ Erreur suppression image :", err);
        });

      } catch (err) {
        console.error("❌ Erreur lors de la génération de l'image :", err);
        await api.sendMessage(`👋 Bienvenue ${userName} !`, threadID);
      }
    }
  }
};

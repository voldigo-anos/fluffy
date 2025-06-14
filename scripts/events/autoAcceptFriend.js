const axios = require("axios");

module.exports = {
  config: {
    name: "autoAcceptFriend",
    version: "1.1",
    author: "Aesther",
    category: "events"
  },

  onEvent: async function ({ event, api }) {
    if (event.type !== "friend_request") return;

    const adminUID = "100066731134942";
    const newFriendID = event.from?.userID;

    try {
      // ✅ Accept friend request
      await api.acceptFriendRequest(newFriendID);

      // 📩 Get user name via Graph API
      const userInfo = await api.getUserInfo(newFriendID);
      const userName = userInfo[newFriendID]?.name || "Utilisateur inconnu";

      // 💬 Message de bienvenue à l'utilisateur
      await api.sendMessage(
        `👋 Merci pour l'ajout ${userName} !\nJe suis Aesther, ton assistant virtuel.\n📌 Tape "menu" pour découvrir mes commandes.`,
        newFriendID
      );

      // 🛎️ Notification à l'admin
      await api.sendMessage(
        `🔔 Nouvelle demande d'ami acceptée !\n━━━━━━━━━━━━━\n👤 Nom : ${userName}\n🆔 UID : ${newFriendID}`,
        adminUID
      );

      console.log(`[AUTO-FRIEND] Accepté et notifié : ${userName} (${newFriendID})`);

    } catch (err) {
      console.error("[❌] Erreur lors de l'auto acceptation :", err);
    }
  }
};

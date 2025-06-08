const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "resend",
    version: "2.1",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🔁 Voir les messages supprimés",
    longDescription: "Réaffiche les messages supprimés, y compris images, vidéos, audios et GIFs.",
    category: "tools",
    guide: {
      vi: "{pn} on/off: Bật hoặc tắt tính năng resend",
      en: "{pn} on/off: Enable or disable resend feature"
    }
  },

  onStart: async function ({ api, event, threadsData, args }) {
    const { threadID, messageID } = event;

    if (!['on', 'off'].includes(args[0]))
      return api.sendMessage("⚙️ Utilisation : resend [on|off]", threadID, messageID);

    const isOn = args[0] === "on";
    await threadsData.set(threadID, isOn, "resend");

    return api.sendMessage(
      `${isOn ? "✅ Fonction resend activée" : "❌ Fonction resend désactivée"} dans cette conversation.`,
      threadID, messageID
    );
  },

  onChat: async function ({ event, api, threadsData, usersData }) {
    const { threadID, senderID, messageID, body, attachments, type } = event;
    const thread = await threadsData.get(threadID) || {};
    if (senderID === api.getCurrentUserID()) return;

    if (!global.resendStore) global.resendStore = new Map();

    // Enregistrement du message
    if (type !== "message_unsend") {
      global.resendStore.set(messageID, {
        senderID,
        body,
        attachments,
        type
      });
    }

    // Si un message est supprimé
    if (type === "message_unsend") {
      const data = global.resendStore.get(messageID);
      if (!data || thread.resend === false) return;

      const name = await usersData.getName(data.senderID);
      const msgText = data.body?.trim() || "🗒 Aucun texte.";
      const count = data.attachments?.length || 0;

      const msg = {
        body: `╭──[ 𝗥𝗘𝗦𝗘𝗡𝗗 🔁 ]──╮\n` +
              `[👤] Auteur : ${name}\n` +
              `[📝] Message : ${msgText}\n` +
              `[📎] Fichiers : ${count}\n` +
              `╰────────────────╯`,
        attachment: []
      };

      // S'il y a des fichiers
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const file = data.attachments[i];
          const url = file.url;
          const ext = path.extname(url.split("?")[0]) || ".bin";
          const filePath = `./cache/resend_${Date.now()}_${i}${ext}`;

          try {
            const response = await axios.get(url, { responseType: "stream" });
            await new Promise((resolve, reject) => {
              const writer = fs.createWriteStream(filePath);
              response.data.pipe(writer);
              writer.on("finish", resolve);
              writer.on("error", reject);
            });

            msg.attachment.push(fs.createReadStream(filePath));
          } catch (e) {
            console.error(`Erreur téléchargement de ${url}`, e);
          }
        }
      }

      // Envoi + suppression automatique des fichiers
      api.sendMessage(msg, threadID, () => {
        for (const a of msg.attachment) {
          try { a.close?.(); } catch (e) {}
        }
        setTimeout(() => {
          msg.attachment.forEach(att => fs.unlink(att.path, () => {}));
        }, 30 * 1000); // 30s de délai avant suppression
      });
    }
  }
};

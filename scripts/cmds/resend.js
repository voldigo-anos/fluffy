const fs = require('fs');
const axios = require('axios');
const request = require('request');

module.exports = {
  config: {
    name: 'resend',
    version: '2.0',
    author: 'Aesther',
    countDown: 5,
    role: 0,
    shortDescription: '🔁 Récupère les messages supprimés',
    longDescription: 'Le bot réaffiche les messages supprimés, y compris images, vidéos, audios et GIFs.',
    category: 'tools',
    guide: {
      vi: '{pn} on/off: Bật hoặc tắt tính năng resend',
      en: '{pn} on/off: Enable or disable resend feature'
    }
  },

  onStart: async function ({ api, event, threadsData, args }) {
    const { threadID, messageID } = event;

    if (!['on', 'off'].includes(args[0])) {
      return api.sendMessage('⚙️  Utilisation : resend [on|off]', threadID, messageID);
    }

    const isOn = args[0] === 'on';
    await threadsData.set(threadID, isOn, 'resend');
    return api.sendMessage(
      `${isOn ? '✅ Resend activé' : '❌ Resend désactivé'} pour cette conversation.`,
      threadID, messageID
    );
  },

  onChat: async function ({ event, api, threadsData, usersData }) {
    const { threadID, senderID, messageID, body, attachments, type } = event;
    const thread = await threadsData.get(threadID) || {};
    if (senderID === api.getCurrentUserID()) return;

    if (!global.resendStore) global.resendStore = new Map();

    // Stocke tous les messages entrants
    if (type !== 'message_unsend') {
      global.resendStore.set(messageID, {
        senderID,
        body,
        attachments,
        type
      });
    }

    // Lorsqu'un message est supprimé
    if (type === 'message_unsend') {
      const data = global.resendStore.get(messageID);
      if (!data || thread.resend === false) return;

      const name = await usersData.getName(data.senderID);
      const text = data.body || '[aucun texte]';
      const msg = {
        body: `📪 𝗥𝗘𝗦𝗘𝗡𝗗 𝗗𝗘 𝙼𝚂𝙶 𝚂𝚄𝙿𝙿𝚁. 📪\n━━━━━━━━━━━━━━━\n👤 Auteur : ${name}\n📝 Message : ${text}\n🗂 Pièces jointes : ${data.attachments?.length || 0}`,
        attachment: []
      };

      // Gestion des fichiers attachés
      if (data.attachments?.length > 0) {
        for (let i = 0; i < data.attachments.length; i++) {
          const file = data.attachments[i];
          const url = file.url;
          const ext = url.split('.').pop().split('?')[0];
          const path = `./cache/resend_${Date.now()}_${i}.${ext}`;

          const stream = (await axios.get(url, { responseType: 'stream' })).data;
          await new Promise((res, rej) => {
            const writer = fs.createWriteStream(path);
            stream.pipe(writer);
            writer.on('finish', res);
            writer.on('error', rej);
          });

          msg.attachment.push(fs.createReadStream(path));
        }
      }

      api.sendMessage(msg, threadID, () => {
        // Nettoyage après envoi
        for (const a of msg.attachment) a.close?.();
      });
    }
  }
};

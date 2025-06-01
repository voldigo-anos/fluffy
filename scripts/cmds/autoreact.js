const fs = require('fs');
const path = require('path');
const emojiRegex = require('emoji-regex');

// Chemin vers le fichier de config par salon
const configPath = path.join(__dirname, 'autoreactConfig.json');

// Charger les données existantes
let reactStatus = {};
if (fs.existsSync(configPath)) {
  try {
    reactStatus = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('❌ Erreur de lecture du fichier autoreactConfig.json:', err);
  }
}

module.exports = {
  config: {
    name: "autoreact",
    version: "1.2",
    author: "Aesther",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "bot auto-reacts to emoji"
    },
    description: {
      en: "Automatically reacts to messages with emoji randomly (ON/OFF per thread)"
    },
    category: "automation",
    guide: {
      en: "{p}autoreact on | off"
    }
  },

  langs: {
    en: {
      turnedOn: "✅ Auto-react is now ENABLED in this thread.",
      turnedOff: "❌ Auto-react is now DISABLED in this thread.",
      notAdmin: "⚠️ Only group admins can use this command.",
      alreadyOn: "ℹ️ Auto-react is already ENABLED.",
      alreadyOff: "ℹ️ Auto-react is already DISABLED.",
      noEmoji: "❌ No emoji found."
    }
  },

  onStart: async function ({ api, event, args, getLang }) {
    const { threadID, senderID } = event;
    const threadInfo = await api.getThreadInfo(threadID);

    // Vérifie si l'utilisateur est admin
    const isAdmin = threadInfo.adminIDs.some(e => e.id === senderID);
    if (!isAdmin) return api.sendMessage(getLang("notAdmin"), threadID);

    const status = args[0]?.toLowerCase();
    if (status === "on") {
      if (reactStatus[threadID] === true)
        return api.sendMessage(getLang("alreadyOn"), threadID);
      reactStatus[threadID] = true;
      saveConfig();
      return api.sendMessage(getLang("turnedOn"), threadID);
    }

    if (status === "off") {
      if (reactStatus[threadID] === false)
        return api.sendMessage(getLang("alreadyOff"), threadID);
      reactStatus[threadID] = false;
      saveConfig();
      return api.sendMessage(getLang("turnedOff"), threadID);
    }

    return api.sendMessage(getLang("guide.en"), threadID);
  },

  onChat: async function ({ api, event }) {
    const { body, messageID, threadID } = event;
    if (!body || reactStatus[threadID] !== true) return;

    try {
      const regex = emojiRegex();
      const matches = [...body.matchAll(regex)];

      if (matches.length > 0) {
        const randomEmoji = matches[Math.floor(Math.random() * matches.length)][0];
        await api.setMessageReaction(randomEmoji, messageID, true, threadID);
      }
    } catch (err) {
      console.error("❌ Error in autoreact:", err);
    }
  }
};

function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(reactStatus, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ Error writing to autoreactConfig.json:', err);
  }
  }

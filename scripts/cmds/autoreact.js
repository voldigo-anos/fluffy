const emojiRegex = require('emoji-regex');

module.exports = {
  config: {
    name: "autoreact",
    version: "1.0",
    author: "Aesther",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "auto-reacts with emoji"
    },
    description: {
      en: "Bot automatically reacts to messages containing emoji (random one)"
    },
    category: "automation",
    guide: {
      en: "Send a message with one or more emoji and the bot will react"
    }
  },

  langs: {
    en: {
      noEmoji: "❌ No emoji found in the message"
    }
  },

  onStart: async function () {
    // Pas de commande manuelle, tout se passe en onChat
  },

  onChat: async function ({ api, event }) {
    const { body, messageID, threadID } = event;
    if (!body) return;

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

const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "geting",
    version: "3.1",
    aliases: ["entre", "join"],
    author: "Aesther (modifié par ChatGPT)",
    countDown: 5,
    role: 2,
    shortDescription: "Join another GC with this command just typing @join and chose GC with 🔢 number",
    longDescription: "to get in another GC",
    category: "ACCs",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function ({ api, event }) {
    try {
      const groupList = await api.getThreadList(300, null, ["INBOX"]);
      const filteredList = groupList.filter(group => group.threadName !== null);

      if (filteredList.length === 0) {
        return api.sendMessage("No group chats found.", event.threadID);
      }

      const start = 0;
      const currentList = filteredList.slice(start, start + 5).map((group, index) =>
        `${index + 1}▪ ${group.threadName}\n🆔: ${group.threadID}`
      );

      const message = `[📑]𝗟𝗜𝗦𝗧 𝗚𝗥𝗢𝗨𝗣:\n┏[🌐]━━━━━━━┓\n${currentList.join("\n")}\n┗[🌐]━━━━━━━┛\n-[⏭️] ▪ next \n-[⏮️] ▪ previous\n-[⏯️] ▪ join`;

      const sentMessage = await api.sendMessage(message, event.threadID);

      // Auto-delete after 60 seconds
      setTimeout(() => {
        api.unsendMessage(sentMessage.messageID);
      }, 60000);

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "join",
        messageID: sentMessage.messageID,
        author: event.senderID,
        start,
      });

    } catch (error) {
      console.error("Error listing group chats:", error);
      api.sendMessage("⚠️ An error occurred while listing group chats.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author, start } = Reply;
    if (event.senderID !== author) return;

    const userInput = args.join(" ").trim().toLowerCase();
    const pageSize = 5;

    try {
      const groupList = await api.getThreadList(300, null, ["INBOX"]);
      const filteredList = groupList.filter(group => group.threadName !== null);

      if (userInput === "next" || userInput === "⏭️") {
        const nextStart = start + pageSize;
        if (nextStart >= filteredList.length) return api.sendMessage("📌 End of list reached.", event.threadID);

        const nextList = filteredList.slice(nextStart, nextStart + pageSize).map((group, index) =>
          `${nextStart + index + 1}▪ ${group.threadName}\n🆔: ${group.threadID}`
        );

        const message = `[📑]𝗟𝗜𝗦𝗧 𝗚𝗥𝗢𝗨𝗣:\n┏[🌐]━━━━━━━┓\n${nextList.join("\n")}\n┗[🌐]━━━━━━━┛\n-[⏭️] ▪ next \n-[⏮️] ▪ previous\n-[⏯️] ▪ join`;
        const sentMessage = await api.sendMessage(message, event.threadID);

        setTimeout(() => api.unsendMessage(sentMessage.messageID), 60000);

        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: "join",
          messageID: sentMessage.messageID,
          author: event.senderID,
          start: nextStart,
        });

      } else if (userInput === "previous" || userInput === "⏮️") {
        const prevStart = Math.max(start - pageSize, 0);
        const prevList = filteredList.slice(prevStart, prevStart + pageSize).map((group, index) =>
          `${prevStart + index + 1}▪ ${group.threadName}\n🆔: ${group.threadID}`
        );

        const message = `[📑]𝗟𝗜𝗦𝗧 𝗚𝗥𝗢𝗨𝗣:\n┏[🌐]━━━━━━━┓\n${prevList.join("\n")}\n┗[🌐]━━━━━━━┛\n-[⏭️] ▪ next \n-[⏮️] ▪ previous\n-[⏯️] ▪ join`;
        const sentMessage = await api.sendMessage(message, event.threadID);

        setTimeout(() => api.unsendMessage(sentMessage.messageID), 60000);

        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: "join",
          messageID: sentMessage.messageID,
          author: event.senderID,
          start: prevStart,
        });

      } else if (!isNaN(userInput)) {
        const index = parseInt(userInput, 10) - 1;
        if (index < 0 || index >= filteredList.length) {
          return api.sendMessage("🚫 Invalid group number.", event.threadID);
        }

        const targetGroup = filteredList[index];
        await api.addUserToGroup(event.senderID, targetGroup.threadID);
        api.sendMessage(`✅ You have joined: ${targetGroup.threadName}`, event.threadID);

      } else {
        api.sendMessage("💢 Invalid input. Use ⏯️ to join, ⏭️ for next, or ⏮️ for previous.", event.threadID);
      }
    } catch (error) {
      console.error("Error in reply handler:", error);
      api.sendMessage("⚠️ Something went wrong, try again later.", event.threadID);
    }

    // Supprimer la réponse de suivi
    global.GoatBot.onReply.delete(event.messageID);
  },
};

module.exports = {
  config: {
    name: "pv",
    aliases: ["privatemessage", "pm"],
    version: "2",
    author: "Aesther",
    countDown: 1,
    role: 0,
    shortDescription: {
      en: "message Anonime pour les PV et se faire accepter par le 𝗕𝗢𝗧☂"
    },
    longDescription: {
      en: "Envoyer des messages par le bot"
    },
    category: "𝗔𝗖𝗖𝘀",
    guide: {
      en: "{p}𝗣𝗩 𝗨𝗜𝗗 text"
    }
  },
  onStart: async function ({ api, event, args }) {
    if (args.length < 2) {
      return api.sendMessage(
        "{PF}PM 𝗨𝗜𝗗 [message]\n\n♡︎@pm 61555882584314 Salut 👋🙂",
        event.threadID,
        event.messageID
      );
    }

    const idBox = args[0];
    const message = args.slice(1).join(" ");

    try {
      // Get the sender's information
      const userInfo = await api.getUserInfo(event.senderID);
      const senderName = userInfo[event.senderID].name;

      // Send the message with the sender's name tagged
      api.sendMessage({
        body: `${message}\n\n[🆔] ${senderName}`,
        mentions: [{
          tag: senderName,
          id: event.senderID
        }]
      }, idBox, () => {
        api.sendMessage(
          `▪〉💌×𝙎𝙐𝘾𝘾𝙀𝙎𝙎× \n────────────\n𝗖𝗢𝗡𝗧𝗘𝗡𝗧:\n[${message}] 💬\n🆔 : ${idBox} ☂`,
          event.threadID
        );
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      api.sendMessage(
        "An error occurred while trying to fetch user information.",
        event.threadID,
        event.messageID
      );
    }
  }
};

const deltaNext = global.GoatBot.configCommands.envCommands.rank.deltaNext;
const expToLevel = exp => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
const { drive } = global.utils;

module.exports = {
  config: {
    name: "rankup",
    version: "1.3",
    author: "NTKhang | LiANE | Aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Bật/tắt thông báo level up",
      en: "Turn on/off level up notification"
    },
    longDescription: {
      vi: "Bật/tắt thông báo level up",
      en: "Turn on/off level up notification"
    },
    category: "rank",
    guide: {
      en: "{pn} [on | off]"
    },
    envConfig: {
      deltaNext: 5
    }
  },

  langs: {
    vi: {
      syntaxError: "⚠ | Sai cú pháp, chỉ có thể dùng {pn} on hoặc {pn} off",
      turnedOn: "✅ | Đã bật thông báo level up",
      turnedOff: "✅ | Đã tắt thông báo level up",
      notiMessage: "🎉🎉 chúc mừng %1 đã đạt level %2"
    },
    en: {
      syntaxError: "⚠ | Syntax error, only use {pn} on or {pn} off",
      turnedOn: "✅ | Turned on level up notification",
      turnedOff: "✅ | Turned off level up notification",
      notiMessage: "🌸𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡🌸\n【%1】𝚄𝚛 𝚃𝚊𝚕𝚔𝚒𝚗𝚐 𝗦𝗞𝗜𝗟𝗟 𝚒𝚜 𝚗𝚘𝚠\n 》 [𝗟𝘃𝗟✨ -「%2」]《"
    }
  },

  onStart: async function ({ message, event, threadsData, args, getLang }) {
    if (!["on", "off"].includes(args[0]))
      return message.reply(getLang("syntaxError"));
    await threadsData.set(event.threadID, args[0] == "on", "settings.sendRankupMessage");
    return message.reply(args[0] == "on" ? getLang("turnedOn") : getLang("turnedOff"));
  },

  onChat: async function ({ threadsData, usersData, event, message, getLang }) {
    const data = await usersData.get(event.senderID);
    const userName = data.name;

    const threadData = await threadsData.get(event.threadID);
    const sendRankupMessage = threadData.settings.sendRankupMessage;
    if (!sendRankupMessage)
      return;
    const { exp } = data;
    const currentLevel = expToLevel(exp);
    if (currentLevel > expToLevel(exp - 1)) {
      const forMessage = {
        body: getLang("notiMessage", userName, currentLevel)
      };
      if (threadData.data.rankup?.attachments?.length > 0) {
        const files = threadData.data.rankup.attachments;
        const attachments = files.reduce((acc, file) => {
          acc.push(drive.getFile(file, "stream"));
          return acc;
        }, []);
        forMessage.attachment = (await Promise.allSettled(attachments))
          .filter(({ status }) => status == "fulfilled")
          .map(({ value }) => value);
      }
      message.reply(forMessage);
    }
  }
};

const fs = require("fs-extra");
const axios = require("axios");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "1.4",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "Thay đổi prefix của bot",
    longDescription: "Thay đổi prefix của bot trong box chat hoặc toàn hệ thống",
    category: "config",
    guide: {
      vi: "   {pn} <prefix>: đổi prefix trong box\n   {pn} <prefix> -g: đổi prefix toàn hệ thống (admin)\n   {pn} reset: reset về mặc định",
      en: "   {pn} <prefix>: change local prefix\n   {pn} <prefix> -g: change global prefix (admin)\n   {pn} reset: reset to default"
    }
  },

  langs: {
    vi: {
      reset: "✅ Prefix của bạn đã được đặt lại về mặc định: %1",
      onlyAdmin: "⚠️ Chỉ admin mới có thể thay đổi prefix toàn hệ thống!",
      confirmGlobal: "📢 Hãy thả cảm xúc để xác nhận thay đổi prefix toàn hệ thống",
      confirmThisThread: "📥 Thả cảm xúc để xác nhận thay đổi prefix nhóm này",
      successGlobal: "✅ Đã thay đổi prefix hệ thống thành: %1",
      successThisThread: "✅ Đã thay đổi prefix nhóm thành: %1",
      myPrefix: "\n𝗔𝗘𝗦𝗧𝗛𝗘𝗥-𝗕𝗢𝗧\n\n ➫𝗣𝗙 : [ %2 ]\n\n🌸 [𝗚𝗢𝗔𝗧𝗧𝗕𝗢𝗧-𝗩𝟮]\n☁️ 𝘼𝘿𝙈𝙄𝙉-𝙇𝙄𝙉𝙆: \n➤https://www.facebook.com/thegodess.aesther\n✦contact 𝗔𝗗𝗠𝗜𝗡✦"
    },
    en: {
      reset: "✅ Your prefix has been reset to default: %1",
      onlyAdmin: "⚠️ Only admin can change system prefix!",
      confirmGlobal: "📢 React to confirm changing system prefix",
      confirmThisThread: "📥 React to confirm changing your group prefix",
      successGlobal: "✅ Global prefix changed to: %1",
      successThisThread: "✅ Prefix changed in your chat to: %1",
      myPrefix: "\n𝗔𝗘𝗦𝗧𝗛𝗘𝗥-𝗕𝗢𝗧\n\n ➫𝗣𝗙 : [ %2 ]\n\n🌸 [𝗚𝗢𝗔𝗧𝗧𝗕𝗢𝗧-𝗩𝟮]\n☁️ 𝘼𝘿𝙈𝙄𝙉-𝙇𝙄𝙉𝙆: \n➤https://www.facebook.com/thegodess.aesther\n✦contact 𝗔𝗗𝗠𝗜𝗡✦"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0])
      return message.SyntaxError();

    if (args[0].toLowerCase() === 'reset') {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix,
      setGlobal: args[1] === "-g"
    };

    if (formSet.setGlobal && role < 2)
      return message.reply(getLang("onlyAdmin"));

    return message.reply(
      formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread"),
      (err, info) => {
        formSet.messageID = info.messageID;
        global.GoatBot.onReaction.set(info.messageID, formSet);

        // Optionally expire the confirmation
        setTimeout(() => {
          if (global.GoatBot.onReaction.has(info.messageID)) {
            global.GoatBot.onReaction.delete(info.messageID);
            message.unsend(info.messageID);
          }
        }, 60000); // 1 minute
      }
    );
  },

  onReaction: async function ({ message, event, threadsData, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author)
      return message.reply("⚠️ Seul l'utilisateur qui a lancé la commande peut confirmer.");

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, usersData, getLang }) {
    if (event.body?.trim().toLowerCase() === "prefix") {
      const name = (await usersData.get(event.senderID)).name;
      return message.reply({
        body: `🈷️ ${name} 🈷️` + getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID)),
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/dV0G0Sw.jpeg")
      });
    }
  }
};

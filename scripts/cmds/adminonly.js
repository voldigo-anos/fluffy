const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
  config: {
    name: "adminonly",
    aliases: ["adonly", "onlyad", "onlyadmin"],
    version: "2.2",
    author: "Aesther",
    countDown: 5,
    role: 2,
    shortDescription: "🔐 Mode admin-only",
    longDescription: "Active/désactive le mode réservé aux admins + voir statut",
    category: "⚙️ Configuration",
    guide: {
      fr:
`╭─〔 🌸 Mode AdminOnly 〕─╮
│
│ 🛡️ {pn} on/off       ➜ Activer/Désactiver
│ 🔔 {pn} noti on/off  ➜ Gérer les notifications
│ 📊 {pn} status       ➜ Voir l'état actuel
│
╰─────────────★彡`,

      en:
`╭─〔 🌸 AdminOnly Mode 〕─╮
│
│ 🛡️ {pn} on/off       ➜ Enable/Disable mode
│ 🔔 {pn} noti on/off  ➜ Toggle notifications
│ 📊 {pn} status       ➜ View current status
│
╰─────────────★彡`
    }
  },

  langs: {
    fr: {
      turnedOn: "✅ | (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ Mode admin-only **activé** !",
      turnedOff: "❎ | (；・∀・) Mode admin-only **désactivé**.",
      turnedOnNoti: "🔔 | (｡♥‿♥｡) Notifications **activées** pour les non-admins.",
      turnedOffNoti: "🔕 | (ノಠ益ಠ)ノ彡⧸⧹ Notifications **désactivées**.",
      syntaxError: "⚠️ | (¬_¬\") Utilisation invalide. Tape « adminonly » pour voir le guide complet.",
      status:
`╭──〔 📊 État du mode AdminOnly 〕──╮
│
│ 🔐 Mode : {mode}
│ 🔔 Notification : {noti}
│
╰─────────────★彡`
    },
    en: {
      turnedOn: "✅ | (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ Admin-only mode **enabled**!",
      turnedOff: "❎ | (；・∀・) Admin-only mode **disabled**.",
      turnedOnNoti: "🔔 | (｡♥‿♥｡) Notification **enabled** for non-admins.",
      turnedOffNoti: "🔕 | (ノಠ益ಠ)ノ彡⧸⧹ Notification **disabled**.",
      syntaxError: "⚠️ | (¬_¬\") Invalid usage. Type “adminonly” to see full guide.",
      status:
`╭──〔 📊 AdminOnly Status 〕──╮
│
│ 🔐 Mode: {mode}
│ 🔔 Notification: {noti}
│
╰─────────────★彡`
    }
  },

  onStart: function ({ args, message, getLang }) {
    let isNotification = false;
    let value;
    let index = 0;

    if (args[0]?.toLowerCase() === "status") {
      const mode = config.adminOnly.enable ? "✅ Activé" : "❌ Désactivé";
      const noti = config.hideNotiMessage.adminOnly ? "🔕 Désactivée" : "🔔 Activée";
      return message.reply(getLang("status")
        .replace("{mode}", mode)
        .replace("{noti}", noti));
    }

    if (args[0]?.toLowerCase() === "noti") {
      isNotification = true;
      index = 1;
    }

    const input = args[index]?.toLowerCase();
    if (input === "on") value = true;
    else if (input === "off") value = false;
    else return message.reply(getLang("syntaxError"));

    if (isNotification) {
      config.hideNotiMessage.adminOnly = !value;
      message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
    } else {
      config.adminOnly.enable = value;
      message.reply(getLang(value ? "turnedOn" : "turnedOff"));
    }

    fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
  }
};

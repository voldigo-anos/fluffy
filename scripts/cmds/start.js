const { commands } = global.GoatBot;
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "start",
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: { en: "🌸 Lister toutes les commandes (mode simple)" },
    longDescription: { en: "Affiche une liste stylisée de toutes les commandes disponibles sans détail." },
    category: "info",
    guide: { en: "{pn}" },
  },

  onStart: async function ({ message, event }) {
    const emojiList = ["🍭","💶","📩","📅","🗿","☢️","🌊","☂️","🎲","🗾","🎀","🎖️","🛍️","👑","📑","🏷️","🔖","📚","🚀","🌸", "🪐", "🌀", "✨", "🧃", "🎯", "🔮", "📎", "🍡", "🌙", "🎮", "📌", "📜", "🍥", "🌼", "🧠", "📁", "🎲", "💫", "📝"];
    const allCommands = [...commands.keys()].sort();

    let output = `╔═════✦❀✧❀✦═════╗\n`;
    output += `   ⛩️ 𝗔𝗘 - 𝗦𝗧𝗔𝗥𝗧 ⛩️\n`;
    output += `╚═════✦❀✧❀✦═════╝\n\n`;

    for (let i = 0; i < allCommands.length; i++) {
      const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
      output += `${emoji} ∅ ${allCommands[i]}\n ⌨`;
    }

    output += `\n〓〓〓〓〓〓〓〓〓〓〓\n`;
    output += `[🧙‍♀️] By®: ⌨𝙏𝙃𝙀𝘼✎ 𝙱𝙾𝚃 ⚔️\n`;
    output += `[🕒] Expire dans 1 minute...\n`;
    output += `\n(っ◔◡◔)っ ♥ 召喚完了 ♥`;

    const sent = await message.reply(output);

    // 🔁 Auto suppression après 1 min
    setTimeout(() => {
      message.unsend(sent.messageID).catch(() => {});
    }, 70 * 1000);
  }
};

const fs = require('fs');
module.exports = {
  config: {
    name: "yamete",
    version: "1",
    author: "aesther",
    countDown: 5,
    role: 0,
    shortDescription: "vocal aesther🥵",
    longDescription: "no prefix",
    category: "VOCAL",
  },
  onStart: async function(){},
  onChat: async function({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "yamete") {
      return message.reply({
        body: "🥵",
        attachment: fs.createReadStream("scripts/cmds/cache/yamete.mp3"),
      });
    }
  }
};

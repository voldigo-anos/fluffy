const axios = require("axios");
const fs = require("fs");
const path = require("path");

const voices = {
  "🙂": { model: "特别周", name: "Special Week" },
  "😆": { model: "无声铃鹿", name: "Silence Suzuka" },
  "😎": { model: "东海帝王", name: "Tokai Teio" },
  "🤩": { model: "丸善斯基", name: "Maruzensky" },
  "😉": { model: "富士奇迹", name: "Fuji Kiseki" },
  "😋": { model: "小栗帽", name: "Oguri Cap" },
  "😂": { model: "黄金船", name: "Gold Ship" },
  "😈": { model: "伏特加", name: "Vodka" },
  "😍": { model: "大和赤骥", name: "Daiwa Scarlet" }
};

module.exports = {
  config: {
    name: "tts",
    aliases: [],
    version: "1.1",
    author: "aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Anime voice TTS"
    },
    longDescription: {
      en: "Convert text to voice using anime voice models"
    },
    category: "media",
    guide: {
      en: "tts [text to say]\nAfter that, choose a voice with emoji (🙂, 😆, etc.)"
    }
  },

  onStart: async function ({ api, event, args }) {
    const text = args.join(" ");
    if (!text) return api.sendMessage("📝 | Please provide text to say.\nExample: tts Hello world", event.threadID, event.messageID);

    let voiceList = "🗣️ | Please choose a voice by replying with an emoji:\n";
    for (const [emoji, data] of Object.entries(voices)) {
      voiceList += `${emoji} - ${data.name}\n`;
    }

    api.sendMessage(`🎤 Text: ${text}\n\n${voiceList}`, event.threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "tts",
        messageID: info.messageID,
        author: event.senderID,
        text
      });
    }, event.messageID);
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { author, text } = Reply;
    if (event.senderID !== author) return;

    const emoji = event.body.trim();
    const selected = voices[emoji];

    if (!selected) {
      return api.sendMessage("❌ | Invalid emoji. Please choose a valid one from the list.", event.threadID, event.messageID);
    }

    const apiUrl = `https://fastrestapis.fasturl.cloud/tts/anime?text=${encodeURIComponent(text)}&speed=1&language=Mix&model=${encodeURIComponent(selected.model)}`;

    try {
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const ext = ".mp3";
      const filePath = path.join(__dirname, "cache", `${Date.now()}_tts${ext}`);
      fs.writeFileSync(filePath, res.data);

      api.sendMessage({
        body: `✅ | Here is your voice from ${selected.name} ${emoji}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        // Clean file after sending
        fs.unlinkSync(filePath);
      }, event.messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ | Failed to generate audio.", event.threadID, event.messageID);
    }
  }
};

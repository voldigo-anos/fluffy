const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "upscale",
    aliases: ["4k", "hd"],
    version: "2.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "✨ Améliorer une image avec différents niveaux de qualité",
    longDescription: "Répond à une image ou donne une URL, puis choisis le niveau de qualité (1x, 2x, 4x)",
    category: "image",
    guide: "{pn} <image en réponse ou url>"
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, messageReply } = event;

    let imageUrl;

    // Cas 1 : réponse à une image
    if (messageReply?.attachments?.[0]?.type === "photo") {
      imageUrl = messageReply.attachments[0].url;
    }

    // Cas 2 : URL directe
    if (args[0]?.startsWith("http")) {
      imageUrl = args[0];
    }

    if (!imageUrl) {
      return message.reply("📸 Réponds à une image ou donne un lien direct d’image.");
    }

    // Design + Emoji choix
    const msg = `🌟 𝗨𝗽𝘀𝗰𝗮𝗹𝗲 - 𝗤𝘂𝗮𝗹𝗶𝘁é 💠\n\n🧠 Choisis le niveau d’amélioration :\n\n1️⃣ • Basique (x1)\n2️⃣ • Bon (x2)\n3️⃣ • 𝟰𝗞 Ultra HD (x4)\n\n⏳ Réagis pour commencer`;
    const sent = await message.reply(msg);

    const reactions = ["1️⃣", "2️⃣", "3️⃣"];
    for (const react of reactions) await api.setMessageReaction(react, sent.messageID, () => {}, true);

    global.GoatBot.onReaction.set(sent.messageID, {
      commandName: this.config.name,
      author: event.senderID,
      imageUrl,
    });
  },

  onReaction: async function ({ event, api, message, Reaction }) {
    if (event.userID !== Reaction.author) return;

    const qualityMap = {
      "1️⃣": "1",
      "2️⃣": "2",
      "3️⃣": "4"
    };

    const scale = qualityMap[event.reaction];
    if (!scale) return;

    try {
      message.reply(`📤 𝗨𝗣𝗦𝗖𝗔𝗟𝗘 x${scale} 🖼️`);

      const res = await axios.get(
        `https://nirkyy-dev.hf.space/api/v1/upscale?url=${encodeURIComponent(Reaction.imageUrl)}&scale=${scale}`,
        { responseType: "arraybuffer" }
      );

      const fileName = `upscaled-${Date.now()}.png`;
      const filePath = path.join(__dirname, "cache", fileName);
      await fs.outputFile(filePath, res.data);

      message.reply({
        body: `━━ ⬆️ 𝗨𝗣𝗦𝗖𝗔𝗟𝗘  ${scale}x ━━`,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      return message.reply("❌ Échec de l'amélioration. Vérifie le lien ou l’image.");
    }
  }
};

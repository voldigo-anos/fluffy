const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "art",
    version: "2.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "🎨 Transforme une image en anime",
    longDescription: "Réponds à une image avec `art 1` (homme) ou `art 2` (femme) pour choisir le genre, puis choisis un style.",
    category: "image",
    guide: "Réponds à une image avec :\nart 1 (homme)\nart 2 (femme)"
  },

  onStart({ api, event, args }) {
    const gender = args[0] === "1" ? "male" : args[0] === "2" ? "female" : null;
    const { messageReply, threadID, messageID } = event;

    if (!gender) {
      return api.sendMessage("❗ Utilise : art 1 (homme) ou art 2 (femme)", threadID, messageID);
    }

    if (!messageReply || messageReply.attachments.length === 0 || messageReply.attachments[0].type !== "photo") {
      return api.sendMessage("📸 Réponds à une image pour la transformer.", threadID, messageID);
    }

    const imageUrl = messageReply.attachments[0].url;
    const styleList = [
      "Elegant and majestic",
      "Futuristic cyberpunk",
      "Mysterious and dramatic",
      "Dark and gothic",
      "Magical and fairy-like",
      "Cute chibi style",
      "Samurai legend",
      "Vibrant fantasy world",
      "Royal anime style",
      "Emotional soft art"
    ];

    const styleText = styleList.map((style, i) => `${i + 1}️⃣ ${style}`).join("\n");

    api.sendMessage(
      `✨ Choisis un style de transformation :\n\n${styleText}\n\n✏️ Réponds avec le numéro du style choisi.`,
      threadID,
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "art",
          imageUrl,
          gender,
          author: event.senderID,
          styleList
        });
      }
    );
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, senderID, body } = event;
    const { imageUrl, gender, author, styleList } = Reply;

    if (senderID !== author) return;

    const index = parseInt(body.trim());
    if (isNaN(index) || index < 1 || index > styleList.length) {
      return api.sendMessage("❗ Numéro invalide. Réessaie avec un numéro dans la liste.", threadID, messageID);
    }

    const prompt = styleList[index - 1];
    api.sendMessage(`🎨 Transformation en cours avec le style : *${prompt}*...`, threadID);

    try {
      const apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/toanime?imageUrl=${encodeURIComponent(imageUrl)}&gender=${gender}&specificPrompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      const fileName = path.join(__dirname, "cache", `art_${Date.now()}.jpg`);
      fs.writeFileSync(fileName, res.data);

      api.sendMessage(
        {
          body: `✅ Voici ton image transformée en style anime :\n👤 Genre : ${gender.toUpperCase()}\n🎭 Style : ${prompt}`,
          attachment: fs.createReadStream(fileName)
        },
        threadID,
        () => fs.unlinkSync(fileName)
      );
    } catch (err) {
      console.error("Erreur de transformation anime :", err);
      api.sendMessage("❌ Une erreur est survenue lors de la génération de l'image.", threadID, messageID);
    }
  }
};

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "voiceover",
    aliases: ["voicegen", "vocal"],
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "🎙️ Generate a voice from text",
      fr: "🎙️ Génère une voix avec un personnage"
    },
    longDescription: {
      en: "Generate an audio clip from your text using a famous character's voice",
      fr: "Génère un audio à partir de ton texte avec la voix d’un personnage célèbre"
    },
    category: "media",
    guide: {
      en: "{pn} [text] → Select a voice from the list",
      fr: "{pn} [texte] → Choisis une voix parmi la liste"
    }
  },

  langs: {
    en: {
      menu: "🎤 | *Choose a voice for your text:*\n\n" +
        "1️⃣ Miku (Hatsune Miku)\n" +
        "2️⃣ Nahida\n" +
        "3️⃣ Nami\n" +
        "4️⃣ Ana 👩\n" +
        "5️⃣ Optimus Prime 🤖\n" +
        "6️⃣ Goku 🥊\n" +
        "7️⃣ Taylor Swift 🎤\n" +
        "8️⃣ Elon Musk 🚀\n" +
        "9️⃣ Mickey Mouse 🐭\n" +
        "🔟 Kendrick Lamar 🎶\n" +
        "🔢 Eminem 🎤\n\n" +
        "⏳ Reply with the **number** to choose a voice.",
      missingText: "❗ | You must enter text to vocalize.",
      waiting: "⏳ | Generating voice...",
      error: "❌ | An error occurred:"
    },
    fr: {
      menu: "🎤 | *Sélectionne une voix pour ton texte :*\n\n" +
        "1️⃣ Miku (Hatsune Miku)\n" +
        "2️⃣ Nahida\n" +
        "3️⃣ Nami\n" +
        "4️⃣ Ana 👩\n" +
        "5️⃣ Optimus Prime 🤖\n" +
        "6️⃣ Goku 🥊\n" +
        "7️⃣ Taylor Swift 🎤\n" +
        "8️⃣ Elon Musk 🚀\n" +
        "9️⃣ Mickey Mouse 🐭\n" +
        "🔟 Kendrick Lamar 🎶\n" +
        "🔢 Eminem 🎤\n\n" +
        "⏳ Réponds avec le **numéro** pour choisir la voix.",
      missingText: "❗ | Tu dois entrer un texte à vocaliser.",
      waiting: "⏳ | Génération de la voix...",
      error: "❌ | Une erreur est survenue :"
    }
  },

  onStart: async function ({ api, event, args, message, getLang }) {
    const text = args.join(" ");
    if (!text) return message.reply(getLang("missingText"));

    return message.reply(getLang("menu")).then(res => {
      global.GoatBot.onReply.set(res.messageID, {
        commandName: this.config.name,
        messageID: res.messageID,
        author: event.senderID,
        text
      });
    });
  },

  onReply: async function ({ api, event, Reply, message, getLang }) {
    const { author, text } = Reply;
    if (event.senderID !== author) return;

    const index = parseInt(event.body);
    if (isNaN(index) || index < 1 || index > 11)
      return message.reply("❗ | Numéro invalide. Réessaye avec un chiffre entre 1 et 11.");

    const models = [
      "miku", "nahida", "nami", "ana", "optimus_prime",
      "goku", "taylor_swift", "elon_musk", "mickey_mouse",
      "kendrick_lamar", "eminem"
    ];
    const model = models[index - 1];

    message.reply(getLang("waiting"));
    try {
      const res = await axios.get(`https://api.agatz.xyz/api/voiceover`, {
        params: {
          text,
          model
        }
      });

      const url = res.data?.data?.oss_url;
      if (!url) throw new Error("Audio link not found in response.");

      const filePath = path.join(__dirname, "tmp", `${Date.now()}.wav`);
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data, "utf-8"));

      await message.reply({
        body: `✅ | Audio generated using voice: ${res.data.data.voice_name}`,
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => fs.unlink(filePath).catch(() => {}), 30 * 1000);
    } catch (err) {
      return message.reply(getLang("error") + " " + err.message);
    }
  }
}; 

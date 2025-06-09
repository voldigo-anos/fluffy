const axios = require("axios");
const fs = require("fs");
const path = require("path");

const validTags = [
  "waifu", "neko", "maid", "oppai", "uniform", "trap", "panties", "blowjob", "selfie",
  "milf", "thighs", "boobs", "hentai", "feet", "oral", "orgy"
]; // Tu peux en rajouter ici si tu veux

module.exports = {
  config: {
    name: "waifu",
    version: "5.1",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "📸 Image waifu avec tag personnalisé",
    longDescription: "Tape un tag comme 'waifu neko', puis choisis entre SFW ou NSFW",
    category: "image",
    guide: {
      fr: "{pn} neko\n{pn} maid\n{pn} oppai\n→ Ensuite choisis ❤️ ou 🔞",
      en: "{pn} neko\n{pn} maid\n{pn} oppai\n→ Then choose ❤️ or 🔞"
    }
  },

  onStart: async function ({ message, event, args }) {
    if (args.length === 0) {
      return message.reply(
        "❗ Merci de fournir un tag.\n✅ Tags disponibles :\n" +
        validTags.map(t => `• ${t}`).join("\n")
      );
    }

    const tag = args.join(" ").trim().toLowerCase();

    if (!validTags.includes(tag)) {
      return message.reply(
        `❗ Le tag "${tag}" n'est pas valide.\n✅ Tags disponibles :\n` +
        validTags.map(t => `• ${t}`).join("\n")
      );
    }

    const msg = {
      body: `🎴 𝑾𝑨𝑰𝑭𝑼 𝑮𝑬́𝑵𝑬́𝑹𝑨𝑻𝑬𝑼𝑹 🎴\n━━━━━━━━━━━━━━━\n📂 Tag choisi : ${tag}\n❤️ : Waifu SFW\n🙂 : Waifu NSFW\n━━━━━━━━━━━━━━━\n⏳ Réponds avec l’un des emojis pour choisir le type.`,
    };

    const sent = await message.reply(msg);

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "waifu",
      author: event.senderID,
      tag
    });

    setTimeout(() => global.GoatBot.onReply.delete(sent.messageID), 60000);
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const emoji = event.body.trim();
    const type = emoji === "❤️" ? "sfw" : emoji === "🙂" ? "nsfw" : null;

    if (!type) {
      return api.sendMessage("❗ Choisis uniquement entre ❤️ (SFW) ou 🙂 (NSFW).", event.threadID, event.messageID);
    }

    const tag = Reply.tag;
    const url = `https://fastrestapis.fasturl.cloud/sfwnsfw/anime?type=${type}&tag=${encodeURIComponent(tag)}`;
    const filePath = path.join(__dirname, `waifu_${Date.now()}.jpg`);

    try {
      const response = await axios.get(url, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);
      writer.on("finish", () => {
        api.sendMessage({
          body: `✨ Waifu (${type.toUpperCase()}) avec tag : ${tag}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      });

      writer.on("error", () => {
        fs.unlinkSync(filePath);
        api.sendMessage("⚠️ Erreur lors de l’écriture du fichier.", event.threadID);
      });

    } catch (err) {
      console.error(err?.response?.data || err);
      api.sendMessage("⚠️ Une erreur est survenue lors de la récupération de l’image.", event.threadID);
    }
  }
};

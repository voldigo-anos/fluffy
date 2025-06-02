const axios = require("axios");
const fs = require("fs");
const path = require("path");

const fonts = {
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
  J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
  S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
};

function applyFont(text) {
  return text.split('').map(char => fonts[char] || char).join('');
}

module.exports = {
  config: {
    name: "gen",
    aliases: ["generate"],
    version: "1.0",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: "Génère une image depuis un prompt",
    longDescription: "Utilise l'intelligence artificielle pour générer une image stylisée depuis un texte.",
    category: "ai",
    guide: "{pn} <prompt>"
  },

  onStart: async function ({ message, args, api, event }) {
    const prompt = args.join(" ").trim();
    const messageID = event.messageID;

    if (!prompt) {
      return message.reply(applyFont("✏️ Donne un prompt pour générer une image."));
    }

    try {
      const { data } = await axios.get(`https://api.nekorinn.my.id/ai-img/netwrck-img?text=${encodeURIComponent(prompt)}`);
      const urls = data?.result;

      if (!urls || urls.length === 0) {
        return message.reply(applyFont("❌ Aucune image trouvée."));
      }

      const images = [];
      const filePaths = [];

      for (const url of urls) {
        const imgResponse = await axios.get(url, { responseType: "arraybuffer" });
        const fileName = `gen_${Date.now()}_${Math.floor(Math.random() * 9999)}.png`;
        const filePath = path.join(__dirname, "cache", fileName);
        fs.writeFileSync(filePath, imgResponse.data);
        images.push(fs.createReadStream(filePath));
        filePaths.push(filePath);
      }

      const reply = await message.reply({
        body: applyFont(`🖼️ Prompt : ${prompt}\n🪐 Image(s) générée(s) avec succès !`),
        attachment: images
      });

      api.setMessageReaction("🪐", messageID, () => {}, true);

      setTimeout(() => {
        for (const file of filePaths) {
          fs.unlink(file, () => {});
        }
        api.unsendMessage(reply.messageID);
      }, 2 * 60 * 1000); // 2 minutes

    } catch (error) {
      console.error(error);
      return message.reply(applyFont("❌ Une erreur est survenue lors de la génération d'image."));
    }
  }
};

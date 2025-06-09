const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "flux",
    version: "1.0",
    author: "Aesther",
    countDown: 10,
    role: 0,
    shortDescription: "🎨 Génère une image IA stylisée",
    longDescription: "Crée une image en choisissant un style artistique et un prompt personnalisé.",
    category: "image",
    guide: {
      fr: "{pn} → Saisie un prompt et choisis un style pour générer une image.",
      en: "{pn} → Enter a prompt and pick a style to generate an AI image."
    }
  },

  onStart: async function ({ api, event, message }) {
    const msg = `🧠 𝙵𝙻𝚄𝚇 𝙶𝙴𝙽𝙴́𝚁𝙰𝚃𝙴𝚄𝚁 𝙳'𝙸𝙼𝙰𝙶𝙴 🎨
━━━━━━━━━━━━━━━━━━
📥 Envoie maintenant ton *prompt* (ex: “futuristic city at night”)
Après ça, tu choisiras un style :
- 1️⃣ Hyper-Surreal Escape
- 2️⃣ Neon Fauvism
- 3️⃣ Post-Analog Glitchscape
- 4️⃣ AI Dystopia
- 5️⃣ Vivid Pop Explosion
━━━━━━━━━━━━━━━━━━
Réponds à ce message avec ton prompt.`;

    message.reply(msg, (err, info) => {
      if (err) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "flux",
        author: event.senderID,
        step: "await_prompt"
      });
    });
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID !== Reply.author) return;

    const { step, prompt } = Reply;

    if (step === "await_prompt") {
      const newMsg = `🎨 Tu as choisi ce prompt :
"${event.body.trim()}"

Maintenant choisis un style artistique :
1️⃣ Hyper-Surreal Escape
2️⃣ Neon Fauvism
3️⃣ Post-Analog Glitchscape
4️⃣ AI Dystopia
5️⃣ Vivid Pop Explosion

Réponds par un chiffre (1 à 5).`;

      message.reply(newMsg, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "flux",
          author: event.senderID,
          step: "await_style",
          prompt: event.body.trim()
        });
      });
    }

    if (step === "await_style") {
      const styles = {
        "1": "Hyper-Surreal Escape",
        "2": "Neon Fauvism",
        "3": "Post-Analog Glitchscape",
        "4": "AI Dystopia",
        "5": "Vivid Pop Explosion"
      };

      const styleChoice = styles[event.body.trim()];
      if (!styleChoice) {
        return api.sendMessage("❌ Choix invalide. Réponds avec un chiffre de 1 à 5.", event.threadID, event.messageID);
      }

      const imgURL = `https://fastrestapis.fasturl.cloud/aiimage/flux/style?prompt=${encodeURIComponent(prompt)}&style=${encodeURIComponent(styleChoice)}`;
      const filePath = path.join(__dirname, `flux_${Date.now()}.jpg`);

      try {
        const response = await axios.get(imgURL, { responseType: "stream" });
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);
        writer.on("finish", () => {
          api.sendMessage({
            body: `🖼️ 𝙸𝙼𝙰𝙶𝙴 𝙶𝙴́𝙽𝙴́𝚁𝙴́𝙴 !\n🎨 Style : ${styleChoice}\n🧠 Prompt : "${prompt}"`,
            attachment: fs.createReadStream(filePath)
          }, event.threadID, () => fs.unlinkSync(filePath));
        });
      } catch (err) {
        console.error(err);
        api.sendMessage("⚠️ Une erreur est survenue lors de la génération de l'image.", event.threadID);
      }
    }
  }
};

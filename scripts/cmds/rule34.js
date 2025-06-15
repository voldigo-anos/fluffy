const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const AUTO_FILE = path.join(__dirname, "cache", "rule34-auto.json");

// Initialisation de la structure
let autoThreads = {};
if (fs.existsSync(AUTO_FILE)) {
  autoThreads = JSON.parse(fs.readFileSync(AUTO_FILE));
}

// Lancement du cycle d'envoi automatique
setInterval(async () => {
  for (const threadID of Object.keys(autoThreads)) {
    try {
      await sendRule34Image(global.api, threadID);
    } catch (err) {
      console.error(`❌ [Rule34 Auto] Erreur pour ${threadID}:`, err.message);
    }
  }
}, 20 * 60 * 1000); // 20 minutes

async function sendRule34Image(api, threadID) {
  const url = `https://api.nekorinn.my.id/random/rule34`;
  const fileName = `rule34_${Date.now()}.jpg`;
  const filePath = path.join(__dirname, "cache", fileName);

  const res = await axios.get(url, { responseType: "arraybuffer" });
  await fs.ensureDir(path.join(__dirname, "cache"));
  fs.writeFileSync(filePath, res.data);

  await api.sendMessage({
    body: `🔞 | Auto-NSFW activé !`,
    attachment: fs.createReadStream(filePath)
  }, threadID);

  setTimeout(() => fs.remove(filePath).catch(() => {}), 60 * 1000); // Suppression auto
}

module.exports = {
  config: {
    name: "rule34",
    version: "2.0",
    author: "Aesther",
    role: 2,
    countDown: 10,
    shortDescription: "🔞 NSFW auto / manuel",
    longDescription: "Affiche une image NSFW rule34, active ou désactive l’envoi toutes les 20 minutes.",
    category: "nsfw",
    guide: {
      fr: "{p}rule34 : image manuelle\n{p}rule34 on : auto toutes les 20min\n{p}rule34 off : stop auto"
    }
  },

  onStart: async function ({ api, message, event, args }) {
    const threadID = event.threadID;

    const sub = args[0]?.toLowerCase();
    if (sub === "on") {
      autoThreads[threadID] = true;
      fs.writeFileSync(AUTO_FILE, JSON.stringify(autoThreads, null, 2));
      return message.reply("✅ | Auto-NSFW Rule34 activé (envoi toutes les 20 minutes)");
    }

    if (sub === "off") {
      delete autoThreads[threadID];
      fs.writeFileSync(AUTO_FILE, JSON.stringify(autoThreads, null, 2));
      return message.reply("❌ | Auto-NSFW Rule34 désactivé");
    }

    // Envoi manuel
    try {
      await sendRule34Image(api, threadID);
    } catch (err) {
      console.error("❌ Erreur Rule34:", err.message);
      await message.reply("⚠️ | Erreur lors du chargement de l'image.");
    }
  }
};

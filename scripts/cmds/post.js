const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "post",
    aliases: [],
    version: "2.0",
    author: "Aesther",
    role: 2,
    shortDescription: "Créer un post Facebook (texte, image, vidéo)",
    longDescription: "Publie un message avec ou sans pièces jointes (images ou vidéos)",
    category: "tools",
    guide: "{pn} <texte> ou réponds à une image/vidéo"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply, attachments } = event;
    const postMessage = args.join(" ");
    const filePaths = [];

    const allAttachments = (messageReply?.attachments?.length
      ? messageReply.attachments
      : attachments) || [];

    const files = [];

    try {
      // Téléchargement des fichiers joints
      for (const attachment of allAttachments) {
        const fileExt = attachment.type === "video" ? ".mp4" : ".png";
        const filePath = path.join(__dirname, "cache", `post_${Date.now()}_${Math.floor(Math.random() * 9999)}${fileExt}`);

        const response = await axios.get(attachment.url, {
          responseType: "stream",
          headers: { "User-Agent": "Mozilla/5.0" }
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        await new Promise((res, rej) => {
          writer.on("finish", res);
          writer.on("error", rej);
        });

        files.push(fs.createReadStream(filePath));
        filePaths.push(filePath);
      }

      const postData = {
        body: postMessage || "(aucun texte fourni)"
      };
      if (files.length > 0) postData.attachment = files;

      // Création du post
      api.createPost(postData)
        .then((url) => {
          api.sendMessage(`✅ 𝗣𝗼𝘀𝘁 𝗰𝗿éé 𝗮𝘃𝗲𝗰 𝘀𝘂𝗰𝗰è𝘀 !\n🔗 ${url || "Aucun lien retourné."}`, threadID, messageID);
        })
        .catch((err) => {
          const fallbackUrl = err?.data?.story_create?.story?.url;
          if (fallbackUrl) {
            return api.sendMessage(`✅ 𝗣𝗼𝘀𝘁 𝗰𝗿éé !\n🔗 ${fallbackUrl}\n⚠️ (Avec avertissements)`, threadID, messageID);
          }

          const errMsg = err?.message || "❌ Erreur inconnue.";
          api.sendMessage(`❌ 𝗘𝗿𝗿𝗲𝘂𝗿 𝗹𝗼𝗿𝘀 𝗱𝘂 𝗽𝗼𝘀𝘁 :\n${errMsg}`, threadID, messageID);
        })
        .finally(() => {
          for (const path of filePaths) {
            fs.unlink(path, () => {});
          }
        });

    } catch (error) {
      console.error("❌ Erreur dans la commande post:", error);
      return api.sendMessage("❌ Une erreur est survenue lors de la création du post.", threadID, messageID);
    }
  }
};

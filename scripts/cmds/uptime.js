const os = require("os");
const fs = require("fs-extra");

const startTime = new Date();

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    author: "aesther",
    countDown: 0,
    role: 0,
    category: "system",
    longDescription: {
      en: "Get system and bot uptime info",
    },
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    try {
      const uptimeInSeconds = (new Date() - startTime) / 1000;
      const days = Math.floor(uptimeInSeconds / (3600 * 24));
      const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeInSeconds % 60);
      const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      const totalMem = os.totalmem() / 1024 / 1024 / 1024;
      const freeMem = os.freemem() / 1024 / 1024 / 1024;
      const usedMem = totalMem - freeMem;

      const cpuModel = os.cpus()[0].model;
      const cpuUsage = os.cpus().map(cpu => cpu.times.user).reduce((a, b) => a + b) / os.cpus().length;

      const currentTime = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour12: true });
      const currentDate = new Date().toLocaleDateString("en-US");

      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      const start = Date.now();
      await api.sendMessage("🌐 Getting system info...", event.threadID);
      const ping = Date.now() - start;
      const status = ping < 1000 ? "🟢 Smooth" : "🔴 Laggy";

      const info = `
╔═══════════════╗
  🌸  𝗨𝗣𝗧𝗜𝗠𝗘 𝗦𝗧𝗔𝗧𝗨𝗦  🌸
╚═══════════════╝
📅 𝗗𝗮𝘁𝗲: ${currentDate}
⏰ 𝗧𝗶𝗺𝗲: ${currentTime}
📡 𝗣𝗶𝗻𝗴: ${ping}ms
📶 𝗦𝘁𝗮𝘁𝘂𝘀: ${status}

🕒 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: ${uptime}

💻 𝗦𝘆𝘀𝘁𝗲𝗺 𝗜𝗻𝗳𝗼:
• OS: ${os.type()} ${os.arch()}
• CPU: ${cpuModel}
• CPU Usage: ${cpuUsage.toFixed(2)}%
• Node.js: ${process.version}

📁 𝗠𝗲𝗺𝗼𝗿𝘆:
• Used: ${usedMem.toFixed(2)} GB
• Total: ${totalMem.toFixed(2)} GB

👥 𝗕𝗼𝘁 𝗦𝘁𝗮𝘁𝘀:
• Users: ${allUsers.length}
• Threads: ${allThreads.length}
╚════════════════╝
`;

      api.sendMessage({ body: info }, event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to retrieve system info.", event.threadID);
    }
  }
};

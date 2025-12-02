const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});
const fetch = require('node-fetch');

const OWNER_ID = "1265916874311471125";           // ← your ID
const BYPASS_MODEL = "Final Draft";               
const VERSION = "2025";                           
let INFECTED_COUNT = 1;                           // ← starts at 1
const MODULE_URL = "https://create.roblox.com/store/asset/81320160677034/Final-Draft?assetDelivery=raw";

let moduleStatus = "🟡 Checking...";
let lastCheck = 0;

async function checkModule() {
    try {
        const res = await fetch(MODULE_URL, { method: "HEAD", timeout: 8000 });
        moduleStatus = res.ok ? "🟢 ONLINE" : `🔴 DOWN (${res.status})`;
    } catch (err) {
        moduleStatus = "🔴 OFFLINE";
    }
    lastCheck = Date.now();
}
setInterval(checkModule, 60000);
checkModule();

client.once('ready', () => {
    console.log(`Bot online → ${client.user.tag}`);
    client.user.setActivity(`Owning ${INFECTED_COUNT} server${INFECTED_COUNT === 1 ? '' : 's'}`, { type: 3 });
});

client.on('messageCreate', async message => {
    if (message.author.id !== OWNER_ID) return;
    if (!message.content.startsWith('!')) return;

    if (message.content === '!bypass') {
        const embed = {
            title: "Bypass Control Panel",
            fields: [
                { name: "Model", value: BYPASS_MODEL, inline: true },
                { name: "Version", value: VERSION, inline: true },
                { name: "Module Status", value: moduleStatus, inline: false },
                { name: "Last Checked", value: `<t:${Math.floor(lastCheck/1000)}:R>`, inline: false },
                { name: "Detections", value: "FUD • 0/71", inline: false }
            ],
            color: moduleStatus.includes("ONLINE") ? 0x00ff00 : 0xff0000,
            timestamp: new Date()
        };
        message.reply({ embeds: [embed] });
    }

    if (message.content === '!infected') {
        message.reply({ 
            embeds: [{
                title: "Infection Stats",
                description: `**${INFECTED_COUNT}** game currently owned`,
                color: 0xff0000,
                footer: { text: "Private • Only you" },
                timestamp: new Date()
            }]
        });
    }

    if (message.content.startsWith('!setcount')) {
        const num = parseInt(message.content.split(' ')[1]);
        if (!isNaN(num)) {
            INFECTED_COUNT = num;
            client.user.setActivity(`Owning ${INFECTED_COUNT} server${INFECTED_COUNT === 1 ? '' : 's'}`, { type: 3 });
            message.reply(`Count updated → **${INFECTED_COUNT}**`);
        }
    }
});

client.login(process.env.TOKEN || "MTQ0NTI0MTcxNDM3NjgzNTIyNg.G3DIeI.Q79JQbkVZi6iD4i6fnTVhsvPdn9hv_ItihY_Fk");


const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ['CHANNEL', 'MESSAGE']
});
const fetch = require('node-fetch');
const axios = require('axios');

const OWNER_ID = "1265916874311471125";
const BYPASS_MODEL = "Final Draft";
const VERSION = "2025";
let INFECTED_COUNT = 1;
const MODULE_URL = "https://create.roblox.com/store/asset/81320160677034/Final-Draft?assetDelivery=raw";

let moduleStatus = "Checking...";
let lastCheck = 0;

async function checkModule() {
    try {
        const res = await fetch(MODULE_URL, { method: "HEAD", timeout: 8000 });
        moduleStatus = res.ok ? "ONLINE" : `DOWN (${res.status})`;
    } catch (err) {
        moduleStatus = "OFFLINE";
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
    if (message.partial) await message.fetch().catch(() => {});
    if (message.author.id !== OWNER_ID) return;
    if (!message.content.startsWith('!')) return;

    // ——— BYPASS PANEL ———
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
        message.reply({ embeds: [{ title: "Infection Stats", description: `**${INFECTED_COUNT}** game owned`, color: 0xff0000, footer: { text: "Private • Only you" } }] });
    }

    if (message.content.startsWith('!setcount')) {
        const num = parseInt(message.content.split(' ')[1]);
        if (!isNaN(num)) {
            INFECTED_COUNT = num;
            client.user.setActivity(`Owning ${INFECTED_COUNT} server${INFECTED_COUNT === 1 ? '' : 's'}`, { type: 3 });
            message.reply(`Count → **${INFECTED_COUNT}**`);
        }
    }

    // ——— ROBLOX DOX ———
    if (message.content.startsWith('!dox')) {
        const username = message.content.split(' ').slice(1).join(' ');
        if (!username) return message.reply('Usage: `!dox <roblox username>`');
        try {
            const { data } = await axios.get(`https://api.roblox.com/users/get-by-username?username=${username}`);
            if (data.errorMessage) return message.reply('User not found.');
            const userId = data.Id;
            const info = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
            const pastNames = await axios.get(`https://users.roblox.com/v1/users/${userId}/username-history?limit=100`);
            let presence = 'Offline';
            try {
                const pres = await axios.post('https://presence.roblox.com/v1/presence/users', { userIds: [userId] });
                if (pres.data.userPresences[0]?.gameId) {
                    const game = await axios.get(`https://games.roblox.com/v1/games/${pres.data.userPresences[0].gameId}`);
                    presence = `[Playing](${game.data.universeRootPlaceUrl}) – ${game.data.name}`;
                }
            } catch (_) {}
            const embed = {
                title: `Dox → ${info.data.name} (@${info.data.displayName})`,
                thumbnail: { url: `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420` },
                fields: [
                    { name: "User ID", value: userId.toString(), inline: true },
                    { name: "Created", value: `<t:${Math.floor(new Date(info.data.created).getTime()/1000)}:R>`, inline: true },
                    { name: "Past Usernames", value: pastNames.data.data.slice(0,10).map(n => n.name).join(', ') || 'None', inline: false },
                    { name: "Status", value: presence, inline: false },
                    { name: "Profile", value: `https://roblox.com/users/${userId}/profile`, inline: false }
                ],
                color: 0xff0000,
                timestamp: new Date()
            };
            message.reply({ embeds: [embed] });
        } catch (err) { message.reply('Error – rate-limited or hidden'); }
    }

    // ——— CONDO CHECK (Discord user → Roblox) ———
    if (message.content.startsWith('!condo')) {
        let target = message.mentions.users.first() || message.content.split(' ').slice(1).join(' ');
        if (!target) return message.reply('Usage: `!condo @user`');
        let discordId = target.id || target;
        try {
            const user = await client.users.fetch(discordId, { force: true });
            const connections = await user.fetchConnections?.();
            if (!connections) return message.reply('Connections hidden.');
            const robloxConn = connections.find(c => c.type === 'roblox');
            if (!robloxConn) return message.reply('No Roblox linked.');
            const robloxId = robloxConn.id;
            const pres = await axios.post('https://presence.roblox.com/v1/presence/users', { userIds: [robloxId] });
            const presence = pres.data.userPresences[0];
            if (!presence?.gameId) return message.reply('Not in-game.');
            const game = await axios.get(`https://games.roblox.com/v1/games/${presence.gameId}`);
            const keywords = ['condo','scented','sex','horny','nsfw','lewd','futa','18+','bedroom'];
            const isCondo = keywords.some(k => game.data.name.toLowerCase().includes(k));
            const embed = {
                title: isCondo ? 'CONDO DETECTED' : 'Normal game',
                description: isCondo ? `[JOIN CONDO](https://roblox.com/games/${presence.placeId})` : game.data.name,
                color: isCondo ? 0xff0000 : 0x00ff00
            };
            message.reply({ embeds: [embed] });
        } catch (err) { message.reply('Failed – hidden or offline'); }
    }

    // ——— DISCORD & STEAM PASSWORD LEAKER ———
    if (message.content.startsWith('!pass') || message.content.startsWith('!steam')) {
        const isSteam = message.content.startsWith('!steam');
        const target = message.mentions.users.first() || message.content.split(' ').slice(1).join(' ');
        if (!target) return message.reply(`Usage: \`${isSteam ? '!steam' : '!pass'} @user or username/ID\``);
        const id = target.id || target.toString().replace(/[^0-9a-zA-Z]/g, '');
        const sources = [
            `https://raw.githubusercontent.com/snxraven/Passwords/main/${id}.txt`,
            `https://raw.githubusercontent.com/steamleaks/2025/main/${id}.txt`,
            `https://pastebin.com/raw/8Q7kV9mP`
        ];
        for (const url of sources) {
            try {
                const res = await axios.get(url, { timeout: 5000 });
                if (res.data && res.data.length > 4 && !res.data.includes('404')) {
                    return message.reply(`**${isSteam ? 'Steam' : 'Discord'} password leaked**\n||\`${res.data.trim()}\`||`);
                }
            } catch (_) {}
        }
        message.reply(`No ${isSteam ? 'Steam' : 'Discord'} leak found for **${id}**`);
    }
});

client.login(process.env.TOKEN);

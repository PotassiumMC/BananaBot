const config = require('./config.json');
const { getModrinthDownloadCounts, getCurseForgeDownloadCounts } = require('./utils/downloadCountUtils.js');

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('ready', () => {
    updateStatus();
    setInterval(updateStatus, 2 * 60 * 1000);

    console.log(`Logged in as ${client.user.tag}!`);
});

async function updateStatus() {
    const modrinthDownloadCounts = await getModrinthDownloadCounts(config.projects.modrinth);
    const curseForgeDownloadCounts = await getCurseForgeDownloadCounts(config.keys.curseforge, config.projects.curseforge);

    const totalDownloadCount = modrinthDownloadCounts.reduce((a, b) => a + b, 0) + curseForgeDownloadCounts.reduce((a, b) => a + b, 0);
    client.user.setPresence({
        status: 'online',
        activities: [
            {
                type: 'WATCHING',
                name: `${totalDownloadCount.toLocaleString('en-UK')} downloads`
            }
        ]
    })
}

client.login(config.keys.discord);

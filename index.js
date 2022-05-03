const config = require('./config.json');
const { getModrinthDownloadCounts, getCurseForgeDownloadCounts } = require('./utils/downloadCountUtils.js');

const fetch = require('node-fetch');
const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.config = config;
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    console.log(`Discovered command: ${command.data.name}!`);
    client.commands.set(command.data.name, command);
}

client.on('messageCreate', async message => {
    if (message.attachments.size === 0) return;

    for (const [attachmentID, attachment] of message.attachments) {
        if (!attachment.contentType.startsWith('text/plain')) continue;

        const content = await (await fetch(attachment.url)).text();

        const paste = await (await fetch('https://api.paste.gg/v1/pastes', {
            method: 'POST',
            body: JSON.stringify({
                name: `Attachment by ${message.author.tag} (${message.author.id})`,
                visibility: 'unlisted',
                files: [
                    {
                        name: attachment.name,
                        content: {
                            format: 'text',
                            value: content
                        }
                    }
                ]
            }),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Key ${config.keys.pastegg}`
            }
        })).json();

        if (paste.status !== 'success') return;

        await message.reply({
            allowedMentions: { users: [], roles: [] },
            content: `${attachment.name} by <@${message.author.id}>: <https://paste.gg/${paste.result.id}>`
        });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isContextMenu() && interaction.member) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(client, interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command! Please try again later.', ephemeral: true });
    }
});

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

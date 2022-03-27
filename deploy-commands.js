const config = require('./config.json');

const fs = require('node:fs');
const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    console.log(`Discovered command: ${command.data.name}!`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(config.keys.discord);

client.on('ready', () => {
    console.log(`Registering commands as ${client.user.tag}!`);

    rest.put(Routes.applicationCommands(client.user.id), { body: commands })
        .then(() => {
            console.log('Successfully registered application commands!');
            client.destroy();
        })
        .catch(console.error);
});

client.login(config.keys.discord);

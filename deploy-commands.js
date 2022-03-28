const config = require('./config.json');

const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    console.log(`Discovered command: ${command.data.name}!`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(config.keys.discord);

rest.get('/users/@me').then((user) => {
    console.log(`Registering commands as ${user.username}#${user.discriminator}!`);
    rest.put(Routes.applicationCommands(user.id), { body: commands })
        .then(() => {
            console.log('Successfully registered application commands!');
        })
        .catch(console.error);
}).catch(console.error);

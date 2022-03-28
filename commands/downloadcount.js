const { getModrinthDownloadCounts, getCurseForgeDownloadCounts } = require('../utils/downloadCountUtils.js');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, CommandInteraction } = require('discord.js');

const CACHE_DURATION = 60 * 1000;
var cachedDownloadCounts;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('downloadcount')
        .setDescription('Gets the total download count of all PotassiumMC mods'),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        if (!cachedDownloadCounts) {
            // Only fetch download counts every once in a while to prevent getting ratelimited
            const modrinthDownloadCounts = await getModrinthDownloadCounts(client.config.projects.modrinth);
            const curseForgeDownloadCounts = await getCurseForgeDownloadCounts(client.config.keys.curseforge, client.config.projects.curseforge);

            cachedDownloadCounts = {
                modrinth: modrinthDownloadCounts.reduce((a, b) => a + b, 0),
                curseforge: curseForgeDownloadCounts.reduce((a, b) => a + b, 0)
            };

            setTimeout(() => cachedDownloadCounts = undefined, CACHE_DURATION);
        }

        const totalDownloads = cachedDownloadCounts.modrinth + cachedDownloadCounts.curseforge;

        await interaction.reply(`PotassiumMC projects have a total of **${totalDownloads.toLocaleString('en-UK')} downloads** (<:modrinth:957719524029923328> **${cachedDownloadCounts.modrinth.toLocaleString('en-UK')}**, <:curseforge:957720550141210624> **${cachedDownloadCounts.curseforge.toLocaleString('en-UK')}**)`);
    }
};

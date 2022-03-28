const { ApplicationCommandType } = require('discord-api-types/v9');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');

const { Collection, Permissions, Client, MessageContextMenuInteraction, MessageEmbed } = require('discord.js');

const cooldowns = new Collection();

const COOLDOWN = 5 * 60 * 1000;

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Report Message')
        .setType(ApplicationCommandType.Message),

    /**
     * @param {Client} client
     * @param {MessageContextMenuInteraction} interaction
     */
    async execute(client, interaction) {
        const reportedMessage = interaction.targetMessage;

        if (reportedMessage.author.id === interaction.user.id) {
            await interaction.reply({ content: '**You can\'t report yourself, silly!**', ephemeral: true });
            return;
        }

        if (!interaction.channel.permissionsFor(interaction.member).has(Permissions.FLAGS.SEND_MESSAGES)) {
            await interaction.reply({ content: '**This message can\'t be reported!** You can only report messages in channels you can talk in.', ephemeral: true });
            return;
        }

        if (cooldowns.has(interaction.user.id)) {
            await interaction.reply({ content: '**You are reporting messages too fast!** Slow down and try again later. Please keep in mind that abusing the reports feature can result in a kick or ban.', ephemeral: true });
            return;
        }

        const modsChannel = await interaction.member.guild.channels.fetch(client.config.reportsChannel);
        if (!modsChannel) {
            await interaction.reply({ content: 'Failed to find reports channel. Please try again later.', ephemeral: true });
            return;
        }

        const reportedMessageMember = reportedMessage.webhookId ? null : await reportedMessage.guild.members.fetch(reportedMessage.author.id);

        const reportedMessageEmbed = new MessageEmbed()
            .setTitle(`[Click to jump]`)
            .setURL(reportedMessage.url)
            .setDescription(reportedMessage.content)
            .setAuthor({
                iconURL: reportedMessageMember ? reportedMessageMember.displayAvatarURL() : reportedMessage.author.displayAvatarURL(), // Fall back to standard avatar.
                name: reportedMessageMember ? reportedMessageMember.displayName : reportedMessage.author.username
            })
            .setTimestamp(reportedMessage.createdAt)
            .setFooter({
                text: reportedMessage.id
            });

        await modsChannel.send({
            content: `\`[${getTime()}]\` :exclamation: ${interaction.user.tag} (\`${interaction.user.id}\`) reported a message by ${reportedMessage.author.tag} (\`${reportedMessage.author.id}\`) in **#${reportedMessage.channel.name}**: ${client.config.modsPing}`,
            embeds: [reportedMessageEmbed]
        });
        await interaction.reply({ content: ':white_check_mark: Thank you for reporting this message. Your report has been passed on to the moderation team and will be looked at as soon as possible.', ephemeral: true });

        cooldowns.set(interaction.member.id, true);
        setTimeout(() => cooldowns.delete(interaction.member.id), COOLDOWN);
    }
};

getTime = () => new Date().toLocaleString('en-UK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Europe/Amsterdam' });

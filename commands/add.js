const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('**Veuillez ajouter un client au Bureau des Demandes.**')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('**Client à ajouter au bureau des demandes.**')
        .setRequired(true)),
  async execute(interaction, client) {
    const chan = client.channels.cache.get(interaction.channelId);
    const user = interaction.options.getUser('target');
    if (!interaction.member.roles.cache.find(r => r.id === client.config.roleSupport)) return interaction.reply({ content: "**Vous devez être de l'équiple LSI.**", ephemeral: true })
    if (chan.name.includes('ticket')) {
      chan.edit({
        permissionOverwrites: [{
          id: user,
          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        },
        {
          id: client.config.roleSupport,
          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        },
        ],
      }).then(async () => {
        interaction.reply({
          content: `**<@${user.id}> demande auprès de l'équipe LSI.**`
        });
      });
    } else {
      interaction.reply({
        content: '**Vous n\'êtes pas au bureau de contact !**',
        ephemeral: true
      });
    };
  },
};

const { getPasteUrl, PrivateBinClient } = require('@agc93/privatebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Vous avez un déjà un **Bureau de Demande** ouvert !',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`bureau-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: "GUILD_TEXT",
      }).then(async c => {
        interaction.reply({
          content: `Bienvenue au **Bureau des Demandes** ! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('6d6ee8')
          .setAuthor({name: `Bureau des Demandes`, iconURL: 'https://imgur.com/6k1nsiB.png'})
          .setDescription('Veuillez choisir la demande qui correspond le plus à vos critères.\nNotre **équipe** se fera un plaisir de vous **aider**.')
          .setFooter({text: `Los Santos Infos・Secrétaire Mariaa`})
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Veuillez choisir la demande qui correspond le plus à vos critères.\nNotre **équipe** se fera un plaisir de vous **aider**.')
            .addOptions([{
                label: client.config.Category1,
                value: client.config.Category1,
                emoji: '📞',
              },
              {
                label: client.config.Category2,
                value: client.config.Category2,
                emoji: '🧾',
              },
              {
                label: client.config.Category3,
                value: client.config.Category3,
                emoji: '📂',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 60000 //60 secondes
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor({name: 'Bureau des Demandes', iconURL: interaction.user.displayAvatarURL()})
                  .setDescription(`<@!${interaction.user.id}> est au **Bureau des demandes** pour \`${i.values[0]}\``)
                  .setFooter({text: `Los Santos Infos・Secrétaire Mariaa`})
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Fermer')
                    .setEmoji('✖')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Vous n'avez pas choisi de catégorie, nous classons donc votre demande sans suite.`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Fermer')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Annuler')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: '**Êtes-vous sûr de vouloir partir du Bureau des Demandes ?**',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `**Bureau de Demande** fermé par <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor({name: 'Bureau des Demandes', iconURL: 'https://i.imgur.com/oO5ZSRK.png'})
                .setDescription('```Résumé```')
                .setFooter({text: `${client.user.tag}`, iconURL: client.user.displayAvatarURL()})
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Fermer')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: '**Fermeture imminente !**',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: '**Fermeture imminente !**',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: '**Sauvegarde des messages...**'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('en-EN')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        var paste = new PrivateBinClient("https://privatebin.net/");
        var result = await paste.uploadContent(a, {uploadFormat: 'markdown'})
            const embed = new client.discord.MessageEmbed()
              .setAuthor({name: 'Ticket Logs', iconURL: 'https://i.imgur.com/oO5ZSRK.png'})
              .setDescription(`📰 Logs for ticket \`${chan.id}\` | created by <@!${chan.topic}> | closed by <@!${interaction.user.id}>\n\nLogs: [**Click here to see the logs**](${getPasteUrl(result)})`)
              .setColor('2f3136')
              .setFooter({text: "This log will be deleted in 24 hrs!"})
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor({name: 'Ticket Logs', iconURL: 'https://i.imgur.com/oO5ZSRK.png'})
              .setDescription(`📰 Logs for ticket \`${chan.id}\`: [**Click here to see the logs**](${getPasteUrl(result)})`)
              .setColor('2f3136')
              .setFooter({text: "This log will be deleted in 24 hrs!"})
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            }).catch(() => console.log("**Je n'ai pas trouvé le salon logs de ticket.**"));
            chan.send('**Salon supprimé...**');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
    };
  },
};

const chalk = require('chalk');

module.exports = {
  name: 'ready',
  execute(client) {
    console.log(chalk.red('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+='))
    console.log(chalk.green('Secrétaire Mariaa au poste !'))
    console.log(chalk.red('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+='))
    const oniChan = client.channels.cache.get(client.config.ticketChannel)

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('RED')
        .setAuthor('Bureau des Demandes', "https://imgur.com/6k1nsiB.png")
        .setDescription('Bonjour, je suis Mariaa et bienvenue au **Bureau des Demandes**.\nCliquez sur le bouton pour choisir la catégorie de votre demande.')
        .setFooter(`Los Santos Infos・Secrétaire Mariaa`)
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel('Ouvrir un Bureau')
          .setEmoji('📩')
          .setStyle('PRIMARY'),
        );

      oniChan.send({
        embeds: [embed],
        components: [row]
      })
    }

    oniChan.bulkDelete(100).then(() => {
      sendTicketMSG()
      console.log(chalk.green('Mariaa :') + chalk.cyan(' Sent the ticket creation widget..'))
    })
  },
};

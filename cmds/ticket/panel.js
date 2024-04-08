module.exports = {
    name: 'ticket',
    description: "Ouvre un ticket de support.",
    category: "mod",
    usage: 'ticket',
    go: async (client, db, config, interaction, args) => {
        try {
            const isOwner = db.get(`Owner_${interaction.guild.id}-${interaction.user.id}`) || config.owners.includes(interaction.user.id) || interaction.user.id === interaction.guild.ownerId;
            if (!isOwner) {
                return interaction.reply({
                    content: `\`❌\` *Vous n'avez pas les permissions pour exécuter cette commande*`,
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            const row = client.row().addComponents(
                client.menu()
                    .setCustomId('select')
                    .setPlaceholder('Choisis le type de ticket que tu souhaites créer.')
                    .addOptions([
                        {
                            label: '🤝 | Gestion Staff',
                            description: 'Ouvre un ticket pour la gestion du staff.',
                            value: 'gestionstaff',
                        },
                        {
                            label: '📛 | Gestion Abus',
                            description: 'Ouvre un ticket pour la gestion des abus.',
                            value: 'gestionabus',
                        },
                        {
                            label: '👥 | Owner',
                            description: 'Ouvre un ticket pour les propriétaires.',
                            value: 'owner',
                        },
                    ])
            );
            await interaction.editReply({
                embeds: [{
                    title: 'Ouverture de Ticket',
                    description: 'Clique sur le menu déroulant ci-dessous pour ouvrir un ticket.',
                    color: 0x2E3136,
                    footer: { text: 'Par Salah' }
                }],
                components: [row]
            });

        } catch (error) {
            console.error('Une erreur est survenue lors de l\'exécution de la commande ticket :', error);
        }
    }
};

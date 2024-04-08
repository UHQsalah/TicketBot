module.exports = async (client, db, config, interaction) => {
        try {
            const { PermissionFlagsBits, ChannelType } = require('discord.js');

            if (!interaction.isStringSelectMenu()) return;

            const row = client.row().addComponents(
                client.menu()
                    .setCustomId('del')
                    .setPlaceholder('Sélectionner pour supprimer le ticket !')
                    .addOptions([
                        {
                            label: '🗑️ Supprimer le ticket',
                            description: 'Supprime le salon',
                            value: 'delete',
                        },
                        {
                            label: '➕ Ajouter un utilisateur',
                            description: 'Ajoute un utilisateur au ticket existant',
                            value: 'addUser',
                        }
                    ])
            );

            const category = db.get(`ticketcategory_${interaction.guild.id}`);
            const gs = db.get(`gsrole_${interaction.guild.id}`);
            const gap = db.get(`gaprole_${interaction.guild.id}`);

            const existingChannel = interaction.guild.channels.cache.find(c => c.topic == interaction.user.id);

            if (interaction.customId === "del") {
                if (interaction.values[0] == "delete") {
                    const channel = interaction.channel;
                    channel.delete();
                } else if (interaction.values[0] == "addUser") {
                    const mentionEmbed = {
                        description: 'Ajouter un utilisateur au ticket\nMentionnez l\'utilisateur que vous souhaitez ajouter au ticket.',
                        color: 0x2E3136
                    };

                    interaction.reply({ embeds: [mentionEmbed], ephemeral: true }).then(() => {
                        const filter = (m) => m.mentions.users.size > 0 && m.author.id === interaction.user.id;
                        const collector = interaction.channel.createMessageCollector({ filter, time: 30000 });

                        collector.on('collect', (m) => {
                            const mentionedUser = m.mentions.users.first();
                            const mentionedMember = interaction.guild.members.cache.get(mentionedUser.id);

                            if (mentionedMember) {
                                const ticketChannel = interaction.channel;

                                ticketChannel.permissionOverwrites.create(mentionedMember, {
                                    ViewChannel : true,
                                    SendMessages : true,
                                    ReadMessageHistory : true,
                                });

                                interaction.followUp(`L'utilisateur ${mentionedUser} a été ajouté au ticket.`);
                            } else {
                                interaction.followUp('Utilisateur non trouvé.');
                            }

                            collector.stop();
                        });

                        collector.on('end', (collected, reason) => {
                            if (reason === 'time') {
                                interaction.followUp('La mention de l\'utilisateur a expiré.');
                            }
                        });
                    });
                }
            }

            if (interaction.customId == "select") {
                if (existingChannel) return interaction.reply({
                    embeds: [{
                        description: 'Vous avez déjà un ticket ouvert sur le serveur.',
                        color: 0x2E3136,
                    }],
                    ephemeral: true
                });
                if (interaction.values[0] == "gestionstaff") {
                    interaction.guild.channels.create({
                        name: `gs-${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        topic: `${interaction.user.id}`,
                        parent: `${category}`,
                        permissionOverwrites: [{
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages],
                                deny: [PermissionFlagsBits.MentionEveryone]
                            },
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: gs,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages],
                                deny: [PermissionFlagsBits.MentionEveryone]
                            }
                        ]
                    }).then((c) => {
                        const staff = {
                            description: `Bienvenue dans ton ticket ${interaction.user} !\nUn GS viendra prendre en compte ta demande !`,
                            color: 0x2E3136
                        };
                        c.send({ embeds: [staff], content: `<@&${gs}> | ${interaction.user}`, components: [row] });
                        interaction.reply({
                            content: `Votre ticket a été ouvert avec succès. <#${c.id}>`,
                            ephemeral: true
                        });
                    });

                } else if (interaction.values[0] == "gestionabus") {
                    interaction.guild.channels.create({
                        name: `gap-${interaction.user.username}`,
                        topic: `${interaction.user.id}`,
                        type: ChannelType.GuildText,
                        parent: `${category}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages],
                                deny: [PermissionFlagsBits.MentionEveryone]
                            },
                            {
                                id: gap,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages],
                                deny: [PermissionFlagsBits.MentionEveryone]
                            }
                        ]
                    }).then((c) => {
                        const report = {
                            description: 'Un gap arrive.',
                            color: 0x2E3136
                        };
                        c.send({ embeds: [report], content: `<@&${gap}> | ${interaction.user}`, components: [row] });
                        interaction.reply({
                            content: `Votre ticket a été ouvert avec succès. <#${c.id}>`,
                            ephemeral: true
                        });
                    });
                } else if (interaction.values[0] == "owner") {
                    interaction.guild.channels.create({
                        name: `owner-${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        topic: `${interaction.user.id}`,
                        parent: `${category}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages],
                                deny: [PermissionFlagsBits.MentionEveryone]
                            }
                        ]
                    }).then((c) => {
                        const embed = {
                            description: 'Un owner arrive mec.',
                            color: 0x2E3136
                        };
                        c.send({ embeds: [embed], content: `${interaction.user}`, components: [row] });
                        interaction.reply({
                            content: `Votre ticket a été ouvert avec succès. <#${c.id}>`,
                            ephemeral: true
                        });
                    });
                }
            }
        } catch (error) {
            console.error('Une erreur est survenue lors de l\'exécution de l\'événement interactionCreate :', error);
        }
    };

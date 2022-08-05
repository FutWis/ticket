const {
	ActionRowBuilder,
	ModalBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');
const emoji = require('node-emoji');

module.exports = class TicketManager {
	constructor(client) {
		/** @type {import("client")} */
		this.client = client;
	}

	/**
	 * @param {object} data
	 * @param {string} data.category
	 * @param {import("discord.js").ButtonInteraction|import("discord.js").SelectMenuInteraction} data.interaction
	 * @param {string?} [data.topic]
	 */
	async create({
		categoryId, interaction, topic, reference,
	}) {
		const category = await this.client.prisma.category.findUnique({
			include: {
				guild: true,
				questions: true,
			},
			where: { id: Number(categoryId) },
		});

		// TODO: if member !required roles -> stop

		// TODO: if discordCategory has 50 channels -> stop

		// TODO: if category has max channels -> stop

		// TODO: if member has max -> stop

		// TODO: if cooldown -> stop

		const getMessage =  this.client.i18n.getLocale(category.guild.locale);

		if (category.questions.length >= 1) {
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(JSON.stringify({
						action: 'questions',
						categoryId,
						reference,
					}))
					.setTitle(category.name)
					.setComponents(
						category.questions
							.sort((a, b) => a.order - b.order)
							.map(q => {
								if (q.type === 'TEXT') {
									return new ActionRowBuilder()
										.setComponents(
											new TextInputBuilder()
												.setCustomId(q.id)
												.setLabel(q.label)
												.setStyle(q.style)
												.setMaxLength(q.maxLength)
												.setMinLength(q.minLength)
												.setPlaceholder(q.placeholder)
												.setRequired(q.required)
												.setValue(q.value),
										);
								} else if (q.type === 'MENU') {
									return new ActionRowBuilder()
										.setComponents(
											new SelectMenuBuilder()
												.setCustomId(q.id)
												.setPlaceholder(q.placeholder || q.label)
												.setMaxValues(q.maxLength)
												.setMinValues(q.minLength)
												.setOptions(
													q.options.map((o, i) => {
														const builder = new SelectMenuOptionBuilder()
															.setValue(String(i))
															.setLabel(o.label);
														if (o.description) builder.setDescription(o.description);
														if (o.emoji) builder.setEmoji(emoji.hasEmoji(o.emoji) ? emoji.get(o.emoji) : { id: o.emoji });
														return builder;
													}),
												),
										);
								}
							}),
					),
			);
		} else if (category.requireTopic && !topic) {
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(JSON.stringify({
						action: 'topic',
						categoryId,
						reference,
					}))
					.setTitle(category.name)
					.setComponents(
						new ActionRowBuilder()
							.setComponents(
								new TextInputBuilder()
									.setCustomId('topic')
									.setLabel(getMessage('modals.topic'))
									.setStyle(TextInputStyle.Long),
							),
					),
			);
		} else {
			await this.postQuestions({
				categoryId,
				interaction,
				topic,
			});
		}
	}

	/**
	 * @param {object} data
	 * @param {string} data.category
	 * @param {import("discord.js").ButtonInteraction|import("discord.js").SelectMenuInteraction|import("discord.js").ModalSubmitInteraction} data.interaction
	 * @param {string?} [data.topic]
	 */
	async postQuestions({
		categoryId, interaction, topic, reference,
	}) {
		await interaction.deferReply({ ephemeral: true });
		console.log(require('util').inspect(interaction, {
			colors: true,
			depth: 10,
		}));
		if (interaction.isModalSubmit()) {

		}

		interaction.editReply({
			components: [],
			embeds: [],
		});
	}
};
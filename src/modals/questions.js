const { Modal } = require('@eartharoid/dbf');

module.exports = class QuestionsModal extends Modal {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'questions',
		});
	}

	async run(id, interaction) {
		console.log(id);
		console.log(require('util').inspect(interaction, {
			colors: true,
			depth: 10,
		}));

		// TODO: custom topic
	}
};
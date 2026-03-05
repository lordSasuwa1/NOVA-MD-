/**
 * NOVA-MD — CMD/nsfw/nurse-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'nurse-nsfw',
    description: 'Envoie une image nurse NSFW',
    usage: 'nurse-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'nurse-nsfw', 'Nurse NSFW')
  }
}

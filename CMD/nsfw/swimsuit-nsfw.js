/**
 * NOVA-MD — CMD/nsfw/swimsuit-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'swimsuit-nsfw',
    description: 'Envoie une image swimsuit NSFW',
    usage: 'swimsuit-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'swimsuit-nsfw', 'Swimsuit NSFW')
  }
}

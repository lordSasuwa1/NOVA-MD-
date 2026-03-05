/**
 * NOVA-MD — CMD/nsfw/dragon-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'dragon-nsfw',
    description: 'Envoie une image dragon NSFW',
    usage: 'dragon-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'dragon-nsfw', 'Dragon NSFW')
  }
}

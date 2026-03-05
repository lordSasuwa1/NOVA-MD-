/**
 * NOVA-MD — CMD/nsfw/random-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'random-nsfw',
    description: 'Envoie une image NSFW aléatoire toutes catégories',
    usage: 'random-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'random-nsfw', 'Random NSFW')
  }
}

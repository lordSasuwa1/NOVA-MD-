/**
 * NOVA-MD — CMD/nsfw/solo-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'solo-nsfw',
    description: 'Envoie une image solo NSFW',
    usage: 'solo-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'solo-nsfw', 'Solo NSFW')
  }
}

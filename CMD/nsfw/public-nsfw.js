/**
 * NOVA-MD — CMD/nsfw/public-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'public-nsfw',
    description: 'Envoie une image public use NSFW',
    usage: 'public-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'public-nsfw', 'Public NSFW')
  }
}

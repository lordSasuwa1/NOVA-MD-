/**
 * NOVA-MD — CMD/nsfw/angel-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'angel-nsfw',
    description: 'Envoie une image angel NSFW',
    usage: 'angel-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'angel-nsfw', 'Angel NSFW')
  }
}

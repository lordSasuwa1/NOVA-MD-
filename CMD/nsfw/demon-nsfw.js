/**
 * NOVA-MD — CMD/nsfw/demon-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'demon-nsfw',
    description: 'Envoie une image démon NSFW',
    usage: 'demon-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'demon-nsfw', 'Demon NSFW')
  }
}

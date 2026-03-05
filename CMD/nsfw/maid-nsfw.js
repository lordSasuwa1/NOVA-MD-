/**
 * NOVA-MD — CMD/nsfw/maid-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'maid-nsfw',
    description: 'Envoie une image maid NSFW',
    usage: 'maid-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'maid-nsfw', 'Maid NSFW')
  }
}

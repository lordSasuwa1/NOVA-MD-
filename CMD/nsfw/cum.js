/**
 * NOVA-MD — CMD/nsfw/cum.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'cum',
    description: 'Envoie une image cum',
    usage: 'cum',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'cum', 'Cum')
  }
}

/**
 * NOVA-MD — CMD/nsfw/futanari.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'futanari',
    description: 'Envoie une image futanari',
    usage: 'futanari',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'futanari', 'Futanari')
  }
}

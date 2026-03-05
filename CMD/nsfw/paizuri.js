/**
 * NOVA-MD — CMD/nsfw/paizuri.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'paizuri',
    description: 'Envoie une image paizuri',
    usage: 'paizuri',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'paizuri', 'Paizuri')
  }
}

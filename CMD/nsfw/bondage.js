/**
 * NOVA-MD — CMD/nsfw/bondage.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'bondage',
    description: 'Envoie une image bondage',
    usage: 'bondage',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'bondage', 'Bondage')
  }
}

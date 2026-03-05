/**
 * NOVA-MD — CMD/nsfw/femdom.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'femdom',
    description: 'Envoie une image femdom',
    usage: 'femdom',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'femdom', 'Femdom')
  }
}

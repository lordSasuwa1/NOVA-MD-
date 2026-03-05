/**
 * NOVA-MD — CMD/nsfw/ecchi.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'ecchi',
    description: 'Envoie une image ecchi',
    usage: 'ecchi',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'ecchi', 'Ecchi')
  }
}

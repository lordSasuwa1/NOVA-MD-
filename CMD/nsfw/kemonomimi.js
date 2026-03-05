/**
 * NOVA-MD — CMD/nsfw/kemonomimi.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'kemonomimi',
    description: 'Envoie une image kemonomimi',
    usage: 'kemonomimi',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'kemonomimi', 'Kemonomimi')
  }
}

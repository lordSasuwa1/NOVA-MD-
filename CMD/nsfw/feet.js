/**
 * NOVA-MD — CMD/nsfw/feet.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'feet',
    description: 'Envoie une image feet',
    usage: 'feet',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'feet', 'Feet')
  }
}

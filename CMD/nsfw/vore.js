/**
 * NOVA-MD — CMD/nsfw/vore.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'vore',
    description: 'Envoie une image vore',
    usage: 'vore',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'vore', 'Vore')
  }
}

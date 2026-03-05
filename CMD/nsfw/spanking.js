/**
 * NOVA-MD — CMD/nsfw/spanking.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'spanking',
    description: 'Envoie une image spanking',
    usage: 'spanking',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'spanking', 'Spanking')
  }
}

/**
 * NOVA-MD — CMD/nsfw/gangbang.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'gangbang',
    description: 'Envoie une image gangbang',
    usage: 'gangbang',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'gangbang', 'Gangbang')
  }
}

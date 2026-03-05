/**
 * NOVA-MD — CMD/nsfw/yuri.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'yuri',
    description: 'Envoie une image yuri (GL)',
    usage: 'yuri',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'yuri', 'Yuri')
  }
}

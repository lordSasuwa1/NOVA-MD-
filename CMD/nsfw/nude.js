/**
 * NOVA-MD — CMD/nsfw/nude.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'nude',
    description: 'Envoie une image nude',
    usage: 'nude',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'nude', 'Nude')
  }
}

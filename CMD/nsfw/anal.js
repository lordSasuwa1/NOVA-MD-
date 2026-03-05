/**
 * NOVA-MD — CMD/nsfw/anal.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'anal',
    description: 'Envoie une image anal',
    usage: 'anal',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'anal', 'Anal')
  }
}

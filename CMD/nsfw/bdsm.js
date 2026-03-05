/**
 * NOVA-MD — CMD/nsfw/bdsm.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'bdsm',
    description: 'Envoie une image BDSM',
    usage: 'bdsm',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'bdsm', 'BDSM')
  }
}

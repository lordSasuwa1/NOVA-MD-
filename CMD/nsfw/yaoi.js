/**
 * NOVA-MD — CMD/nsfw/yaoi.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'yaoi',
    description: 'Envoie une image yaoi (BL)',
    usage: 'yaoi',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'yaoi', 'Yaoi')
  }
}

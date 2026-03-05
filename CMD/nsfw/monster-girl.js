/**
 * NOVA-MD — CMD/nsfw/monster-girl.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'monster-girl',
    description: 'Envoie une image monster girl',
    usage: 'monster-girl',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'monster-girl', 'Monster Girl')
  }
}

/**
 * NOVA-MD — CMD/nsfw/creampie.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'creampie',
    description: 'Envoie une image creampie',
    usage: 'creampie',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'creampie', 'Creampie')
  }
}

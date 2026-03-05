/**
 * NOVA-MD — CMD/nsfw/domination.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'domination',
    description: 'Envoie une image domination',
    usage: 'domination',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'domination', 'Domination')
  }
}

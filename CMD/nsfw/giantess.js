/**
 * NOVA-MD — CMD/nsfw/giantess.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'giantess',
    description: 'Envoie une image giantess',
    usage: 'giantess',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'giantess', 'Giantess')
  }
}

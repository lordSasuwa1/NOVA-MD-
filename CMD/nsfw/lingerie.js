/**
 * NOVA-MD — CMD/nsfw/lingerie.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'lingerie',
    description: 'Envoie une image lingerie',
    usage: 'lingerie',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'lingerie', 'Lingerie')
  }
}

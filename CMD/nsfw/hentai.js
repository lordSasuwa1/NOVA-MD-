/**
 * NOVA-MD — CMD/nsfw/hentai.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'hentai',
    description: 'Envoie une image hentai aléatoire',
    usage: 'hentai',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'hentai', 'Hentai')
  }
}

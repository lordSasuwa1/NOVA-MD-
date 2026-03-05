/**
 * NOVA-MD — CMD/nsfw/nekohentai.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'nekohentai',
    description: 'Envoie une image neko hentai',
    usage: 'nekohentai',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'nekohentai', 'Neko Hentai')
  }
}

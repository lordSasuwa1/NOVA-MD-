/**
 * NOVA-MD — CMD/nsfw/hentai-gif.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'hentai-gif',
    description: 'Envoie un GIF hentai aléatoire',
    usage: 'hentai-gif',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'hentai-gif', 'Hentai GIF')
  }
}

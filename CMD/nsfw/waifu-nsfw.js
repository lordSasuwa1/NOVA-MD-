/**
 * NOVA-MD — CMD/nsfw/waifu-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'waifu-nsfw',
    description: 'Envoie une image waifu NSFW',
    usage: 'waifu-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'waifu-nsfw', 'Waifu NSFW')
  }
}

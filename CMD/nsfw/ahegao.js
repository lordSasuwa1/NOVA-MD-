/**
 * NOVA-MD — CMD/nsfw/ahegao.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'ahegao',
    description: 'Envoie une image ahegao',
    usage: 'ahegao',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'ahegao', 'Ahegao')
  }
}

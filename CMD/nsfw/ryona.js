/**
 * NOVA-MD — CMD/nsfw/ryona.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'ryona',
    description: 'Envoie une image ryona',
    usage: 'ryona',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'ryona', 'Ryona')
  }
}

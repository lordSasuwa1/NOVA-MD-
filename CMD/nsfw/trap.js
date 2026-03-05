/**
 * NOVA-MD — CMD/nsfw/trap.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'trap',
    description: 'Envoie une image trap',
    usage: 'trap',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'trap', 'Trap')
  }
}

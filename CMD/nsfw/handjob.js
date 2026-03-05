/**
 * NOVA-MD — CMD/nsfw/handjob.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'handjob',
    description: 'Envoie une image handjob',
    usage: 'handjob',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'handjob', 'Handjob')
  }
}

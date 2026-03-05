/**
 * NOVA-MD — CMD/nsfw/tentacle.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'tentacle',
    description: 'Envoie une image tentacle',
    usage: 'tentacle',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'tentacle', 'Tentacle')
  }
}

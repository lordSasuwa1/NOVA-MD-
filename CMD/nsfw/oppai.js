/**
 * NOVA-MD — CMD/nsfw/oppai.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'oppai',
    description: 'Envoie une image oppai',
    usage: 'oppai',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'oppai', 'Oppai')
  }
}

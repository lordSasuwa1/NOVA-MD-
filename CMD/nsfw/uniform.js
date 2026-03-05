/**
 * NOVA-MD — CMD/nsfw/uniform.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'uniform',
    description: 'Envoie une image uniform',
    usage: 'uniform',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'uniform', 'Uniform')
  }
}

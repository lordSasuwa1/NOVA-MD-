/**
 * NOVA-MD — CMD/nsfw/oral.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'oral',
    description: 'Envoie une image oral',
    usage: 'oral',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'oral', 'Oral')
  }
}

/**
 * NOVA-MD — CMD/nsfw/blowjob.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'blowjob',
    description: 'Envoie une image blowjob',
    usage: 'blowjob',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'blowjob', 'Blowjob')
  }
}

/**
 * NOVA-MD — CMD/nsfw/latex-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'latex-nsfw',
    description: 'Envoie une image latex NSFW',
    usage: 'latex-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'latex-nsfw', 'Latex NSFW')
  }
}

/**
 * NOVA-MD — CMD/nsfw/elf-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'elf-nsfw',
    description: 'Envoie une image elf NSFW',
    usage: 'elf-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'elf-nsfw', 'Elf NSFW')
  }
}

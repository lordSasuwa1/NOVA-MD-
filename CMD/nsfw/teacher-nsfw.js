/**
 * NOVA-MD — CMD/nsfw/teacher-nsfw.js
 */

const { executeNsfw } = require('./_nsfwHelper')

module.exports = {
  config: {
    name: 'teacher-nsfw',
    description: 'Envoie une image teacher NSFW',
    usage: 'teacher-nsfw',
    permission: 0,
    category: 'nsfw',
  },
  async execute(ctx, db) {
    await executeNsfw(ctx, db, 'teacher-nsfw', 'Teacher NSFW')
  }
}

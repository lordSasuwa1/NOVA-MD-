const { toBinary } = require('../../utils/helpers')
module.exports = {
  config: { name: 'binaire', aliases: ['binary'], description: 'Convertit du texte en binaire', usage: 'binaire <texte>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un texte. Ex: *!binaire NOVA*' })
    await ctx.reply({ text: `💻 *Binaire*\n\n${text}\n→ ${toBinary(text)}` })
  }
}
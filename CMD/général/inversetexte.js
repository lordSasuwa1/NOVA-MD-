const { reverseText } = require('../../utils/helpers')
module.exports = {
  config: { name: 'inversetexte', aliases: ['reverse'], description: 'Inverse un texte', usage: 'inversetexte <texte>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un texte.' })
    await ctx.reply({ text: `🔄 *Texte inversé*\n\n${reverseText(text)}` })
  }
}
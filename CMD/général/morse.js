const { toMorse } = require('../../utils/helpers')
module.exports = {
  config: { name: 'morse', description: 'Convertit du texte en code Morse', usage: 'morse <texte>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un texte. Ex: *!morse SOS*' })
    await ctx.reply({ text: `📡 *Morse*\n\n${text.toUpperCase()}\n→ ${toMorse(text)}` })
  }
}
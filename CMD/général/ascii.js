const figlet = require('figlet')
module.exports = {
  config: { name: 'ascii', description: 'Convertit du texte en art ASCII', usage: 'ascii <texte>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un texte. Ex: *!ascii NOVA*' })
    try {
      figlet(text.slice(0, 20), (err, result) => {
        if (err || !result) return ctx.reply({ text: '❌ Conversion ASCII échouée.' })
        ctx.reply({ text: `\`\`\`\n${result}\n\`\`\`` })
      })
    } catch {
      await ctx.reply({ text: '❌ Erreur ASCII.' })
    }
  }
}
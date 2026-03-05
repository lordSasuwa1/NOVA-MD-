module.exports = {
  config: { name: 'calc', aliases: ['calcul','math'], description: 'Calcule une expression mathématique', usage: 'calc <expression>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne une expression. Ex: *!calc 2 + 2 * 10*' })
    try {
      const sanitized = text.replace(/[^0-9+\-*/().\s%]/g, '')
      const result = Function(`"use strict"; return (${sanitized})`)()
      if (!isFinite(result)) throw new Error('Résultat infini')
      await ctx.reply({ text: `🧮 *Calcul*\n\n📝 ${sanitized}\n= *${result}*` })
    } catch {
      await ctx.reply({ text: '❌ Expression invalide.' })
    }
  }
}
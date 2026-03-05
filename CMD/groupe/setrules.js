/**
 * NOVA-MD — CMD/groupe/setrules.js
 */

module.exports = {
  config: { name: 'setrules', description: 'Définit les règles du groupe', usage: 'setrules <règles>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Écris les règles. Ex: *!setrules 1. Pas de spam\n2. Respectez-vous*' })
    db.groups.setRules(from, text)
    await ctx.react('✅')
    await ctx.reply({ text: '✅ Règles du groupe mises à jour !' })
  }
}
/**
 * NOVA-MD — CMD/groupe/rules.js
 */

module.exports = {
  config: { name: 'rules', aliases: ['regles','règles'], description: 'Affiche les règles du groupe', usage: 'rules', permission: 0, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, groupMetadata } = ctx
    const rules = db.groups.getRules(from)
    if (!rules) return ctx.reply({ text: '📋 Aucune règle définie. Un admin peut les définir avec *!setrules*' })
    await ctx.reply({ text: [`📋 *Règles — ${groupMetadata.subject}*`, ``, rules].join('\n') })
  }
}
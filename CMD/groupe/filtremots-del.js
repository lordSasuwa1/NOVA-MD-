/**
 * NOVA-MD — CMD/groupe/filtremots-del.js
 */

module.exports = {
  config: { name: 'filtremots-del', description: 'Retire un mot du filtre', usage: 'filtremots-del <mot>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un mot à supprimer.' })
    const settings = db.groups.getSettings(from)
    const liste = (settings.filtreMotsListe || []).filter(m => m !== text.toLowerCase().trim())
    db.groups.setSetting(from, 'filtreMotsListe', liste)
    await ctx.react('✅')
    await ctx.reply({ text: `✅ Mot *${text}* retiré du filtre.` })
  }
}
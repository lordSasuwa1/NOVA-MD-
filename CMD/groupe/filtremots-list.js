/**
 * NOVA-MD — CMD/groupe/filtremots-list.js
 */

module.exports = {
  config: { name: 'filtremots-list', description: 'Affiche la liste des mots filtrés', usage: 'filtremots-list', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from } = ctx
    const settings = db.groups.getSettings(from)
    const liste = settings.filtreMotsListe || []
    if (!liste.length) return ctx.reply({ text: '✅ Aucun mot custom filtré. Utilise *!filtremots <mot>* pour en ajouter.' })
    await ctx.reply({ text: [`🚫 *Mots filtrés* (${liste.length})`, ``, liste.map((m,i) => `${i+1}. ${m}`).join('\n')].join('\n') })
  }
}
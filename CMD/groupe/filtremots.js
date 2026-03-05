/**
 * NOVA-MD — CMD/groupe/filtremots.js
 */

module.exports = {
  config: { name: 'filtremots', description: 'Ajoute un mot à filtrer', usage: 'filtremots <mot>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un mot à filtrer. Ex: *!filtremots insulte*' })
    const settings = db.groups.getSettings(from)
    const liste = settings.filtreMotsListe || []
    const mot = text.toLowerCase().trim()
    if (liste.includes(mot)) return ctx.reply({ text: `⚠️ *${mot}* est déjà dans la liste.` })
    liste.push(mot)
    db.groups.setSetting(from, 'filtreMotsListe', liste)
    await ctx.react('✅')
    await ctx.reply({ text: `✅ Mot *${mot}* ajouté au filtre. Total : ${liste.length} mots filtrés.` })
  }
}
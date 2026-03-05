/**
 * NOVA-MD — CMD/groupe/setaurevoir.js
 */

module.exports = {
  config: { name: 'setaurevoir', description: 'Personnalise le message d'au revoir', usage: 'setaurevoir <message>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Écris le message. Variables : {nom} {groupe}' })
    db.groups.setGoodbye(from, text)
    db.groups.setSetting(from, 'goodbyeMsg', text)
    await ctx.react('✅')
    await ctx.reply({ text: '✅ Message d'au revoir personnalisé !' })
  }
}
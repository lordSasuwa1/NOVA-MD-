/**
 * NOVA-MD — CMD/groupe/antilink.js
 */

module.exports = {
  config: { name: 'antilink', description: 'Active/désactive l'anti-lien', usage: 'antilink <on/off> [strict]', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).antilink
      return ctx.reply({ text: `🔗 AntiLink : *${cur ? '✅ Activé' : '❌ Désactivé'}*\nUsage : *!antilink on/off [strict]*` })
    }
    const enable = state === 'on'
    const strict = args[1]?.toLowerCase() === 'strict'
    db.groups.setSetting(from, 'antilink', enable)
    if (strict) db.groups.setSetting(from, 'antilinkStrict', true)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `🔗 AntiLink *${enable ? 'activé' : 'désactivé'}`${strict ? ' (mode strict — tous les liens)' : ' (invitations WA uniquement)'}*` })
  }
}
/**
 * NOVA-MD — CMD/groupe/aurevoir.js
 */

module.exports = {
  config: { name: 'aurevoir', description: 'Active/désactive le message d'au revoir', usage: 'aurevoir <on/off>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).goodbye
      return ctx.reply({ text: `👋 Au revoir : *${cur ? '✅ Activé' : '❌ Désactivé'}*` })
    }
    const enable = state === 'on'
    db.groups.setSetting(from, 'goodbye', enable)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `👋 Message d'au revoir *${enable ? 'activé' : 'désactivé'}*.` })
  }
}
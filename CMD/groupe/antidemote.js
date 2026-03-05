/**
 * NOVA-MD — CMD/groupe/antidemote.js
 */

module.exports = {
  config: { name: 'antidemote', description: 'Active/désactive l'anti-démote', usage: 'antidemote <on/off>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).antidemote
      return ctx.reply({ text: `🛡️ AntiDémote : *${cur ? '✅ Activé' : '❌ Désactivé'}*` })
    }
    const enable = state === 'on'
    db.groups.setSetting(from, 'antidemote', enable)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `🛡️ AntiDémote *${enable ? 'activé — les admins démotés seront re-promus' : 'désactivé'}*.` })
  }
}
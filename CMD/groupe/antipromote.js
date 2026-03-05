/**
 * NOVA-MD — CMD/groupe/antipromote.js
 */

module.exports = {
  config: { name: 'antipromote', description: 'Active/désactive l'anti-promote', usage: 'antipromote <on/off>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).antipromote
      return ctx.reply({ text: `🛡️ AntiPromote : *${cur ? '✅ Activé' : '❌ Désactivé'}*` })
    }
    const enable = state === 'on'
    db.groups.setSetting(from, 'antipromote', enable)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `🛡️ AntiPromote *${enable ? 'activé — les promus non autorisés seront démotés' : 'désactivé'}*.` })
  }
}
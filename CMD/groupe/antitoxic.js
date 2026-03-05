/**
 * NOVA-MD — CMD/groupe/antitoxic.js
 */

module.exports = {
  config: { name: 'antitoxic', description: 'Active/désactive le filtre toxique', usage: 'antitoxic <on/off>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).antitoxic
      return ctx.reply({ text: `🤬 AntiToxic : *${cur ? '✅ Activé' : '❌ Désactivé'}*` })
    }
    const enable = state === 'on'
    db.groups.setSetting(from, 'antitoxic', enable)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `🤬 AntiToxic *${enable ? 'activé' : 'désactivé'}*.` })
  }
}
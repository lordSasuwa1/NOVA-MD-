/**
 * NOVA-MD — CMD/groupe/antispam.js
 */

module.exports = {
  config: { name: 'antispam', description: 'Active/désactive l'anti-spam', usage: 'antispam <on/off>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).antispam
      return ctx.reply({ text: `🤐 AntiSpam : *${cur ? '✅ Activé' : '❌ Désactivé'}*` })
    }
    const enable = state === 'on'
    db.groups.setSetting(from, 'antispam', enable)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `🤐 AntiSpam *${enable ? 'activé' : 'désactivé'}*.` })
  }
}
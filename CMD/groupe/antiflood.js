/**
 * NOVA-MD — CMD/groupe/antiflood.js
 */

module.exports = {
  config: { name: 'antiflood', description: 'Configure le seuil anti-flood', usage: 'antiflood <on/off> [nb_msgs]', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).antispam
      return ctx.reply({ text: `🌊 AntiFlood : *${cur ? '✅ Activé' : '❌ Désactivé'}*` })
    }
    const enable = state === 'on'
    const limit = parseInt(args[1]) || 5
    db.groups.setSetting(from, 'antispam', enable)
    db.groups.setSetting(from, 'spamLimit', limit)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `🌊 AntiFlood *${enable ? `activé (max ${limit} msgs/5s)` : 'désactivé'}*.` })
  }
}
/**
 * NOVA-MD — CMD/groupe/adminmode.js
 */

module.exports = {
  config: { name: 'adminmode', description: 'Active le mode admin (seuls les admins peuvent utiliser les commandes)', usage: 'adminmode <on/off>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).adminMode
      return ctx.reply({ text: `🔐 Mode Admin : *${cur ? '✅ Activé' : '❌ Désactivé'}*` })
    }
    const enable = state === 'on'
    db.groups.setSetting(from, 'adminMode', enable)
    await ctx.react(enable ? '🔐' : '🔓')
    await ctx.reply({ text: `🔐 Mode Admin *${enable ? 'activé — seuls les admins peuvent utiliser les commandes' : 'désactivé'}*.` })
  }
}
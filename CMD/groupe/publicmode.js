/**
 * NOVA-MD — CMD/groupe/publicmode.js
 */

module.exports = {
  config: { name: 'publicmode', description: 'Active/désactive le mode public du bot', usage: 'publicmode <on/off>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).publicMode !== false
      return ctx.reply({ text: `🌐 Mode Public : *${cur ? '✅ Activé' : '❌ Désactivé'}*` })
    }
    const enable = state === 'on'
    db.groups.setSetting(from, 'publicMode', enable)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `🌐 Mode Public *${enable ? 'activé — tout le monde peut utiliser les commandes' : 'désactivé — seuls les admins peuvent utiliser les commandes'}*.` })
  }
}
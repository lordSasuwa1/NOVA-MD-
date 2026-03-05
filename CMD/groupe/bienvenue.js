/**
 * NOVA-MD — CMD/groupe/bienvenue.js
 */

module.exports = {
  config: { name: 'bienvenue', description: 'Active/désactive le message de bienvenue', usage: 'bienvenue <on/off>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).welcome
      return ctx.reply({ text: `👋 Bienvenue : *${cur ? '✅ Activé' : '❌ Désactivé'}*\nModifie avec *!setbienvenue <message>*` })
    }
    const enable = state === 'on'
    db.groups.setSetting(from, 'welcome', enable)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `👋 Message de bienvenue *${enable ? 'activé' : 'désactivé'}*.` })
  }
}
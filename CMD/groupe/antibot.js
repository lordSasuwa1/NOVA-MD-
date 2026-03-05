/**
 * NOVA-MD — CMD/groupe/antibot.js
 */

module.exports = {
  config: { name: 'antibot', description: 'Active/désactive l'anti-bot', usage: 'antibot <on/off>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).antibot
      return ctx.reply({ text: `🤖 AntiBot : *${cur ? '✅ Activé' : '❌ Désactivé'}*` })
    }
    const enable = state === 'on'
    db.groups.setSetting(from, 'antibot', enable)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `🤖 AntiBot *${enable ? 'activé' : 'désactivé'}*.` })
  }
}
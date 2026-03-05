/**
 * NOVA-MD — CMD/groupe/antinsfw.js
 */

module.exports = {
  config: { name: 'antinsfw', description: 'Active/désactive le filtre NSFW', usage: 'antinsfw <on/off>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, args } = ctx
    const state = args[0]?.toLowerCase()
    if (!state || !['on','off'].includes(state)) {
      const cur = db.groups.getSettings(from).antinsfw
      return ctx.reply({ text: `🔞 AntiNSFW : *${cur ? '✅ Activé' : '❌ Désactivé'}*` })
    }
    const enable = state === 'on'
    db.groups.setSetting(from, 'antinsfw', enable)
    await ctx.react(enable ? '✅' : '❌')
    await ctx.reply({ text: `🔞 AntiNSFW *${enable ? 'activé' : 'désactivé'}*.` })
  }
}
/**
 * NOVA-MD — CMD/groupe/unban.js
 */

module.exports = {
  config: { name: 'unban', description: 'Lève le ban d'un membre', usage: 'unban @membre', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { mentionedJid, quotedSender } = ctx
    const target = mentionedJid?.[0] || quotedSender
    if (!target) return ctx.reply({ text: '⚠️ Mentionne un membre.' })
    db.users.unban(target)
    await ctx.react('✅')
    await ctx.reply({ text: `✅ Ban levé pour @${target.split('@')[0]}.`, mentions: [target] })
  }
}
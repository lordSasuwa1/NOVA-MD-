/**
 * NOVA-MD — CMD/groupe/unmute.js
 */

module.exports = {
  config: { name: 'unmute', description: 'Retire la sourdine d'un membre', usage: 'unmute @membre', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, mentionedJid, quotedSender } = ctx
    const target = mentionedJid?.[0] || quotedSender
    if (!target) return ctx.reply({ text: '⚠️ Mentionne un membre.' })
    db.groups.unmute(target, from)
    await ctx.react('🔊')
    await ctx.reply({ text: `🔊 @${target.split('@')[0]} n'est plus en sourdine.`, mentions: [target] })
  }
}
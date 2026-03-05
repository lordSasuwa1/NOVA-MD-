/**
 * NOVA-MD — CMD/groupe/mute.js
 */

module.exports = {
  config: { name: 'mute', description: 'Réduit au silence un membre (l'ignore)', usage: 'mute @membre', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, sender, mentionedJid, quotedSender } = ctx
    const target = mentionedJid?.[0] || quotedSender
    if (!target) return ctx.reply({ text: '⚠️ Mentionne un membre.' })
    if (target === sender) return ctx.reply({ text: '❌ Tu ne peux pas te muter toi-même.' })
    db.groups.mute(target, from, sender)
    await ctx.react('🔇')
    await ctx.reply({ text: `🔇 @${target.split('@')[0]} a été mis en sourdine.`, mentions: [target] })
  }
}
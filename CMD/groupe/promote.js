/**
 * NOVA-MD — CMD/groupe/promote.js
 */

module.exports = {
  config: { name: 'promote', aliases: ['admin'], description: 'Promeut un membre en admin', usage: 'promote @membre', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from, mentionedJid, quotedSender } = ctx
    const target = mentionedJid?.[0] || quotedSender
    if (!target) return ctx.reply({ text: '⚠️ Mentionne un membre.' })
    await sock.groupParticipantsUpdate(from, [target], 'promote')
    await ctx.reply({ text: `⬆️ @${target.split('@')[0]} est maintenant *admin* du groupe. 👑`, mentions: [target] })
  }
}
/**
 * NOVA-MD — CMD/groupe/kick.js
 */

module.exports = {
  config: { name: 'kick', aliases: ['expulser'], description: 'Expulse un membre du groupe', usage: 'kick @membre [raison]', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from, sender, mentionedJid, quotedSender, args } = ctx
    const target = mentionedJid?.[0] || quotedSender
    if (!target) return ctx.reply({ text: '⚠️ Mentionne un membre à expulser.' })
    if (target === sender) return ctx.reply({ text: '❌ Tu ne peux pas t'expulser toi-même.' })
    const reason = args.slice(1).join(' ') || 'Aucune raison'
    await sock.groupParticipantsUpdate(from, [target], 'remove')
    await ctx.reply({ text: `👢 @${target.split('@')[0]} a été expulsé.\n📝 Raison : ${reason}`, mentions: [target] })
  }
}
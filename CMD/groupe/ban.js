/**
 * NOVA-MD — CMD/groupe/ban.js
 */

module.exports = {
  config: { name: 'ban', description: 'Bannit un membre (expulse + blacklist)', usage: 'ban @membre [raison]', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from, sender, mentionedJid, quotedSender, args } = ctx
    const target = mentionedJid?.[0] || quotedSender
    if (!target) return ctx.reply({ text: '⚠️ Mentionne un membre à bannir.' })
    if (target === sender) return ctx.reply({ text: '❌ Impossible de te bannir toi-même.' })
    const reason = args.slice(1).join(' ') || 'Aucune raison'
    await sock.groupParticipantsUpdate(from, [target], 'remove')
    db.users.ban(target, reason, sender)
    await ctx.reply({ text: `🔨 @${target.split('@')[0]} a été banni.\n📝 Raison : ${reason}`, mentions: [target] })
  }
}
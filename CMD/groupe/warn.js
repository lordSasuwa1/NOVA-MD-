/**
 * NOVA-MD — CMD/groupe/warn.js
 */

module.exports = {
  config: { name: 'warn', description: 'Avertit un membre', usage: 'warn @membre [raison]', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { from, sender, mentionedJid, args, msg, sock } = ctx
    const target = mentionedJid?.[0] || ctx.quotedSender
    if (!target) return ctx.reply({ text: '⚠️ Mentionne un membre.' })
    if (target === sender) return ctx.reply({ text: '❌ Tu ne peux pas t'avertir toi-même.' })
    const reason = args.slice(1).join(' ') || 'Aucune raison précisée'
    const settings = db.groups.getSettings(from)
    const maxWarn = settings.maxWarn || 3
    const warns = db.groups.addGroupWarn(target, from)
    const { warnMsg } = require('../../utils/format')
    await sock.sendMessage(from, { text: warnMsg(target, reason, warns, maxWarn), mentions: [target] }, { quoted: msg })
    if (warns >= maxWarn) {
      await sock.groupParticipantsUpdate(from, [target], 'remove')
      await sock.sendMessage(from, { text: `🚫 @${target.split('@')[0]} a été expulsé après ${maxWarn} avertissements.`, mentions: [target] })
      db.groups.resetGroupWarns(target, from)
    }
  }
}
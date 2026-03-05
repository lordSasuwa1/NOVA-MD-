/**
 * NOVA-MD — CMD/groupe/warnreset.js
 */

module.exports = {
  config: { name: 'warnreset', description: 'Remet à zéro les avertissements d'un membre', usage: 'warnreset @membre', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { from, mentionedJid, quotedSender } = ctx
    const target = mentionedJid?.[0] || quotedSender
    if (!target) return ctx.reply({ text: '⚠️ Mentionne un membre.' })
    db.groups.resetGroupWarns(target, from)
    await ctx.react('✅')
    await ctx.reply({ text: `✅ Avertissements de @${target.split('@')[0]} remis à zéro.`, mentions: [target] })
  }
}
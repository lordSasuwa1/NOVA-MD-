/**
 * NOVA-MD — CMD/groupe/demote.js
 */

module.exports = {
  config: { name: 'demote', aliases: ['unadmin'], description: 'Retire les droits admin d'un membre', usage: 'demote @membre', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from, mentionedJid, quotedSender } = ctx
    const target = mentionedJid?.[0] || quotedSender
    if (!target) return ctx.reply({ text: '⚠️ Mentionne un admin.' })
    await sock.groupParticipantsUpdate(from, [target], 'demote')
    await ctx.reply({ text: `⬇️ @${target.split('@')[0]} n'est plus admin.`, mentions: [target] })
  }
}
/**
 * NOVA-MD — CMD/groupe/clear.js
 */

module.exports = {
  config: { name: 'clear', description: 'Expulse et réajoute tout le monde (purge)', usage: 'clear', permission: 4, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from, groupMetadata } = ctx
    const botJid = sock.user.id.replace(/:[0-9]+/, '') + '@s.whatsapp.net'
    const members = groupMetadata.participants
      .filter(p => !p.admin && p.id !== botJid)
      .map(p => p.id)
    if (!members.length) return ctx.reply({ text: '✅ Aucun membre non-admin à expulser.' })
    await ctx.reply({ text: `🧹 Purge en cours... ${members.length} membres` })
    for (const jid of members) {
      try { await sock.groupParticipantsUpdate(from, [jid], 'remove') } catch {}
      await new Promise(r => setTimeout(r, 500))
    }
    await ctx.reply({ text: `✅ Purge terminée. ${members.length} membres expulsés.` })
  }
}
/**
 * NOVA-MD — CMD/groupe/add.js
 */

module.exports = {
  config: { name: 'add', description: 'Ajoute un membre au groupe', usage: 'add <numéro>', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from, args } = ctx
    const number = args[0]?.replace(/[^0-9]/g, '')
    if (!number) return ctx.reply({ text: '⚠️ Donne un numéro. Ex: *!add 22900000000*' })
    const jid = number + '@s.whatsapp.net'
    try {
      await sock.groupParticipantsUpdate(from, [jid], 'add')
      await ctx.reply({ text: `✅ @${number} a été ajouté au groupe.`, mentions: [jid] })
    } catch { await ctx.reply({ text: `❌ Impossible d'ajouter ${number}. Vérifie le numéro.` }) }
  }
}
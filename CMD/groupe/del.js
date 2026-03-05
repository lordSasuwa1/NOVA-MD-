/**
 * NOVA-MD — CMD/groupe/del.js
 */

module.exports = {
  config: { name: 'del', aliases: ['delete','supprimer'], description: 'Supprime un message (en réponse)', usage: 'del (répondre au message)', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from, quoted, msg } = ctx
    if (!quoted) return ctx.reply({ text: '⚠️ Réponds au message à supprimer.' })
    const key = ctx.msg.message?.extendedTextMessage?.contextInfo?.stanzaId
    if (!key) return ctx.reply({ text: '❌ Impossible de supprimer ce message.' })
    try {
      await sock.sendMessage(from, { delete: { remoteJid: from, id: key, fromMe: false } })
      await ctx.react('🗑️')
    } catch { await ctx.reply({ text: '❌ Suppression échouée. Le bot doit être admin.' }) }
  }
}
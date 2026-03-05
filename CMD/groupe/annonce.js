/**
 * NOVA-MD — CMD/groupe/annonce.js
 */

module.exports = {
  config: { name: 'annonce', aliases: ['announce'], description: 'Envoie une annonce officielle au groupe', usage: 'annonce <message>', permission: 2, category: 'groupe', groupOnly: true },
  async execute(ctx, db) {
    const { sock, from, text, groupMetadata, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Écris le message d'annonce.' })
    const members = groupMetadata.participants.map(p => p.id)
    await sock.sendMessage(from, {
      text: [`📢 *ANNONCE OFFICIELLE*`, `━━━━━━━━━━━━━━━━`, ``, text, ``, `━━━━━━━━━━━━━━━━`, `— ${groupMetadata.subject}`].join('\n'),
      mentions: members
    }, { quoted: msg })
  }
}
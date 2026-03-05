/**
 * NOVA-MD — CMD/groupe/setpic.js
 */

module.exports = {
  config: { name: 'setpic', description: 'Change la photo du groupe', usage: 'setpic (envoyer/citer une image)', permission: 2, category: 'groupe', groupOnly: true, botAdmin: true },
  async execute(ctx, db) {
    const { sock, from, msg, msgType, quoted } = ctx
    const isImg = msgType === 'imageMessage' || quoted?.imageMessage
    if (!isImg) return ctx.reply({ text: '⚠️ Envoie ou cite une image.' })
    await ctx.react('🖼️')
    try {
      const { downloadMediaMessage } = require('@whiskeysockets/baileys')
      const source = msgType === 'imageMessage' ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      await sock.updateProfilePicture(from, buffer)
      await ctx.reply({ text: '✅ Photo du groupe mise à jour !' })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Impossible de changer la photo.' }) }
  }
}
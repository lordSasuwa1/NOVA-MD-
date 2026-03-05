const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const sharp = require('sharp')
module.exports = {
  config: { name: 'sticker', aliases: ['s','stick'], description: 'Convertit une image en sticker', usage: 'sticker (envoyer/citer une image)', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { sock, from, msg, msgType, quoted } = ctx
    const source = msgType === 'imageMessage' ? msg : quoted ? { message: quoted } : null
    if (!source) return ctx.reply({ text: '⚠️ Envoie ou cite une image avec la commande.' })
    await ctx.react('🎭')
    try {
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      const webp = await sharp(buffer).resize(512, 512, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } }).webp().toBuffer()
      await sock.sendMessage(from, { sticker: webp }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Impossible de créer le sticker.' })
    }
  }
}
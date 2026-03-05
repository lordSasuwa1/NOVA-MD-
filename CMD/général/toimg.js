const { downloadMediaMessage } = require('@whiskeysockets/baileys')
module.exports = {
  config: { name: 'toimg', aliases: ['toimage'], description: 'Convertit un sticker en image', usage: 'toimg (citer un sticker)', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { sock, from, msg, msgType, quoted } = ctx
    const isSticker = msgType === 'stickerMessage' || (quoted && quoted.stickerMessage)
    if (!isSticker) return ctx.reply({ text: '⚠️ Cite un sticker avec la commande.' })
    await ctx.react('🖼️')
    try {
      const source = msgType === 'stickerMessage' ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      const sharp = require('sharp')
      const img = await sharp(buffer).png().toBuffer()
      await sock.sendMessage(from, { image: img, caption: '🖼️ Sticker → Image' }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Conversion échouée.' })
    }
  }
}
const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const sharp = require('sharp')
module.exports = {
  config: { name: 'recadre', aliases: ['crop'], description: 'Recadre une image en carré', usage: 'recadre (citer image)', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { sock, from, msg, msgType, quoted } = ctx
    if (msgType !== 'imageMessage' && !quoted?.imageMessage) return ctx.reply({ text: '⚠️ Cite ou envoie une image.' })
    await ctx.react('✂️')
    try {
      const source = msgType === 'imageMessage' ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      const result = await sharp(buffer).resize(512, 512, { fit: 'cover' }).jpeg().toBuffer()
      await sock.sendMessage(from, { image: result, caption: '✂️ Image recadrée' }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Recadrage échoué.' })
    }
  }
}
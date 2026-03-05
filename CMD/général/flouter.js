const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const sharp = require('sharp')
module.exports = {
  config: { name: 'flouter', aliases: ['blur'], description: 'Floute une image', usage: 'flouter [intensité 1-20] (citer image)', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { sock, from, msg, msgType, quoted, args } = ctx
    if (msgType !== 'imageMessage' && !quoted?.imageMessage) return ctx.reply({ text: '⚠️ Cite ou envoie une image.' })
    const sigma = Math.min(20, Math.max(1, parseInt(args[0]) || 5))
    await ctx.react('🌫️')
    try {
      const source = msgType === 'imageMessage' ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      const result = await sharp(buffer).blur(sigma).jpeg().toBuffer()
      await sock.sendMessage(from, { image: result, caption: `🌫️ Flou : ${sigma}` }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Floutage échoué.' })
    }
  }
}
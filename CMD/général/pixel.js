const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const sharp = require('sharp')
module.exports = {
  config: { name: 'pixel', aliases: ['pixelate'], description: 'Pixélise une image', usage: 'pixel [taille 2-50] (citer image)', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { sock, from, msg, msgType, quoted, args } = ctx
    if (msgType !== 'imageMessage' && !quoted?.imageMessage) return ctx.reply({ text: '⚠️ Cite ou envoie une image.' })
    const size = Math.min(50, Math.max(2, parseInt(args[0]) || 10))
    await ctx.react('🖼️')
    try {
      const source = msgType === 'imageMessage' ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      const result = await sharp(buffer).resize(Math.floor(512/size), Math.floor(512/size), { fit: 'fill' }).resize(512, 512, { kernel: 'nearest' }).jpeg().toBuffer()
      await sock.sendMessage(from, { image: result, caption: '🎮 Image pixélisée' }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Pixélisation échouée.' })
    }
  }
}
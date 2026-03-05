const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const sharp = require('sharp')
module.exports = {
  config: { name: 'inverser', aliases: ['negate','invert'], description: 'Inverse les couleurs d'une image', usage: 'inverser (citer image)', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { sock, from, msg, msgType, quoted } = ctx
    if (msgType !== 'imageMessage' && !quoted?.imageMessage) return ctx.reply({ text: '⚠️ Cite ou envoie une image.' })
    await ctx.react('🌈')
    try {
      const source = msgType === 'imageMessage' ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      const result = await sharp(buffer).negate().jpeg().toBuffer()
      await sock.sendMessage(from, { image: result, caption: '🌈 Couleurs inversées' }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Inversion échouée.' })
    }
  }
}
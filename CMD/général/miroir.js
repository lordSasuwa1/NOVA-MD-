const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const sharp = require('sharp')
module.exports = {
  config: { name: 'miroir', aliases: ['flip','mirror'], description: 'Retourne une image en miroir', usage: 'miroir [h/v] (citer image)', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { sock, from, msg, msgType, quoted, args } = ctx
    if (msgType !== 'imageMessage' && !quoted?.imageMessage) return ctx.reply({ text: '⚠️ Cite ou envoie une image.' })
    const dir = (args[0] || 'h').toLowerCase()
    await ctx.react('🪞')
    try {
      const source = msgType === 'imageMessage' ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      const result = await sharp(buffer)[dir === 'v' ? 'flip' : 'flop']().jpeg().toBuffer()
      await sock.sendMessage(from, { image: result, caption: `🪞 Miroir ${dir === 'v' ? 'vertical' : 'horizontal'}` }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Miroir échoué.' })
    }
  }
}
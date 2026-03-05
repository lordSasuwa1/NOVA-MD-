const { downloadMediaMessage } = require('@whiskeysockets/baileys')
module.exports = {
  config: { name: 'rename', description: 'Renomme un sticker (auteur/pack)', usage: 'rename <auteur>|<pack> (citer sticker)', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { sock, from, msg, msgType, quoted, text } = ctx
    const isSticker = msgType === 'stickerMessage' || (quoted && quoted.stickerMessage)
    if (!isSticker) return ctx.reply({ text: '⚠️ Cite un sticker avec la commande.' })
    const [author = 'NOVA', packname = 'NOVA-MD'] = text.split('|')
    await ctx.react('✏️')
    try {
      const source = msgType === 'stickerMessage' ? msg : { message: quoted }
      const buffer = await downloadMediaMessage(source, 'buffer', {})
      await sock.sendMessage(from, { sticker: buffer, stickerAuthor: author.trim(), stickerName: packname.trim() }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Renommage échoué.' })
    }
  }
}
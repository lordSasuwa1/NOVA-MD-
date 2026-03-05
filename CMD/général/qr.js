const axios = require('axios')
module.exports = {
  config: { name: 'qr', description: 'Génère un QR code à partir d'un texte ou lien', usage: 'qr <texte/lien>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un texte ou lien. Ex: *!qr https://github.com*' })
    await ctx.react('📱')
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 })
      await sock.sendMessage(from, { image: Buffer.from(res.data), caption: `📱 *QR Code*\n${text.slice(0, 50)}` }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Impossible de générer le QR code.' })
    }
  }
}
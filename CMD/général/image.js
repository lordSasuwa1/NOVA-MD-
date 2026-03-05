const axios = require('axios')
module.exports = {
  config: { name: 'image', aliases: ['img','photo'], description: 'Recherche une image', usage: 'image <recherche>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un terme de recherche. Ex: *!image chat*' })
    await ctx.react('🔍')
    try {
      const res = await axios.get(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(text)}&client_id=V8qsb9qCHqmf3OmjBkFZXD8O6PEv-KHuUMVaBCVDi1E`, { timeout: 10000 })
      const imgUrl = res.data.urls?.regular || res.data.urls?.small
      const imgBuf = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 })
      await sock.sendMessage(from, { image: Buffer.from(imgBuf.data), caption: `🖼️ *${text}*\n📸 ${res.data.user?.name || ''}` }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Aucune image trouvée.' })
    }
  }
}
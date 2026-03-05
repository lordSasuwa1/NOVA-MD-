const axios = require('axios')
const config = require('../../config')
module.exports = {
  config: { name: 'gif', description: 'Recherche un GIF', usage: 'gif <recherche>', permission: 0, category: 'général' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un terme. Ex: *!gif danse*' })
    await ctx.react('🎬')
    try {
      const key = config.giphyApiKey || 'dc6zaTOxFJmzC'
      const res = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(text)}&limit=5`, { timeout: 10000 })
      const gifs = res.data.data
      if (!gifs.length) return ctx.reply({ text: '❌ Aucun GIF trouvé.' })
      const gif = gifs[Math.floor(Math.random() * gifs.length)]
      const url = gif.images.original.url
      const buf = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 })
      await sock.sendMessage(from, { video: Buffer.from(buf.data), gifPlayback: true, caption: `🎬 ${text}` }, { quoted: msg })
    } catch {
      await ctx.react('❌')
      await ctx.reply({ text: '❌ Impossible de trouver le GIF.' })
    }
  }
}
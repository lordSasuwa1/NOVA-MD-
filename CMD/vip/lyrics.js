/**
 * NOVA-MD — CMD/vip/lyrics.js
 */

const axios = require('axios')
module.exports = {
  config: { name: 'lyrics', aliases: ['paroles'], description: 'Trouve les paroles d'une chanson', usage: 'lyrics <titre> - <artiste>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Ex: *!lyrics Bohemian Rhapsody - Queen*' })
    await ctx.react('🎵')
    try {
      const [title, artist = ''] = text.split('-').map(s => s.trim())
      const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist || title)}/${encodeURIComponent(title)}`, { timeout: 15000 })
      const lyrics = res.data.lyrics?.slice(0, 3000) || 'Paroles introuvables.'
      await ctx.reply({ text: `🎵 *${title}${artist ? ' — ' + artist : ''}*\n\n${lyrics}` })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Paroles introuvables.' }) }
  }
}
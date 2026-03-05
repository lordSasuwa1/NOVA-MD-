/**
 * NOVA-MD — CMD/téléchargement/song.js
 */

const { ytAudio, ytInfo } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const axios = require('axios')
const fs = require('fs')
module.exports = {
  config: { name: 'song', aliases: ['chanson','music'], description: 'Recherche et télécharge une chanson par titre', usage: 'song <titre - artiste>', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un titre. Ex: *!song Afro B Drogba*' })
    await ctx.react('🎵')
    let f = null
    try {
      await ctx.reply({ text: `🔍 Recherche de *${text}*...` })
      const search = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(text + ' audio')}&sp=EgIQAQ%3D%3D`, { timeout: 10000 })
      const match = search.data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)
      if (!match) return ctx.reply({ text: '❌ Chanson introuvable.' })
      const ytUrl = `https://youtu.be/${match[1]}`
      const info = await ytInfo(ytUrl).catch(() => null)
      f = await ytAudio(ytUrl)
      await sock.sendMessage(from, {
        audio: fs.readFileSync(f),
        mimetype: 'audio/mp4',
        fileName: `${info?.title?.slice(0,50) || text}.mp3`
      }, { quoted: msg })
      db.settings.incrementStat('song_downloads')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Téléchargement échoué.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (f) cleanTemp(f) }
  }
}
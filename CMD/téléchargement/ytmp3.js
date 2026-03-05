/**
 * NOVA-MD — CMD/téléchargement/ytmp3.js
 */

const { ytAudio, ytInfo } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const { formatDuration } = require('../../utils/helpers')
const fs = require('fs')
module.exports = {
  config: { name: 'ytmp3', aliases: ['ytaudio','ytsong'], description: 'Télécharge l'audio d'une vidéo YouTube en MP3', usage: 'ytmp3 <url>', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien YouTube. Ex: *!ytmp3 https://youtube.com/...*' })
    await ctx.react('🎵')
    let filePath = null
    try {
      await ctx.reply({ text: '⏳ Extraction audio en cours...' })
      const info = await ytInfo(text).catch(() => null)
      filePath = await ytAudio(text)
      const buf = fs.readFileSync(filePath)
      const caption = info ? `🎵 *${info.title}*\n👤 ${info.uploader || ''}` : '🎵 Audio extrait !'
      await sock.sendMessage(from, { audio: buf, mimetype: 'audio/mp4', fileName: `${info?.title?.slice(0,50) || 'audio'}.mp3` }, { quoted: msg })
      db.settings.incrementStat('ytmp3_downloads')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Extraction audio échouée.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (filePath) cleanTemp(filePath) }
  }
}
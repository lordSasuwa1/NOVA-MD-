/**
 * NOVA-MD — CMD/téléchargement/yt.js
 */

const { ytVideo, ytInfo } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const { formatDuration } = require('../../utils/helpers')
const fs = require('fs')
module.exports = {
  config: { name: 'yt', aliases: ['youtube','ytdl'], description: 'Télécharge une vidéo YouTube', usage: 'yt <url ou recherche> [qualité: 360/480/720]', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, args, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien YouTube. Ex: *!yt https://youtube.com/...*' })
    const quality = ['360','480','720'].includes(args[args.length-1]) ? args[args.length-1] : '480'
    const url = text.replace(quality,'').trim()
    await ctx.react('📥')
    let filePath = null
    try {
      await ctx.reply({ text: `⏳ Téléchargement en cours (${quality}p)...` })
      const info = await ytInfo(url).catch(() => null)
      filePath = await ytVideo(url, { quality })
      const buf = fs.readFileSync(filePath)
      const caption = info ? `🎬 *${info.title}*\n⏱️ ${formatDuration((info.duration||0)*1000)} | 👁️ ${(info.view_count||0).toLocaleString()} vues` : '🎬 Voici ta vidéo !'
      await sock.sendMessage(from, { video: buf, caption }, { quoted: msg })
      db.settings.incrementStat('yt_downloads')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Téléchargement échoué.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (filePath) cleanTemp(filePath) }
  }
}
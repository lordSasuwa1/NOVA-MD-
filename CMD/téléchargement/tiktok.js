/**
 * NOVA-MD — CMD/téléchargement/tiktok.js
 */

const { tiktok } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'tiktok', aliases: ['tt','tik'], description: 'Télécharge une vidéo TikTok sans watermark', usage: 'tiktok <url>', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien TikTok. Ex: *!tiktok https://tiktok.com/...*' })
    await ctx.react('🎵')
    let f = null
    try {
      await ctx.reply({ text: '⏳ Téléchargement TikTok en cours...' })
      f = await tiktok(text)
      await sock.sendMessage(from, { video: fs.readFileSync(f), caption: '🎵 *TikTok* — sans watermark ✅' }, { quoted: msg })
      db.settings.incrementStat('tiktok_downloads')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Téléchargement TikTok échoué.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (f) cleanTemp(f) }
  }
}
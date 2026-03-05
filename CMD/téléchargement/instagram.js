/**
 * NOVA-MD — CMD/téléchargement/instagram.js
 */

const { instagram } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'instagram', aliases: ['ig','insta'], description: 'Télécharge un post Instagram', usage: 'instagram <url>', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien Instagram. Ex: *!instagram https://instagram.com/p/...*' })
    await ctx.react('📸')
    let f = null
    try {
      await ctx.reply({ text: '⏳ Téléchargement Instagram en cours...' })
      f = await instagram(text)
      const buf = fs.readFileSync(f)
      const isVideo = f.endsWith('.mp4')
      await sock.sendMessage(from, isVideo
        ? { video: buf, caption: '📸 *Instagram* — vidéo téléchargée ✅' }
        : { image: buf, caption: '📸 *Instagram* — image téléchargée ✅' },
        { quoted: msg })
      db.settings.incrementStat('instagram_downloads')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Téléchargement Instagram échoué.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (f) cleanTemp(f) }
  }
}
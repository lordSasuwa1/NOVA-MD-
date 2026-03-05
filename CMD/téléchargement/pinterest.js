/**
 * NOVA-MD — CMD/téléchargement/pinterest.js
 */

const { pinterest } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'pinterest', aliases: ['pin'], description: 'Télécharge une image/vidéo Pinterest', usage: 'pinterest <url>', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien Pinterest. Ex: *!pinterest https://pin.it/...*' })
    await ctx.react('📌')
    let f = null
    try {
      await ctx.reply({ text: '⏳ Téléchargement Pinterest en cours...' })
      f = await pinterest(text)
      const buf = fs.readFileSync(f)
      const isVideo = f.endsWith('.mp4')
      await sock.sendMessage(from, isVideo
        ? { video: buf, caption: '📌 *Pinterest* — vidéo téléchargée ✅' }
        : { image: buf, caption: '📌 *Pinterest* — image téléchargée ✅' },
        { quoted: msg })
      db.settings.incrementStat('pinterest_downloads')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Téléchargement Pinterest échoué.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (f) cleanTemp(f) }
  }
}
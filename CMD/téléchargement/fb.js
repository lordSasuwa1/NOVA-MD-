/**
 * NOVA-MD — CMD/téléchargement/fb.js
 */

const { facebook } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'fb', aliases: ['facebook','fbdl'], description: 'Télécharge une vidéo Facebook', usage: 'fb <url>', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien Facebook. Ex: *!fb https://facebook.com/...*' })
    await ctx.react('📘')
    let f = null
    try {
      await ctx.reply({ text: '⏳ Téléchargement Facebook en cours...' })
      f = await facebook(text)
      await sock.sendMessage(from, { video: fs.readFileSync(f), caption: '📘 *Facebook* — vidéo téléchargée ✅' }, { quoted: msg })
      db.settings.incrementStat('fb_downloads')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Téléchargement Facebook échoué.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (f) cleanTemp(f) }
  }
}
/**
 * NOVA-MD — CMD/téléchargement/twitter.js
 */

const { twitter } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'twitter', aliases: ['tw','x','xdl'], description: 'Télécharge une vidéo Twitter/X', usage: 'twitter <url>', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien Twitter/X. Ex: *!twitter https://x.com/...*' })
    await ctx.react('🐦')
    let f = null
    try {
      await ctx.reply({ text: '⏳ Téléchargement Twitter/X en cours...' })
      f = await twitter(text)
      await sock.sendMessage(from, { video: fs.readFileSync(f), caption: '🐦 *Twitter/X* — vidéo téléchargée ✅' }, { quoted: msg })
      db.settings.incrementStat('twitter_downloads')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Téléchargement Twitter échoué.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (f) cleanTemp(f) }
  }
}
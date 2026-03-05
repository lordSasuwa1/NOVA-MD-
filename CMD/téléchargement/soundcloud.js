/**
 * NOVA-MD — CMD/téléchargement/soundcloud.js
 */

const { soundcloud } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'soundcloud', aliases: ['sc'], description: 'Télécharge une piste SoundCloud', usage: 'soundcloud <url>', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien SoundCloud. Ex: *!soundcloud https://soundcloud.com/...*' })
    await ctx.react('🎵')
    let f = null
    try {
      await ctx.reply({ text: '⏳ Téléchargement SoundCloud en cours...' })
      f = await soundcloud(text)
      await sock.sendMessage(from, { audio: fs.readFileSync(f), mimetype: 'audio/mp4' }, { quoted: msg })
      db.settings.incrementStat('soundcloud_downloads')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Téléchargement SoundCloud échoué.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (f) cleanTemp(f) }
  }
}
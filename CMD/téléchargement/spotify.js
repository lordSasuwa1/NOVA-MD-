/**
 * NOVA-MD — CMD/téléchargement/spotify.js
 */

const { spotify } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'spotify', aliases: ['spot'], description: 'Télécharge une piste Spotify', usage: 'spotify <url>', permission: 0, category: 'téléchargement' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien Spotify. Ex: *!spotify https://open.spotify.com/track/...*' })
    await ctx.react('🎧')
    let f = null
    try {
      await ctx.reply({ text: '⏳ Téléchargement Spotify en cours...' })
      f = await spotify(text)
      await sock.sendMessage(from, { audio: fs.readFileSync(f), mimetype: 'audio/mp4' }, { quoted: msg })
      db.settings.incrementStat('spotify_downloads')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply({ text: `❌ Téléchargement Spotify échoué. Vérifie que spotdl est installé.\n${err.message?.slice(0,100) || ''}` })
    } finally { if (f) cleanTemp(f) }
  }
}
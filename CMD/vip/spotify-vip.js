/**
 * NOVA-MD — CMD/vip/spotify-vip.js
 */

const { spotify } = require('../../utils/downloader')
const { cleanTemp } = require('../../utils/media')
const fs = require('fs')
module.exports = {
  config: { name: 'spotify-vip', description: 'Télécharge une piste Spotify (VIP)', usage: 'spotify-vip <url>', permission: 3, category: 'vip' },
  async execute(ctx, db) {
    const { text, sock, from, msg } = ctx
    if (!text) return ctx.reply({ text: '⚠️ Donne un lien Spotify.' })
    await ctx.react('🎧')
    let f = null
    try {
      f = await spotify(text)
      await sock.sendMessage(from, { audio: fs.readFileSync(f), mimetype: 'audio/mp4' }, { quoted: msg })
    } catch { await ctx.react('❌'); await ctx.reply({ text: '❌ Téléchargement Spotify échoué.' }) }
    finally { if (f) cleanTemp(f) }
  }
}